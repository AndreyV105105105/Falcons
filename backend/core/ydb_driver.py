import os
import ydb
import uuid

# Глобальная переменная для хранения коннекта
driver = None

def get_driver():
    global driver
    if driver is None:
        endpoint = os.getenv('YDB_ENDPOINT')
        database = os.getenv('YDB_DATABASE')
        if endpoint and database:
            driver = ydb.Driver(endpoint=endpoint, database=database)
            driver.wait(fail_fast=True, timeout=5)
    return driver

def find_user_by_email(email):
    # TODO: Здесь будет YQL-запрос к YDB от Миши
    # Пока возвращаем None, как будто такого юзера нет
    return None

def create_user_in_db(email, password_hash):
    # TODO: Здесь будет YQL-запрос к YDB от Миши
    # Пока просто генерируем фейковый ID для теста
    return str(uuid.uuid4())