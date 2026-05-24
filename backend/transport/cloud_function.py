import json
import os
import base64

from core.auth_service import register_user_logic, login_user_logic
from core.generator_service import generate_logic
from core.presets_service import create_preset_handler, get_presets_handler, delete_preset_handler
from core.security import verify_token

from core.passwords_service import (save_password_handler, get_passwords_handler, decrypt_password_handler,
                                    delete_password_handler)
from core.logger import logger


def handler(event, context):
    """Единая точка входа для авторизации в Yandex Cloud"""
    try:
        # Ловим метод запроса (POST, GET, OPTIONS)
        path = event.get('path', '')
        http_method = event.get('httpMethod', '')

        # Логируем входящий запрос
        logger.info(f"Входящий запрос: {http_method} {path}")

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

        # Надежная расшифровка Base64 и парсинг JSON (восстановлено из версии 6)
        raw_body = event.get('body')

        if not raw_body:
            body = {}
        else:
            if event.get('isBase64Encoded'):
                try:
                    raw_body = base64.b64decode(raw_body).decode('utf-8')
                except Exception:
                    raw_body = "{}"

            try:
                body = json.loads(raw_body) if raw_body.strip() else {}
            except (json.JSONDecodeError, AttributeError):
                body = {}

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
            # Маршрутизация пресетов
            if '/presets/save' in path:
                return create_preset_handler(event)
            elif '/presets/get' in path:
                return get_presets_handler(event)
            elif '/presets/delete' in path:
                return delete_preset_handler(event)

        elif '/passwords' in path:
            # Маршрутизация паролей
            if '/passwords/save' in path:
                return save_password_handler(event)
            elif '/passwords/get' in path:
                return get_passwords_handler(event)
            elif '/passwords/decrypt' in path:
                return decrypt_password_handler(event)
            elif '/passwords/delete' in path:
                return delete_password_handler(event)

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
        logger.error(f"CRITICAL ERROR: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        }