# Менеджер и генератор паролей

Современное веб-приложение для безопасной генерации, оценки криптостойкости и хранения паролей. Проект построен на полностью бессерверной архитектуре, что обеспечивает высокую масштабируемость и безопасность данных.

## Технологический стек

**Frontend:**
- **React 19** + **Vite** 
- **Tailwind CSS v4** 
- SPA-архитектура с разделением на экраны (Генератор, Авторизация, Пресеты, Хранилище)

**Backend (Cloud-Native):**
- **Python 3.11+**
- **Yandex Cloud Functions**
- **Yandex API Gateway**
- Хэширование и защита сессий через **JWT** (PyJWT, Werkzeug)

**База данных:**
- **Yandex Database (YDB)** в режиме Serverless
- Прямые **YQL-запросы**

---

## Структура проекта

Репозиторий разделен на две основные части:
* `/frontend` — клиентское приложение.
* `/backend` — ядро API и функции для деплоя в облако.

---

## Локальный запуск (для разработчиков)

### 1. Запуск Backend-сервера
Для локального тестирования API без деплоя в облако мы используем легковесную обертку на Flask.

```bash
cd backend
python -m venv .venv
# Активация окружения (Windows): .venv\Scripts\activate
# Активация окружения (Mac/Linux): source .venv/bin/activate

pip install -r requirements.txt
python transport/flask_app.py
```
*API будет доступно по адресу: http://127.0.0.1:5000*

### 2. Запуск Frontend-клиента
```bash
cd frontend
npm install
npm run dev
```
*Клиент будет доступен по адресу: http://localhost:5173*

---

## Инфраструктура и Деплой (Yandex Cloud)

Продакшен-версия бэкенда не использует Flask. Для деплоя необходимо:
1. Создать Cloud Function в консоли Яндекса (Python 3.11).
2. Загрузить содержимое папок `core/` и `transport/cloud_function.py`.
3. Указать точку входа (Entry point): `transport.cloud_function.handler`.
4. Настроить переменные окружения (например, `JWT_SECRET`).
5. Привязать функцию к Yandex API Gateway через OpenAPI спецификацию.

---

## Команда разработчиков
* **Андрей** — Тимлид, Backend
* **Даня** — Cloud Infrastructure & DevOps
* **Михаил** — Database Engineer
* **Егор** — Frontend Developer
```
