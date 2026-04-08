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
        # ТУТ ИСПРАВЛЕНИЕ: кодируем строку в байты
        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            query,
            {"$email": email.encode('utf-8')},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            row = result_sets[0].rows[0]
            return {
                "id": row.id.decode('utf-8') if isinstance(row.id, bytes) else row.id,
                "email": row.username.decode('utf-8') if isinstance(row.username, bytes) else row.username,
                "password_hash": row.password_hash.decode('utf-8') if isinstance(row.password_hash, bytes) else row.password_hash,
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

        query = """
            DECLARE $id AS String;
            DECLARE $email AS String;
            DECLARE $password_hash AS String;
            DECLARE $keyword_hash AS String;
            DECLARE $keyword_salt AS String;

            INSERT INTO users (id, username, password_hash, keyword_hash, keyword_salt, createdAt)
            VALUES ($id, $email, $password_hash, $keyword_hash, $keyword_salt, CurrentUtcTimestamp());
        """

        # кодируем все строки в байты
        session.transaction(ydb.SerializableReadWrite()).execute(
            query,
            {
                "$id": user_id.encode('utf-8'),
                "$email": email.encode('utf-8'),
                "$password_hash": password_hash.encode('utf-8'),
                "$keyword_hash": (keyword_hash or "").encode('utf-8'),
                "$keyword_salt": (keyword_salt or "").encode('utf-8'),
            },
            commit_tx=True,
            )
        return user_id

    return _pool.retry_operation_sync(query_callee)