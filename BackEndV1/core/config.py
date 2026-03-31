import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações da aplicação com suporte a variáveis de ambiente"""

    # Database Principal
    CASTELA_USER: str = os.getenv("CASTELA_USER", "root")
    CASTELA_SECRET_PASSWORD: str = os.getenv("CASTELA_SECRET_PASSWORD", "root")
    CASTELA_ADDRESS: str = os.getenv("CASTELA_ADDRESS", "localhost")
    CASTELA_DB: str = os.getenv("CASTELA_DB", "casteladb")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "20"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "10"))

    # Database Dicionário (erp_dictionary)
    DICT_DB: str = os.getenv("DICT_DB", "erp_dictionary")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Castela Backend"
    PROJECT_DESCRIPTION: str = "Backend ERP - Sistema de Controle"
    VERSION: str = "2.0.0"

    # CORS
    CORS_ORIGINS: list = ["http://localhost", "http://localhost:3000", "http://localhost:80"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]

    # App
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.CASTELA_USER}:{self.CASTELA_SECRET_PASSWORD}"
            f"@{self.CASTELA_ADDRESS}/{self.CASTELA_DB}"
        )

    @property
    def DICTIONARY_DB_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.CASTELA_USER}:{self.CASTELA_SECRET_PASSWORD}"
            f"@{self.CASTELA_ADDRESS}/{self.DICT_DB}"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
