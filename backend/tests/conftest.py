import os

# Подсовываем фейковые переменные окружения ДО того, как pytest начнет собирать тесты
os.environ['JWT_SECRET'] = 'fake_secret_key_for_testing_only_123'
os.environ['YDB_ENDPOINT'] = 'grpcs://ydb.serverless.yandexcloud.net:2135'
os.environ['YDB_DATABASE'] = '/ru-central1/fake/fake'