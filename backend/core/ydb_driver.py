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
        # Уже инициализировано (warm start)
        return _driver, _pool

    credentials = ydb.credentials_from_env_variables()

    driver_config = ydb.DriverConfig(
        endpoint=YDB_ENDPOINT,
        database=YDB_DATABASE,
        credentials=credentials,
    )
    _driver = ydb.Driver(driver_config)
    _driver.wait(timeout=15)
    _pool = ydb.SessionPool(driver)

    return _driver, _pool

def find_user_by_email(email):
    # TODO: Здесь будет YQL-запрос к YDB от Миши
    # Пока возвращаем None, как будто такого юзера нет
    return None

def create_user_in_db(email, password_hash):
    # TODO: Здесь будет YQL-запрос к YDB от Миши
    # Пока просто генерируем фейковый ID для теста
    return str(uuid.uuid4())



def test_write_read():
    """
    ТЕСТОВАЯ ФУНКЦИЯ.

    Что делает:
    1. Вставляет тестовую запись в таблицу users
    2. Читает её обратно
    3. Возвращает результат (успех/ошибка)
    """

    def query_callee(session):
        # ВСТАВКА тестовой строки
        session.transaction(ydb.SerializableReadWrite()).execute(
            """
            DECLARE $id AS String;
            DECLARE $username AS String;

            INSERT INTO users (id, username, password_hash, keyword_hash, keyword_salt, createdAt)
            VALUES ($id, $username, 'test_hash', 'test_hash', 'test_salt', CurrentUtcTimestamp());
            """,
            {
                "$id": "test-id-123",
                "$username": "test_user_week1",
            },
            commit_tx=True,
        )

        # ЧТЕНИЕ тестовой строки
        result_sets = session.transaction(ydb.SerializableReadWrite()).execute(
            """
            DECLARE $username AS String;

            SELECT * FROM users WHERE username = $username;
            """,
            {"$username": "test_user_week1"},
            commit_tx=True,
        )

        if result_sets and result_sets[0].rows:
            return {"status": "success", "data": result_sets[0].rows[0]}
        return {"status": "error", "message": "Data not found"}

    return pool.retry_operation_sync(query_callee)