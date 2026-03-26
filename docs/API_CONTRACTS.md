# API Контракты (Secure Pass & Vault)

**Base URL:** `/api/v1`
**Формат данных:** `application/json`
**Авторизация:** В защищенных роутах требуется заголовок `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Авторизация (Auth)

### Регистрация пользователя
* **URL:** `/auth/register`
* **Метод:** `POST`
* **Предусловия (Request):**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Постусловия (Response 201 Created):**
  ```json
  {
    "userId": "uuid-1234",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

### Вход пользователя
* **URL:** `/auth/login`
* **Метод:** `POST`
* **Предусловия (Request):**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
* **Постусловия (Response 200 OK):**
  ```json
  {
    "userId": "uuid-1234",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

---

## 2. Генератор (Generate)

### Сгенерировать пароль
* **URL:** `/generate/`
* **Метод:** `POST`
* **Авторизация:** Не требуется
* **Предусловия (Request):**
  ```json
  {
    "length": 16,
    "useLowercase": true,
    "useUppercase": true,
    "useNumbers": true,
    "useSymbols": false,
    "excludeSimilar": true
  }
  ```
* **Постусловия (Response 200 OK):**
  ```json
  {
    "password": "aB3eK9xP2mQ7vW4",
    "entropyScore": 85.2,
    "strength": "strong"
  }
  ```

---

## 3. Настройки и Хранилище (Vault)

### Сохранить пресет настроек
* **URL:** `/vault/presets`
* **Метод:** `POST`
* **Авторизация:** Требуется
* **Предусловия (Request):**
  ```json
  {
    "profileName": "Для банков",
    "settings": {
      "length": 20,
      "useLowercase": true,
      "useUppercase": true,
      "useNumbers": true,
      "useSymbols": true,
      "excludeSimilar": true
    }
  }
  ```
* **Постусловия (Response 201 Created):**
  ```json
  {
    "presetId": "uuid-5678",
    "message": "Пресет успешно сохранен"
  }
  ```

### Расшифровать историю паролей
* **URL:** `/vault/history/decrypt`
* **Метод:** `POST`
* **Авторизация:** Требуется
* **Предусловия (Request):** Передается ключевое слово (мастер-пароль), введенное пользователем.
  ```json
  {
    "keyword": "MySecretMasterKey2026"
  }
  ```
* **Постусловия (Response 200 OK):** Массив расшифрованных объектов.
  ```json
  [
    {
      "historyId": "uuid-9012",
      "password": "MySecretPass123!",
      "generatedAt": "2026-03-15T15:00:00Z"
    }
  ]
  ```
* **Ошибка (Response 403 Forbidden):** Если ключевое слово неверное.
  ```json
  {
    "error": "Неверное ключевое слово. Дешифровка невозможна."
  }
  ```
