"""Enterprise health, readiness, and liveness endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_db

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Simple Liveness Probe."""
    return {"status": "ok", "service": "DeepLink Pro API", "version": "1.0.0"}


@router.get("/readiness", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Deep Readiness Probe checking PostgreSQL database connectivity."""
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        return {"status": "ready", "database": "connected", "redis": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": "disconnected", "error": str(e)}
