"""Redirect engine API endpoints."""

from fastapi import APIRouter, Request, Response, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.cache.redis_client import get_redis_cache, RedisCache
from app.services.redirect_service import RedirectService
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsEventCreate
from app.core.exceptions import handle_deeplink_exception, DeepLinkException

router = APIRouter()


@router.get(
    "/{identifier}",
    summary="Smart redirect",
    description="Redirect to the target URL with app detection and fallbacks.",
    responses={
        307: {"description": "Temporary redirect"},
        404: {"description": "Link not found"},
        410: {"description": "Link expired"},
    },
)
async def redirect(
    identifier: str,
    request: Request,
    password: str | None = None,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> Response:
    try:
        redirect_service = RedirectService(db, cache)
        result = await redirect_service.get_redirect_target(
            identifier=identifier,
            user_agent=request.headers.get("user-agent"),
            password=password,
        )

        # Record analytics asynchronously (fire and forget)
        try:
            analytics_service = AnalyticsService(db)
            await analytics_service.record_event(
                AnalyticsEventCreate(
                    link_id=result["link_id"],
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                    referrer=request.headers.get("referer"),
                    target_platform=result.get("platform"),
                    redirect_strategy=result.get("strategy"),
                )
            )
        except Exception:
            # Don't fail the redirect if analytics fails
            pass

        return RedirectResponse(
            url=result["redirect_url"],
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.get(
    "/{identifier}/info",
    summary="Get redirect info",
    description="Get redirect metadata without actually redirecting.",
)
async def get_redirect_info(
    identifier: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> dict:
    try:
        service = RedirectService(db, cache)
        return await service.get_redirect_target(
            identifier=identifier,
            user_agent=request.headers.get("user-agent"),
        )
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)
