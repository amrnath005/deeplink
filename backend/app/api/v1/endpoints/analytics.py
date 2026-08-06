"""Analytics API endpoints."""

from typing import Sequence

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.analytics import AnalyticsEventCreate, AnalyticsEventResponse
from app.services.analytics_service import AnalyticsService
from app.core.exceptions import handle_deeplink_exception, DeepLinkException

router = APIRouter()


@router.post(
    "",
    response_model=AnalyticsEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record analytics event",
    description="Record a detailed analytics event for a link click.",
)
async def record_event(
    data: AnalyticsEventCreate,
    db: AsyncSession = Depends(get_db),
) -> AnalyticsEventResponse:
    try:
        service = AnalyticsService(db)
        event = await service.record_event(data)
        return AnalyticsEventResponse.model_validate(event)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.get(
    "/{link_id}",
    summary="Get link analytics",
    description="Get comprehensive analytics for a specific link.",
)
async def get_link_analytics(
    link_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        service = AnalyticsService(db)
        return await service.get_link_analytics(link_id)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.get(
    "/{link_id}/events",
    response_model=list[AnalyticsEventResponse],
    summary="List analytics events",
    description="Get raw analytics events for a link.",
)
async def list_events(
    link_id: str,
    skip: int = 0,
    limit: int = 1000,
    db: AsyncSession = Depends(get_db),
) -> Sequence[AnalyticsEventResponse]:
    from app.repositories.analytics_repository import AnalyticsRepository
    repo = AnalyticsRepository(db)
    events = await repo.get_by_link_id(link_id, skip=skip, limit=limit)
    return [AnalyticsEventResponse.model_validate(e) for e in events]
