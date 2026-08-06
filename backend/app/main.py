"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse

from app.config import get_settings
from app.db.base import Base
from app.db.session import engine
from app.cache.redis_client import get_redis_cache
from app.api.v1.router import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    cache = get_redis_cache()
    await cache.connect()
    yield
    # Shutdown
    await cache.disconnect()


def create_application() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Smart Deep Link Redirect Platform API. Zero auth required.",
        default_response_class=ORJSONResponse,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # API Routes
    app.include_router(api_router, prefix="/api")

    # Health check
    @app.get("/health", tags=["health"])
    async def health_check() -> dict:
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }

    # Root redirect to docs
    @app.get("/", include_in_schema=False)
    async def root() -> dict:
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "api": "/api/v1",
        }

    return app


app = create_application()
