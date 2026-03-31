import logging
import structlog
from core.config import settings

# Configurar structlog para logging estruturado
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

# Configurar logging padr?o
logging.basicConfig(
    format="%(message)s",
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
)

# Logger da aplica‡?o
logger = structlog.get_logger()


def get_logger(name: str = __name__):
    """Retorna logger estruturado com nome"""
    return structlog.get_logger(name)
