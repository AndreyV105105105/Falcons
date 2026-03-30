import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Добавляем корень проекта в пути, чтобы Питон видел папку core
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from core.auth_service import register_user_logic

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'super-secret-key')


@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    # Передаем данные в нашу чистую логику
    result = register_user_logic(
        data.get('email'),
        data.get('password'),
        app.config['SECRET_KEY']
    )

    # Вытаскиваем HTTP-статус из ответа логики
    status = result.pop('status', 500)
    return jsonify(result), status

@app.route('/', methods=['GET'])
@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        "status": "ok",
        "message": "Falcons API Serverless Backend is running!"
    }), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)