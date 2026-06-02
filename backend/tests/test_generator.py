import pytest

from core.generator import generate_password, calculate_entropy


def test_password_length():
    """Тест: генератор должен строго соблюдать заданную длину."""
    pwd16 = generate_password(length=16, use_upper=True, use_digits=True, use_special=True, exclude_similar=False)
    assert len(pwd16) == 16


def test_password_includes_numbers_and_symbols():
    """Тест: при включенных флагах в пароле должны быть нужные типы символов."""
    pwd = generate_password(length=20, use_upper=True, use_digits=True, use_special=True, exclude_similar=False)

    has_number = any(char.isdigit() for char in pwd)
    has_symbol = any(not char.isalnum() for char in pwd)

    assert has_number is True
    assert has_symbol is True


def test_exclude_ambiguous_characters():
    """Тест: если включено исключение похожих символов, их не должно быть в пароле."""
    ambiguous_chars = set("il1Lo0O")

    pwd = generate_password(length=100, use_upper=True, use_digits=True, use_special=True, exclude_similar=True)

    intersection = set(pwd).intersection(ambiguous_chars)
    assert len(intersection) == 0


def test_entropy_calculation():
    """Тест: алгоритм должен возвращать словарь с оценкой надежности в битах."""
    entropy_data = calculate_entropy("WeakPass1")

    assert "score" in entropy_data
    assert isinstance(entropy_data["score"], (int, float))
    assert entropy_data["score"] > 0