import os
import ydb
import uuid

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

def find_user_by_email(email):
    """
    Найти пользователя по email.

    Возвращает dict с данными пользователя или None, если пользователь не найден
    """

    if _pool is None:
        init_db()

    def query_callee(session):
        query = """
        DECLARE $email AS String;

        SELECT id, username, password_hash, keyword_hash, keyword_salt, createdAt
        FROM users
        WHERE username = $email;
        """
        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            query,
            {"$email": email},
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
    Возвращает: user_id (строка UUID)
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        user_id = str(uuid.uuid4())

        query = """
            DECLARE $id AS String;
            DECLARE $email AS String;
            DECLARE $password_hash AS String;
            DECLARE $keyword_hash AS String;
            DECLARE $keyword_salt AS String;

            INSERT INTO users (id, username, password_hash, keyword_hash, keyword_salt, createdAt)
            VALUES ($id, $email, $password_hash, $keyword_hash, $keyword_salt, CurrentUtcTimestamp());
        """

        session.transaction(ydb.SerializableReadWrite()).execute(
            query,
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


def save_user_preset(user_id, profile_name, settings):
    """
    Сохранение настроек пользователя.

    Args:
        user_id (str): ID пользователя
        profile_name (str): Название пресета (например, "Для банков" или "Для соцсетей")
        settings (dict): Настройки генерации
            {
                "password_length": 16,
                "use_uppercase": True,
                "use_lowercase": True,
                "use_numbers": True,
                "use_symbols": False,
                "exclude_ambiguous": True,
                "custom_symbols": ""
            }

    Returns:
        str: preset_id (UUID)
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        preset_id = str(uuid.uuid4())

        query = """
        DECLARE $id AS String;
        DECLARE $user_id AS String;
        DECLARE $profile_name AS String;
        DECLARE $password_length AS Int32;
        DECLARE $use_uppercase AS Bool;
        DECLARE $use_lowercase AS Bool;
        DECLARE $use_numbers AS Bool;
        DECLARE $use_symbols AS Bool;
        DECLARE $exclude_ambiguous AS Bool;
        DECLARE $custom_symbols AS String;

        INSERT INTO user_settings (
            id, user_id, profile_name, password_length,
            use_uppercase, use_lowercase, use_numbers, use_symbols,
            exclude_ambiguous, custom_symbols, updatedAt
        )
        VALUES (
            $id, $user_id, $profile_name, $password_length,
            $use_uppercase, $use_lowercase, $use_numbers, $use_symbols,
            $exclude_ambiguous, $custom_symbols, CurrentUtcTimestamp()
        );
        """

        session.transaction(ydb.SerializableReadWrite()).execute(
            query,
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
                "$custom_symbols": settings.get("custom_symbols", ""),
            },
            commit_tx=True,
        )
        return preset_id

    return _pool.retry_operation_sync(query_callee)


def get_user_presets(user_id):
    """
    Получить все пресеты пользователя.

    Args:
        user_id (str): ID пользователя

    Returns:
        list: Список пресетов (в формате dict)
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query = """
        DECLARE $user_id AS String;

        SELECT * FROM user_settings
        WHERE user_id = $user_id;
        """

        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            query,
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
                    "custom_symbols": row.custom_symbols,
                    "updatedAt": row.updatedAt
                }
                for row in result_sets[0].rows
            ]
        return []

    return _pool.retry_operation_sync(query_callee)


def delete_user_preset(preset_id, user_id):
    """
    Удалить пресет пользователя.

    Args:
        preset_id (str): ID пресета
        user_id (str): ID пользователя (для проверки прав)

    Returns:
        bool: True если удалено
    """
    if _pool is None:
        init_db()

    def query_callee(session):
        query = """
        DECLARE $id AS String;
        DECLARE $user_id AS String;

        DELETE FROM user_settings
        WHERE id = $id AND user_id = $user_id;
        """

        session.transaction(ydb.SerializableReadWrite()).execute(
            query,
            {
                "$id": preset_id,
                "$user_id": user_id,
            },
            commit_tx=True,
        )
        return True

    return _pool.retry_operation_sync(query_callee)