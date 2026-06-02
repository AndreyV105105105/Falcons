import math
import secrets
import string

def generate_password(length, use_upper, use_digits, use_special, exclude_similar):
    password_list = []
    available_chars = ""

    lower_chars = string.ascii_lowercase
    upper_chars = string.ascii_uppercase
    digit_chars = string.digits
    special_chars = string.punctuation

    if exclude_similar:
        for c in "ilo":
            lower_chars = lower_chars.replace(c, "")
        for c in "ILO":
            upper_chars = upper_chars.replace(c, "")
        for c in "01":
            digit_chars = digit_chars.replace(c, "")
        special_chars = special_chars.replace("|", "")


    available_chars += lower_chars
    password_list.append(secrets.choice(lower_chars))

    if use_upper:
        available_chars += upper_chars
        password_list.append(secrets.choice(upper_chars))

    if use_digits:
        available_chars += digit_chars
        password_list.append(secrets.choice(digit_chars))

    if use_special:
        available_chars += special_chars
        password_list.append(secrets.choice(special_chars))

    if length < len(password_list):
        raise ValueError(f"Минимальная длина для текущих настроек: {len(password_list)}")

    while len(password_list) < length:
        password_list.append(secrets.choice(available_chars))

    secrets.SystemRandom().shuffle(password_list)
    return ''.join(password_list)


def calculate_entropy(password):
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

    if R == 0:
        R = 1

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