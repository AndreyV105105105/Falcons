import json
import db

# Инициализация БД при старте функции
db.init_db()


def handler(event, context):
    """Минимальный handler для теста подключения"""
    try:
        # Тестовый endpoint
        if event.get('path', '').endswith('/test-db'):
            result = db.test_write_read()
            return {
                'statusCode': 200,
                'body': json.dumps(result)
            }

        # Default response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Backend is working!'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }