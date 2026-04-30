import json
import os
import base64
from backend.core.auth_service import register_user_logic, login_user_logic
from backend.core.generator_service import generate_logic

from backend.core.presets_service import create_preset, get_presets, delete_preset
from backend.core.security import verify_token


def handler(event, context):
    """Единая точка входа для авторизации в Yandex Cloud"""
    try:
        # Ловим метод запроса (POST, GET, OPTIONS)
        http_method = event.get('httpMethod', '')

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

        # Расшифровка Base64
        raw_body = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            raw_body = base64.b64decode(raw_body).decode('utf-8')

        body = json.loads(raw_body)
        secret_key = os.getenv('JWT_SECRET', 'super-secret-key')

        # Принудительная очистка текста
        # Если пришел мусор или None, превращаем в пустую строку
        email_raw = body.get('email')
        password_raw = body.get('password')

        clean_email = str(email_raw).strip() if email_raw else ""
        clean_password = str(password_raw).strip() if password_raw else ""

        # МАРШРУТИЗАЦИЯ
        if '/register' in path:
            result = register_user_logic(clean_email, clean_password, secret_key)
        elif '/login' in path:
            result = login_user_logic(clean_email, clean_password, secret_key)
        elif '/generate' in path:
            result = generate_logic(body)
        elif '/presets' in path:
            # Охранник
            user_id, error_response = verify_token(event.get('headers', {}))

            if error_response:
                return {
                    'statusCode': error_response['status'],
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': error_response['error']})
                }
            if '/presets/save' in path:
                return create_preset(user_id, body)
            elif '/presets/get' in path:
                return get_presets(user_id)
            elif '/presets/delete' in path:
                return delete_preset(user_id, body)
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
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        }
