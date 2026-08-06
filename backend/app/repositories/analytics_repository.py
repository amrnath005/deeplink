"""Analytics data access layer."""

from typing import Sequence, Optional
from datetime import datetime, timedelta

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsEvent


class AnalyticsRepository:
    """Repository for Analytics CRUD operations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def create(self, event: AnalyticsEvent) -> AnalyticsEvent:
        self._session.add(event)
        await self._session.flush()
        await self._session.refresh(event)
        return event

    async def get_by_link_id(
        self,
        link_id: str,
        skip: int = 0,
        limit: int = 1000,
    ) -> Sequence[AnalyticsEvent]:
        result = await self._session.execute(
            select(AnalyticsEvent)
            .where(AnalyticsEvent.link_id == link_id)
            .order_by(desc(AnalyticsEvent.created_at))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_total_clicks(self, link_id: str) -> int:
        result = await self._session.execute(
            select(func.count(AnalyticsEvent.id)).where(
                AnalyticsEvent.link_id == link_id
            )
        )
        return result.scalar() or 0

    async def get_unique_visitors(self, link_id: str) -> int:
        result = await self._session.execute(
            select(func.count(func.distinct(AnalyticsEvent.visitor_id))).where(
                AnalyticsEvent.link_id == link_id
            )
        )
        return result.scalar() or 0

    async def get_country_breakdown(self, link_id: str) -> dict[str, int]:
        result = await self._session.execute(
            select(
                AnalyticsEvent.country,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .where(
                AnalyticsEvent.link_id == link_id,
                AnalyticsEvent.country.isnot(None),
            )
            .group_by(AnalyticsEvent.country)
            .order_by(desc("count"))
        )
        return {row.country: row.count for row in result.all()}

    async def get_device_breakdown(self, link_id: str) -> dict[str, int]:
        result = await self._session.execute(
            select(
                AnalyticsEvent.device_type,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .where(
                AnalyticsEvent.link_id == link_id,
                AnalyticsEvent.device_type.isnot(None),
            )
            .group_by(AnalyticsEvent.device_type)
            .order_by(desc("count"))
        )
        return {row.device_type or "unknown": row.count for row in result.all()}

    async def get_browser_breakdown(self, link_id: str) -> dict[str, int]:
        result = await self._session.execute(
            select(
                AnalyticsEvent.browser,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .where(
                AnalyticsEvent.link_id == link_id,
                AnalyticsEvent.browser.isnot(None),
            )
            .group_by(AnalyticsEvent.browser)
            .order_by(desc("count"))
        )
        return {row.browser or "unknown": row.count for row in result.all()}

    async def get_os_breakdown(self, link_id: str) -> dict[str, int]:
        result = await self._session.execute(
            select(
                AnalyticsEvent.os,
                func.count(AnalyticsEvent.id).label("count"),
            )
            .where(
                AnalyticsEvent.link_id == link_id,
                AnalyticsEvent.os.isnot(None),
            )
            .group_by(AnalyticsEvent.os)
            .order_by(desc("count"))
        )
        return {row.os or "unknown": row.count for row in result.all()}

    async def get_clicks_over_time(
        self,
        link_id: str,
        days: int = 30,
    ) -> list[dict]:
        since = datetime.utcnow() - timedelta(days=days)
        result = await self._session.execute(
            select(
                func.date(AnalyticsEvent.created_at).label("date"),
                func.count(AnalyticsEvent.id).label("clicks"),
                func.count(func.distinct(AnalyticsEvent.visitor_id)).label("unique"),
            )
            .where(
                AnalyticsEvent.link_id == link_id,
                AnalyticsEvent.created_at >= since,
            )
            .group_by(func.date(AnalyticsEvent.created_at))
            .order_by("date")
        )
        return [
            {"date": str(row.date), "clicks": row.clicks, "unique": row.unique}
            for row in result.all()
        ]
