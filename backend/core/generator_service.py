from core.generator import generate_password, calculate_entropy


def generate_logic(body):
    """
    Обрабатывает запрос на генерацию пароля
    """

    length = int(body.get('length', 16))
    use_upper = bool(body.get('use_upper', True))
    use_digits = bool(body.get('use_digits', True))
    use_special = bool(body.get('use_special', True))
    exclude_similar = bool(body.get('exclude_similar', False))

    try:
       new_password = generate_password(length, use_upper, use_digits, use_special, exclude_similar)

    except ValueError as e:
        return {"error": str(e), "status": 400}

    entropy_data = calculate_entropy(new_password)

    return {'password': new_password, 'entropy': entropy_data, 'status': 200}

