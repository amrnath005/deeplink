"""FastAPI dependencies."""

from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.cache.redis_client import get_redis_cache
from app.config import get_settings

settings = get_settings()

# Rate limiter using Redis
limiter = Limiter(key_func=get_remote_address)


async def get_base_url(request: Request) -> str:
    """Extract base URL from request."""
    return f"{request.base_url.scheme}://{request.base_url.netloc}"


async def verify_no_auth() -> None:
    """This application requires no authentication."""
    pass
