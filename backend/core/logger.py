import logging
import sys


def setup_logger():
    # Создаем основной логгер проекта
    logger = logging.getLogger("password_manager")

    # Если у логгера уже есть обработчики, не добавляем их заново, чтобы логи не двоились
    if not logger.handlers:
        logger.setLevel(logging.INFO)

        # Настраиваем формат: Время - Уровень - Сообщение
        formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Направляем логи в стандартный поток вывода
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


# Создаем экземпляр логгера при импорте файла
logger = setup_logger()