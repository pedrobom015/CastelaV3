from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from core.logger import get_logger

logger = get_logger(__name__)


def setup_error_handlers(app: FastAPI) -> None:
    """Configura handlers para erros da aplica‡?o"""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        logger.warning(
            "validation_error",
            path=request.url.path,
            errors=exc.errors()
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Erro de valida‡?o",
                "errors": [
                    {
                        "field": str(error["loc"]),
                        "message": error["msg"],
                        "type": error["type"]
                    }
                    for error in exc.errors()
                ]
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request, exc):
        logger.error(
            "database_integrity_error",
            path=request.url.path,
            error=str(exc)
        )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "detail": "Viola‡?o de integridade do banco de dados",
                "error": "Poss¡vel duplica‡?o de dados ou referˆncia inv lida"
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request, exc):
        logger.error(
            "database_error",
            path=request.url.path,
            error=str(exc)
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Erro no banco de dados",
                "error": "Ocorreu um erro ao processar sua solicita‡?o"
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        logger.error(
            "unhandled_exception",
            path=request.url.path,
            error=str(exc),
            exc_type=type(exc).__name__
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Erro interno do servidor",
                "error": "Ocorreu um erro inesperado"
            },
        )
