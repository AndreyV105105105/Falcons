import os

os.environ['JWT_SECRET'] = 'fake_secret_key_for_testing_only_123'
os.environ['YDB_ENDPOINT'] = 'grpcs://ydb.serverless.yandexcloud.net:2135'
os.environ['YDB_DATABASE'] = '/ru-central1/fake/fake'