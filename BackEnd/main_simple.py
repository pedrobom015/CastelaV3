# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Castela Backend",
    description="Backend ERP - Sistema de Controle",
    version="2.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
)


@app.get("/")
async def read_root():
    """Health check da API"""
    return {
        "message": "Bem-vindo ao Backend Castela",
        "version": "2.0.0",
        "docs": "/api/v1/docs"
    }


@app.get("/health")
async def health_check():
    """Status da aplicacao"""
    return {"status": "healthy"}
