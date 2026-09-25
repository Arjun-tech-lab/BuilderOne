"""API router aggregation."""
from fastapi import APIRouter

from app.api import auth, builders, customer

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(customer.router)
api_router.include_router(builders.router)
