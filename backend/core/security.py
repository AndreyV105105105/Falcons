import os
import jwt

# Запрашиваем ключ у облака
SECRET_KEY = os.environ.get('JWT_SECRET')
if not SECRET_KEY:
    raise ValueError("КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не задан в переменных окружения Яндекса")


def verify_token(headers):
    # Пытаемся взять с большой буквы, если нет - берем с маленькой
    auth_header = headers.get('Authorization') or headers.get('authorization', '')

    if not auth_header or not auth_header.startswith('Bearer '):
        return None, {"error": "Отсутствует или неверный формат токена", "status": 401}

    # Отрезаем слово Bearer, чтобы получить чистый токен
    token = auth_header[7:]

    try:
        # Библиотека проверяет математическую подпись и срок годности
        decoded_payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded_payload.get('user_id'), None

    except jwt.ExpiredSignatureError:
        return None, {"error": "Срок действия сессии истек. Пожалуйста, войдите заново.", "status": 401}
    except jwt.InvalidTokenError:
        return None, {"error": "Недействительный токен доступа. В доступе отказано.", "status": 401}