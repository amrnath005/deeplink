"""API v1 Master Router."""

from fastapi import APIRouter

from app.api.v1.endpoints import links, redirects, analytics, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(links.router, prefix="/links", tags=["Links"])
api_router.include_router(redirects.router, prefix="/r", tags=["Redirects"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
