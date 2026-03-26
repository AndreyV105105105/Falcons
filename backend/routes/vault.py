from flask import Blueprint, request, jsonify

vault_bp = Blueprint('vault', __name__)


@vault_bp.route('/presets', methods=['POST'])
def save_preset():
    data = request.get_json()

    # Проверка контракта
    if not data or 'profileName' not in data or 'settings' not in data:
        return jsonify({"error": "Отсутствует profileName или объект settings"}), 400

    # Моковый ответ: пресет сохранен
    mock_response = {
        "presetId": "mock-uuid-5678-efgh",
        "message": "Пресет успешно сохранен"
    }
    return jsonify(mock_response), 201


@vault_bp.route('/history/decrypt', methods=['POST'])
def decrypt_history():
    data = request.get_json()

    # Проверка контракта: мастер-ключ обязателен
    if not data or 'keyword' not in data:
        return jsonify({"error": "Требуется ключевое слово (keyword)"}), 400

    # Моковый ответ: возвращаем расшифрованную историю
    mock_response = [
        {
            "historyId": "mock-uuid-9012-ijkl",
            "password": "MySecretPass123!",
            "generatedAt": "2026-03-15T15:00:00Z"
        }
    ]
    return jsonify(mock_response), 200