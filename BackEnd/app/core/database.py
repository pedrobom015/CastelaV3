import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv('.env_dev')

USER = os.getenv('CASTELA_USER', 'root')
PASSWORD = os.getenv('CASTELA_SECRET_PASSWORD', 'root')
HOST = os.getenv('CASTELA_ADDRESS', 'localhost')
DB_NAME = os.getenv('CASTELA_DB', 'casteladb')

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}/{DB_NAME}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=80,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()