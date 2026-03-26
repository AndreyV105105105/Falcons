from flask import Blueprint, request, jsonify

generate_bp = Blueprint('generate', __name__)

@generate_bp.route('/', methods=['POST'])
def generate_password():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Ожидался JSON с настройками"}), 400

    # Строгая проверка контракта: длина обязательна и должна быть числом
    if 'length' not in data or not isinstance(data['length'], int):
        return jsonify({"error": "Параметр 'length' обязателен и должен быть числом"}), 400

    # Моковый ответ: возвращаем статичные данные
    mock_response = {
        "password": "MockPassword123!",
        "entropyScore": 85.2,
        "strength": "strong"
    }
    return jsonify(mock_response), 200