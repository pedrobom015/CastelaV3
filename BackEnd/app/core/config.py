from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = "root"
    db_name: str = "casteladb"
    
    app_name: str = "Castela ERP"
    app_version: str = "1.0.0"
    debug: bool = False
    
    class Config:
        env_file = ".env_dev"
        extra = "ignore"


settings = Settings()