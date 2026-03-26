from fastapi import APIRouter
from .endpoints import auth, states, dictionary

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(states.router)
api_router.include_router(dictionary.router)

__all__ = ["api_router"]
