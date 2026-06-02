# Falcons Password Manager

Менеджер паролей и генератор с гибкими настройками, построенный на бессерверной архитектуре (Serverless) в Yandex Cloud. 

Главная жемчужина нашего решения - **Zero-Knowledge хранилище**. Мы не храним мастер-пароли пользователей в открытом виде и физически не можем расшифровать их данные даже при прямом доступе к базе данных.

## Технологический стек

**Backend:**
- Python 3.12+
- Yandex Cloud Functions
- Yandex API Gateway (OpenAPI/YAML)
- Pytest (для Unit-тестирования)
- Cryptography (AES-256-GCM, PBKDF2)

**Frontend:**
- React.js + Vite
- Tailwind CSS
- Изолированное хранение сессий через `sessionStorage`

**Database & CI/CD:**
- Yandex Database (YDB) Serverless
- Yandex Object Storage (для статического хостинга фронтенда)
- PowerShell скрипты для автоматизации деплоя

## Как работает Zero-Knowledge?

Безопасность пользовательских данных построена на принципе сквозного шифрования:
1. При сохранении пароля клиент передает зашифрованную сессию на бэкенд.
2. Бэкенд достает уникальную `keyword_salt` юзера из БД.
3. С помощью алгоритма PBKDF2 (HMAC-SHA256) генерируется 256-битный ключ.
4. Пароль шифруется алгоритмом **AES-256-GCM** с уникальным вектором инициализации (IV).
5. В базу отправляется зашифрованный Base64-мусор, IV и тег аутентификации. 
6. Мастер-ключ моментально уничтожается из оперативной памяти сервера.


## Локальный запуск (Frontend)

Так как бэкенд полностью бессерверный и крутится в облаке Яндекса, локально достаточно поднять только клиентскую часть для разработки.

1. Склонируйте репозиторий:
```bash
   git clone [https://github.com/your-repo/falcons-pass.git](https://github.com/your-repo/falcons-pass.git)
   cd falcons-pass/frontend
```

2. Установите зависимости:

```bash
   npm install
```

3. Создайте файл `.env` в корне папки `frontend` и пропишите URL вашего API Gateway:

```env
   VITE_API_BASE_URL=[https://ваша-ссылка-api-gateway.yandexcloud.net](https://ваша-ссылка-api-gateway.yandexcloud.net)

```

4. Запустите дев-сервер:

```bash
   npm run dev

```

## Тестирование

Бизнес-логика ядра (генерация, расчет энтропии по формуле Шеннона, авторизация) покрыта тестами. Переменные окружения мокаются автоматически через `conftest.py`.

Запуск тестов:

```bash
cd backend
python -m pytest -v tests/

```


## Команда «Соколы»

* **Андрей Вольвач** - Team Lead / Backend (Архитектура, Криптография, Ядро)

* **Михаил Слепцов** - Data Engineer (YDB драйвер, схема БД)

* **Даниил Алексеев** - DevOps (Yandex Cloud, CI/CD, API Gateway)

* **Егор Михайлов** - Frontend (React SPA, UI/UX, безопасность сессий)
