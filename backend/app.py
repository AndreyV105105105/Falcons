import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Импорт роутов (блюпринтов)
from routes.auth import auth_bp
from routes.generate import generate_bp
from routes.vault import vault_bp


def create_app():
    app = Flask(__name__)

    # Разрешаем CORS для связи с React-фронтендом Егора
    CORS(app)

    # Базовая конфигурация
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'super-secret-default-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Регистрация роутов
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(generate_bp, url_prefix='/api/v1/generate')
    app.register_blueprint(vault_bp, url_prefix='/api/v1/vault')

    # Глобальный обработчик ошибок 404
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Эндпоинт не найден"}), 404

    # Глобальный обработчик ошибок 400 (Bad Request)
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Неверный формат данных (нарушение контракта)"}), 400

    # Тестовый эндпоинт (полезен Дане для проверки деплоя в Yandex Cloud)
    @app.route('/ping', methods=['GET'])
    def ping():
        return jsonify({"status": "ok", "message": "Бэкенд успешно запущен!"}), 200

    return app


if __name__ == '__main__':
    app = create_app()
    # Запускаем сервер локально на 5000 порту
    app.run(host='0.0.0.0', port=5000, debug=True)