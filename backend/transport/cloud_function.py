import json
import os
from core.auth_service import register_user_logic, login_user_logic


def handler(event, context):
    """Единая точка входа для авторизации в Yandex Cloud"""
    try:
        # Ловим метод запроса (POST, GET, OPTIONS)
        http_method = event.get('httpMethod', '')

        # ОБРАБОТКА CORS  (Preflight-запрос от браузера)
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': ''
            }

        path = event.get('path', '')
        body = json.loads(event.get('body', '{}'))
        secret_key = os.getenv('JWT_SECRET', 'super-secret-key')

        # МАРШРУТИЗАЦИЯ (Регистрация и Логин)
        if '/register' in path:
            result = register_user_logic(body.get('email'), body.get('password'), secret_key)
        elif '/login' in path:
            result = login_user_logic(body.get('email'), body.get('password'), secret_key)
        else:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({"error": "Эндпоинт не найден"})
            }

        status = result.pop('status', 500)

        # УСПЕШНЫЙ ОТВЕТ
        return {
            'statusCode': status,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Пропуск для браузера Егора
            },
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        }