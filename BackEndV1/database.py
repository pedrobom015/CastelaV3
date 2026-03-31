from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# URL de conexão usando configuração centralizada
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
DICTIONARY_DATABASE_URL = settings.DICTIONARY_DB_URL

# Engine principal (Castela DB)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG
)

# Engine do dicionário (erp_dictionary)
dict_engine = create_engine(
    DICTIONARY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
DictSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=dict_engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_dict_db():
    db = DictSessionLocal()
    try:
        yield db
    finally:
        db.close()
