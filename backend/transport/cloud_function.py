import json
import os
from core.auth_service import register_user_logic, login_user_logic


def handler(event, context):
    """Единая точка входа для авторизации в Yandex Cloud"""
    try:
        # API Gateway передает путь в словаре event
        path = event.get('path', '')
        body = json.loads(event.get('body', '{}'))
        secret_key = os.getenv('JWT_SECRET', 'super-secret-key')

        # Маршрутизация внутри облачной функции
        if '/register' in path:
            result = register_user_logic(body.get('email'), body.get('password'), secret_key)
        elif '/login' in path:
            result = login_user_logic(body.get('email'), body.get('password'), secret_key)
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({"error": "Эндпоинт авторизации не найден"})
            }

        status = result.pop('status', 500)

        return {
            'statusCode': status,
            'headers': {
                'Content-Type': 'application/json',
                # Настройка CORS прямо в ответе функции (для фронтенда)
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        }