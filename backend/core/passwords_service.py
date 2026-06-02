import json
import traceback
from core.ydb_driver import save_user_password, get_user_passwords, decrypt_user_password, delete_user_password
from core.decorators import require_auth
from core.logger import logger


@require_auth
def save_password_handler(event, user_id, body):
    title = body.get('title', 'Без названия')
    password_to_encrypt = body.get('password')
    master_key = body.get('keyword')

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if not password_to_encrypt or not master_key:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({"error": "Пустые данные"})}

    try:
        pwd_id = save_user_password(user_id, title, password_to_encrypt, master_key)
        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({"message": "Сохранено", "id": pwd_id})
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": str(e)})}


@require_auth
def get_passwords_handler(event, user_id, body):
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    try:
        # Получаем сырой список
        raw_passwords = get_user_passwords(user_id)

        # Очищаем данные, ТО ЕСТЬ ДЕЛАЕМ ОЧЕНЬ КРУТОЙ ПЕРЕВОД ИЗ БАЙТ В ЛЮДСКИЕ СТРОКИ

        sd = lambda x: x.decode('utf-8') if isinstance(x, bytes) else x

        clean_passwords = [
            {
                "id": sd(p["id"]),
                "title": sd(p["title"]),
                "strength_score": p["strength_score"],
                "createdAt": str(p["createdAt"]) if p["createdAt"] else None
            }
            for p in raw_passwords
        ]

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"passwords": clean_passwords})
        }
    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": str(e)})}


@require_auth
def decrypt_password_handler(event, user_id, body):
    password_id = body.get('password_id')
    master_key = body.get('keyword')

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if not password_id or not master_key:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Нужен ID пароля и мастер-ключ"})
        }

    try:
        decrypted_text = decrypt_user_password(password_id, user_id, master_key)

        sd = lambda x: x.decode('utf-8') if isinstance(x, bytes) else x
        decrypted_text = sd(decrypted_text)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"decrypted_password": decrypted_text})
        }
    except ValueError as ve:
        return {
            'statusCode': 403,
            'headers': headers,
            'body': json.dumps({"error": str(ve)})
        }
    except Exception as e:
        logger.error(f"CRITICAL ERROR:\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": "Внутренняя ошибка сервера"})
        }


@require_auth
def delete_password_handler(event, user_id, body):
    password_id = body.get('password_id')

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if not password_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Не передан ID пароля для удаления"})
        }

    try:
        delete_user_password(password_id, user_id)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"message": "Удалено"})
        }
    except Exception as e:
        logger.error(f"Ошибка сохранения пароля юзера {user_id}: {str(e)}", exc_info=True)
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({"error": str(e)})}