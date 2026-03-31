# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Models, Schemas, CRUD, DB
from database import engine, get_db
import models
import models_booking

# APIs e Middlewares
from api.v1 import api_router
from middlewares import setup_cors, setup_security_headers, setup_error_handlers

# Config e Logger
from core.config import settings
from core.logger import get_logger

# Criar tabelas
models.Base.metadata.create_all(bind=engine)
models_booking.Base.metadata.create_all(bind=engine)

# Inicializar logger
logger = get_logger(__name__)

# Criar aplica�?o
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configurar middlewares
setup_cors(app)
setup_security_headers(app)
setup_error_handlers(app)

# Incluir rotas
app.include_router(api_router)


@app.get("/")
async def read_root():
    """Health check da API"""
    return {
        "message": "Bem-vindo ao Backend Castela",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
async def health_check():
    """Verifica saude da aplicacao"""
    return {"status": "healthy"}


# Event Handlers para startup/shutdown
@app.on_event("startup")
async def startup_event():
    """Executado no startup da aplicacao"""
    logger.info(
        "app_startup",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG
    )


@app.on_event("shutdown")
async def shutdown_event():
    """Executado no shutdown da aplica�?o"""
    logger.info("app_shutdown", project=settings.PROJECT_NAME)
