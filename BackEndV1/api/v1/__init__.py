from fastapi import APIRouter
from .endpoints import auth, states, dictionary, booking_resources, booking_reservations

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(states.router)
api_router.include_router(dictionary.router)
api_router.include_router(booking_resources.router)
api_router.include_router(booking_reservations.router)

__all__ = ["api_router"]
