from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from .ydb_driver import find_user_by_email, create_user_in_db


def register_user_logic(email, password, secret_key):
    if not email or not password:
        return {"error": "Отсутствует email или пароль", "status": 400}

    if find_user_by_email(email):
        return {"error": "Пользователь с таким email уже существует", "status": 400}

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    user_id = create_user_in_db(email, hashed_password)

    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, secret_key, algorithm='HS256')

    return {"userId": user_id, "token": token, "status": 201}


def login_user_logic(email, password, secret_key):
    if not email or not password:
        return {"error": "Отсутствует email или пароль", "status": 400}

    user = find_user_by_email(email)

    if not user or not check_password_hash(user['password_hash'], password):
        return {"error": "Неверный email или пароль", "status": 401}

    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, secret_key, algorithm='HS256')

    return {"userId": user['id'], "token": token, "status": 200}
