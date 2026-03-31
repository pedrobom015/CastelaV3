from fastapi import FastAPI
from app.core.database import engine
from app.models.base import Base
from app.api.router import api_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Castela ERP",
    description="Backend ERP com arquitetura limpa",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Castela ERP Backend", "status": "online"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}