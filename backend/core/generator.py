import secrets
import string
import math

def generate_password(length, use_upper, use_digits, use_special, exclude_similar):
    password_list = []
    available_chars = ""

    # Обработка нижнего регистра (он есть всегда по умолчанию)
    lower_chars = string.ascii_lowercase
    if exclude_similar:
        lower_chars = lower_chars.replace('l', "")
    available_chars += lower_chars
    password_list.append(secrets.choice(lower_chars))

    # Обработка верхнего регистра
    if use_upper:
        upper_chars = string.ascii_uppercase
        if exclude_similar:
            upper_chars = upper_chars.replace('O', "").replace('I', "")
        available_chars += upper_chars
        password_list.append(secrets.choice(upper_chars))

    # Обработка цифр
    if use_digits:
        digit_chars = string.digits
        if exclude_similar:
            digit_chars = digit_chars.replace('0', "").replace('1', "")
        available_chars += digit_chars
        password_list.append(secrets.choice(digit_chars))

    # Обработка спецсимволов
    if use_special:
        special_chars = string.punctuation
        available_chars += special_chars
        password_list.append(secrets.choice(special_chars))

    # Проверка длины (Выбрасываем красивую ошибку)
    if length < len(password_list):
        raise ValueError(f"Минимальная длина для текущих настроек: {len(password_list)}")

    # Добиваем длину оставшимися случайными символами
    while len(password_list) < length:
        password_list.append(secrets.choice(available_chars))

    # Перемешивание и склейка
    secrets.SystemRandom().shuffle(password_list)
    return ''.join(password_list)


import math
import string

def calculate_entropy(password):
    # Защита от пустой строки
    if not password:
        return {"score": 0, "level": "Слабый"}

    L = len(password)
    R = 0

    if any(c in string.ascii_lowercase for c in password):
        R += 26
    if any(c in string.ascii_uppercase for c in password):
        R += 26
    if any(c in string.digits for c in password):
        R += 10
    if any(c in string.punctuation for c in password):
        R += 32

    # Защита от неизвестных символов (например, если ввели только русские буквы)
    if R == 0:
        R = 1  # log2(1) даст 0 энтропии

    E = round(L * math.log2(R), 2)

    if E < 40:
        level = 'Слабый'
    elif 40 <= E < 60:
        level = 'Средний'
    elif 60 <= E < 80:
        level = 'Надежный'
    else:
        level = 'Непробиваемый'

    return {
        "score": E,
        "level": level
    }


