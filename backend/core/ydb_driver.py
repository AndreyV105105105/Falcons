import os
import ydb
import uuid
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64
import hashlib
from core.generator import calculate_entropy

# Глобальные объекты
_driver = None
_pool = None

# Переменные окружения
YDB_ENDPOINT = os.getenv("YDB_ENDPOINT")
YDB_DATABASE = os.getenv("YDB_DATABASE")


def init_db():
    """
    Инициализируем подключение к YDB.
    Вызывается один раз при старте функции.
    """
    global _driver, _pool

    if _pool is not None:
        return _driver, _pool

    credentials = ydb.credentials_from_env_variables()

    driver_config = ydb.DriverConfig(
        endpoint=YDB_ENDPOINT,
        database=YDB_DATABASE,
        credentials=credentials,
    )
    _driver = ydb.Driver(driver_config)
    _driver.wait(timeout=15)
    _pool = ydb.SessionPool(_driver)

    return _driver, _pool

# =============================================================================
# СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЕЙ
# =============================================================================

def find_user_by_email(email):
    """
    Найти пользователя по email.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $email AS Utf8;

        SELECT id, username, password_hash, keyword_hash, keyword_salt, createdAt
        FROM users
        WHERE username = $email;
        """
        prepared_query = session.prepare(query_text)

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$email": email},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            row = result_sets[0].rows[0]
            # YDB сама вернет нормальные строки при использовании Utf8
            return {
                "id": row.id,
                "email": row.username,
                "password_hash": row.password_hash,
                "keyword_hash": row.keyword_hash,
                "keyword_salt": row.keyword_salt,
                "createdAt": row.createdAt
            }
        return None

    return _pool.retry_operation_sync(query_callee)


def find_user_by_id(user_id):
    """
    Найти пользователя по ID.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $id AS Utf8;

        SELECT id, username, password_hash, keyword_hash, keyword_salt, createdAt
        FROM users
        WHERE id = $id;
        """
        prepared_query = session.prepare(query_text)

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$id": user_id},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            row = result_sets[0].rows[0]
            return {
                "id": row.id,
                "email": row.username,
                "password_hash": row.password_hash,
                "keyword_hash": row.keyword_hash,
                "keyword_salt": row.keyword_salt,
                "createdAt": row.createdAt
            }
        return None

    return _pool.retry_operation_sync(query_callee)


def create_user_in_db(email, password_hash, keyword_hash=None, keyword_salt=None):
    """
    Создать нового пользователя в БД.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        user_id = str(uuid.uuid4())

        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $email AS Utf8;
        DECLARE $password_hash AS Utf8;
        DECLARE $keyword_hash AS Utf8;
        DECLARE $keyword_salt AS Utf8;

        INSERT INTO users (id, username, password_hash, keyword_hash, keyword_salt, createdAt)
        VALUES ($id, $email, $password_hash, $keyword_hash, $keyword_salt, CurrentUtcTimestamp());
        """

        prepared_query = session.prepare(query_text)

        session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {
                "$id": user_id,
                "$email": email,
                "$password_hash": password_hash,
                "$keyword_hash": keyword_hash or "",
                "$keyword_salt": keyword_salt or "",
            },
            commit_tx=True,
        )
        return user_id

    return _pool.retry_operation_sync(query_callee)


# =============================================================================
# СОХРАНЕНИ ПРЕСЕТОВ ПОЛЬЗОВАТЕЛЕЙ
# =============================================================================

def save_user_preset(user_id, profile_name, settings):
    """
    Сохранение настроек пользователя.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        preset_id = str(uuid.uuid4())

        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $user_id AS Utf8;
        DECLARE $profile_name AS Utf8;
        DECLARE $password_length AS Int32;
        DECLARE $use_uppercase AS Bool;
        DECLARE $use_lowercase AS Bool;
        DECLARE $use_numbers AS Bool;
        DECLARE $use_symbols AS Bool;
        DECLARE $exclude_ambiguous AS Bool;

        INSERT INTO user_settings (
            id, user_id, profile_name, password_length,
            use_uppercase, use_lowercase, use_numbers, use_symbols,
            exclude_ambiguous, updatedAt
        )
        VALUES (
            $id, $user_id, $profile_name, $password_length,
            $use_uppercase, $use_lowercase, $use_numbers, $use_symbols,
            $exclude_ambiguous, CurrentUtcTimestamp()
        );
        """

        prepared_query = session.prepare(query_text)

        session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {
                "$id": preset_id,
                "$user_id": user_id,
                "$profile_name": profile_name,
                "$password_length": settings.get("password_length", 16),
                "$use_uppercase": settings.get("use_uppercase", True),
                "$use_lowercase": settings.get("use_lowercase", True),
                "$use_numbers": settings.get("use_numbers", True),
                "$use_symbols": settings.get("use_symbols", True),
                "$exclude_ambiguous": settings.get("exclude_ambiguous", False),
            },
            commit_tx=True,
        )
        return preset_id

    return _pool.retry_operation_sync(query_callee)


def get_user_presets(user_id):
    """
    Получить все пресеты пользователя.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $user_id AS Utf8;

        SELECT id, user_id, profile_name, password_length,
               use_uppercase, use_lowercase, use_numbers, use_symbols,
               exclude_ambiguous, updatedAt
        FROM user_settings
        WHERE user_id = $user_id;
        """

        prepared_query = session.prepare(query_text)

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$user_id": user_id},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            return [
                {
                    "id": row.id,
                    "user_id": row.user_id,
                    "profile_name": row.profile_name,
                    "password_length": row.password_length,
                    "use_uppercase": row.use_uppercase,
                    "use_lowercase": row.use_lowercase,
                    "use_numbers": row.use_numbers,
                    "use_symbols": row.use_symbols,
                    "exclude_ambiguous": row.exclude_ambiguous,
                    "updatedAt": row.updatedAt
                }
                for row in result_sets[0].rows
            ]
        return []

    return _pool.retry_operation_sync(query_callee)


def delete_user_preset(preset_id, user_id):
    """
    Удалить пресет пользователя.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $user_id AS Utf8;

        DELETE FROM user_settings
        WHERE id = $id AND user_id = $user_id;
        """

        prepared_query = session.prepare(query_text)

        session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {
                "$id": preset_id,
                "$user_id": user_id,
            },
            commit_tx=True,
        )
        return True

    return _pool.retry_operation_sync(query_callee)


# =============================================================================
# СОХРАНЕНИЕ ПАРОЛЕЙ
# =============================================================================

def _derive_key_from_keyword(keyword, salt):
    """Извлечение ключа шифрования из ключевого слова + соли, используя PBKDF2"""
    return hashlib.pbkdf2_hmac(
        'sha256',
        keyword.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    )


def save_user_password(user_id, title, password, keyword):
    """
    Сохраняем зашифрованный пароль в хранилище.
    """
    if _pool is None:
        init_db()

    # Получаем keyword_salt из БД (по ID пользователя)
    user = find_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")

    keyword_salt = user.get('keyword_salt') or str(uuid.uuid4())
    encryption_key = _derive_key_from_keyword(keyword, keyword_salt)

    # Шифруем пароль (AES-256-GCM)
    aesgcm = AESGCM(encryption_key)
    nonce = os.urandom(12)  # 96-bit nonce for GCM
    encrypted_data = aesgcm.encrypt(nonce, password.encode('utf-8'), None)

    # Оценка надёжности через функцию Андрея
    entropy_data = calculate_entropy(password)
    strength_score = int(entropy_data['score'])

    def query_callee(session):
        password_id = str(uuid.uuid4())

        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $user_id AS Utf8;
        DECLARE $title AS Utf8;
        DECLARE $encrypted_data AS Utf8;
        DECLARE $iv AS Utf8;
        DECLARE $auth_tag AS Utf8;
        DECLARE $strength_score AS Int32;


        INSERT INTO saved_passwords (
            id, user_id, title, encrypted_data, iv, auth_tag,
            strength_score, createdAt
        )
        VALUES (
            $id, $user_id, $title, $encrypted_data, $iv, $auth_tag,
            $strength_score, CurrentUtcTimestamp()
        );
        """

        prepared_query = session.prepare(query_text)

        # Разделяем ciphertext и auth_tag
        ciphertext = encrypted_data[:-16]
        auth_tag_bytes = encrypted_data[-16:]

        session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {
                "$id": password_id,
                "$user_id": user_id,
                "$title": title,
                "$encrypted_data": base64.b64encode(ciphertext).decode('utf-8'),
                "$iv": base64.b64encode(nonce).decode('utf-8'),
                "$auth_tag": base64.b64encode(auth_tag_bytes).decode('utf-8'),
                "$strength_score": strength_score,
            },
            commit_tx=True,
        )
        return password_id

    return _pool.retry_operation_sync(query_callee)


def get_user_passwords(user_id):
    """Получаем список сохранённых паролей пользователя (без расшифровки)"""
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $user_id AS Utf8;

        SELECT id, title, strength_score, createdAt
        FROM saved_passwords
        WHERE user_id = $user_id;
        """

        prepared_query = session.prepare(query_text)

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$user_id": user_id},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            return [
                {
                    "id": row.id,
                    "title": row.title,
                    "strength_score": row.strength_score,
                    "createdAt": row.createdAt
                }
                for row in result_sets[0].rows
            ]
        return []

    return _pool.retry_operation_sync(query_callee)


def decrypt_user_password(password_id, user_id, keyword):
    """
    Расшифровываем конкретный пароль (для этого требуется ключевое слово).
    """
    if _pool is None:
        init_db()

    def query_callee_get(session):
        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $user_id AS Utf8;

        SELECT sp.encrypted_data, sp.iv, sp.auth_tag, u.keyword_salt
        FROM saved_passwords sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.id = $id AND sp.user_id = $user_id;
        """

        prepared_query = session.prepare(query_text)

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$id": password_id, "$user_id": user_id},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            row = result_sets[0].rows[0]
            return {
                "encrypted_data": row.encrypted_data,
                "iv": row.iv,
                "auth_tag": row.auth_tag,
                "keyword_salt": row.keyword_salt
            }
        return None

    data = _pool.retry_operation_sync(query_callee_get)

    if not data:
        raise ValueError("Password not found or access denied")

    # Деривируем ключ и расшифровываем
    encryption_key = _derive_key_from_keyword(keyword, data['keyword_salt'])
    aesgcm = AESGCM(encryption_key)

    encrypted_data = base64.b64decode(data['encrypted_data'])
    nonce = base64.b64decode(data['iv'])
    auth_tag = base64.b64decode(data['auth_tag'])

    try:
        decrypted = aesgcm.decrypt(nonce, encrypted_data + auth_tag, None)
        return decrypted.decode('utf-8')
    except Exception:
        raise ValueError("Invalid keyword (decryption failed)")


def delete_user_password(password_id, user_id):
    """
    Удаление сохранённого пароля.
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query_text = """
        DECLARE $id AS Utf8;
        DECLARE $user_id AS Utf8;

        DELETE FROM saved_passwords
        WHERE id = $id AND user_id = $user_id;
        """

        prepared_query = session.prepare(query_text)

        session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            {"$id": password_id, "$user_id": user_id},
            commit_tx=True,
        )
        return True

    return _pool.retry_operation_sync(query_callee)
