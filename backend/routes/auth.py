from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Проверка контракта
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Отсутствует email или пароль"}), 400

    # Моковый ответ: имитируем успешную регистрацию
    mock_response = {
        "userId": "mock-uuid-1234-abcd",
        "token": "mock-jwt-token-register"
    }
    return jsonify(mock_response), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Проверка контракта
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Отсутствует email или пароль"}), 400

    # Моковый ответ: имитируем успешный вход
    mock_response = {
        "userId": "mock-uuid-1234-abcd",
        "token": "mock-jwt-token-login"
    }
    return jsonify(mock_response), 200