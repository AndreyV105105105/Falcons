import pytest
from core.security import verify_token


def test_verify_token_missing():
    """Тест: если заголовка Authorization нет, доступ должен быть запрещен."""
    headers = {'Content-Type': 'application/json'}
    user_id, error = verify_token(headers)

    assert user_id is None
    assert error is not None
    assert error['status'] == 401
    assert "Отсутствует" in error['error'] or "не найден" in error['error']


def test_verify_token_invalid_format():
    """Тест: если формат токена не Bearer <token>, должна быть ошибка."""
    headers = {'Authorization': 'Basic dXNlcjpwYXNz'}
    user_id, error = verify_token(headers)

    assert user_id is None
    assert error is not None
    assert error['status'] == 401


def test_verify_token_fake_jwt():
    """Тест: если токен не проходит проверку подписи JWT."""
    headers = {'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI.eyJzdWIiOiIxMjMifQ.fake_signature'}
    user_id, error = verify_token(headers)

    assert user_id is None
    assert error is not None
    assert error['status'] in [401, 403]