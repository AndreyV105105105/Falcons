import json
import traceback
import uuid
from core.ydb_driver import save_user_preset, get_user_presets, delete_user_preset
from core.decorators import require_auth
from core.logger import logger


@require_auth
def create_preset_handler(event, user_id, body):
    # Дефолтные заголовки для всех ответов (как в passwords_service)
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    preset_name = body.get('preset_name')
    length = body.get('length')

    # Жесткая Валидация
    if not preset_name or not isinstance(preset_name, str):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Имя пресета обязательно и должно быть строкой"})
        }

    if not isinstance(length, int) or not (4 <= length <= 64):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Длина пароля должна быть числом от 4 до 64"})
        }

    # Формируем структуру данных пресета
    preset_id = str(uuid.uuid4())
    preset_data = {
        "preset_id": preset_id,
        "length": length,
        "use_uppercase": bool(body.get('use_uppercase', False)),
        "use_numbers": bool(body.get('use_numbers', False)),
        "use_symbols": bool(body.get('use_symbols', False)),
        "exclude_ambiguous": bool(body.get('exclude_ambiguous', False))
    }

    try:
        save_user_preset(user_id, str(preset_name).strip(), preset_data)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "message": "Пресет успешно сохранен",
                "preset_id": preset_id
            })
        }
    except Exception as e:
        logger.error(f"CRITICAL PRESET SAVE ERROR:\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": "Ошибка базы данных при сохранении пресета"})
        }


@require_auth
def get_presets_handler(event, user_id, body):
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    try:
        presets_list = get_user_presets(user_id)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"presets": presets_list})
        }
    except Exception as e:
        logger.error(f"CRITICAL PRESET GET ERROR:\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": "Не удалось загрузить пресеты"})
        }


@require_auth
def delete_preset_handler(event, user_id, body):
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    preset_id = body.get('preset_id')

    if not preset_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Не передан ID пресета для удаления"})
        }

    try:
        delete_user_preset(preset_id, user_id)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"message": "Пресет успешно удален"})
        }
    except Exception as e:
        logger.error(f"CRITICAL PRESET DELETE ERROR:\n{traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": "Ошибка базы данных при удалении пресета"})
        }