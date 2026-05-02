import json
import uuid  # Для генерации уникальных ID пресетов
from core.ydb_driver import save_user_preset, get_user_presets, delete_user_preset


def _format_response(status_code: int, response_body: dict) -> dict:
    """
    Внутренняя утилита
    Автоматически упаковывает ответ в формат, который требует Yandex API Gateway.
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'  # Защита от CORS-ошибок у фронтенда
        },
        'body': json.dumps(response_body)
    }


def create_preset(user_id: str, body: dict) -> dict:
    """
    Обрабатывает запрос на создание нового пресета.
    """
    # Достаем данные от фронтенда
    preset_name = body.get('preset_name')
    length = body.get('length')

    # Жесткая Валидация (Проверка на дурака)
    if not preset_name or not isinstance(preset_name, str):
        return _format_response(400, {"error": "Имя пресета обязательно и должно быть строкой"})

    if not isinstance(length, int) or not (4 <= length <= 64):
        return _format_response(400, {"error": "Длина пароля должна быть числом от 4 до 64"})

    # Упаковка данных
    preset_id = str(uuid.uuid4())  # Генерируем уникальный ID для пресета

    # Собираем чистый словарь, подставляя безопасные значения по умолчанию (False),
    # если фронтенд вдруг забыл прислать какие-то галочки.
    preset_data = {
        "preset_id": preset_id,
        "user_id": user_id,
        "preset_name": str(preset_name).strip(),
        "length": length,
        "use_uppercase": bool(body.get('use_uppercase', False)),
        "use_lowercase": bool(body.get('use_lowercase', False)),
        "use_numbers": bool(body.get('use_numbers', False)),
        "use_special": bool(body.get('use_special', False))
    }

    # Отправка на склад
    try:
        # Передаем словарь в драйвер БД
        save_user_preset(user_id, str(preset_name).strip(), preset_data)
        return _format_response(200, {
            "message": "Пресет успешно сохранен",
            "preset_id": preset_id
        })
    except Exception as e:
        # Если база упала, фронтенд получит 500 ошибку
        return _format_response(500, {"error": f"Ошибка базы данных: {str(e)}"})


def get_presets(user_id: str) -> dict:
    """
    Отдает фронтенду список всех пресетов пользователя.
    """
    try:
        # Получаем данные из базы
        presets_list = get_user_presets(user_id)
        return _format_response(200, {"presets": presets_list})
    except Exception as e:
        return _format_response(500, {"error": f"Не удалось загрузить пресеты: {str(e)}"})


def delete_preset(user_id: str, body: dict) -> dict:
    """
    Удаляет пресет по его ID.
    """
    preset_id = body.get('preset_id')

    if not preset_id:
        return _format_response(400, {"error": "ID пресета обязателен для удаления"})

    try:
        # Важно передавать user_id, чтобы юзер не мог удалить чужой пресет,
        # просто угадав чужой preset_id
        delete_user_preset(preset_id, user_id)
        return _format_response(200, {"message": "Пресет удален"})
    except Exception as e:
        return _format_response(500, {"error": f"Ошибка при удалении: {str(e)}"})