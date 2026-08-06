"""Analytics collection service."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsEvent
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import AnalyticsEventCreate


class AnalyticsService:
    """Business logic for analytics operations."""

    def __init__(self, session: AsyncSession):
        self._repo = AnalyticsRepository(session)

    async def record_event(self, data: AnalyticsEventCreate) -> AnalyticsEvent:
        """Record a new analytics event."""
        event = AnalyticsEvent(**data.model_dump())
        return await self._repo.create(event)

    async def get_link_analytics(self, link_id: str) -> dict:
        """Get comprehensive analytics for a link."""
        total = await self._repo.get_total_clicks(link_id)
        unique = await self._repo.get_unique_visitors(link_id)
        countries = await self._repo.get_country_breakdown(link_id)
        devices = await self._repo.get_device_breakdown(link_id)
        browsers = await self._repo.get_browser_breakdown(link_id)
        os_data = await self._repo.get_os_breakdown(link_id)
        clicks_over_time = await self._repo.get_clicks_over_time(link_id)

        return {
            "link_id": link_id,
            "total_clicks": total,
            "unique_visitors": unique,
            "countries": countries,
            "devices": devices,
            "browsers": browsers,
            "os": os_data,
            "clicks_over_time": clicks_over_time,
        }
