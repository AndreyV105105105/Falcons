import base64
import json
from functools import wraps

from core.security import verify_token


def require_auth(handler_func):
    """
    Декоратор-охранник. Проверяет токен перед запуском эндпоинта.
    """

    @wraps(handler_func)
    def wrapper(event, *args, **kwargs):
        user_id, error_response = verify_token(event.get('headers', {}))
        if error_response:
            return {
                'statusCode': error_response['status'],
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': error_response['error']})
            }

        raw_body = event.get('body', '{}')
        if event.get('isBase64Encoded'):
            raw_body = base64.b64decode(raw_body).decode('utf-8')

        try:
            body = json.loads(raw_body)
        except json.JSONDecodeError:
            body = {}

        return handler_func(event, user_id, body, *args, **kwargs)

    return wrapper