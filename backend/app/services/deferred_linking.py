"""Deferred Deep Link Probabilistic Matching Engine for iOS & Android MMP SDKs."""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.analytics import AnalyticsEvent
from app.models.link import Link


class DeferredLinkingEngine:
    """Probabilistic matching engine that pairs post-install first app launches with pre-install web link clicks."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def match_deferred_link(self, telemetry: Dict[str, Any], window_minutes: int = 120) -> Optional[Dict[str, Any]]:
        """Match native mobile SDK fingerprint against web click events within a 2-hour window."""
        os_target = telemetry.get("os", "iOS")
        screen_target = telemetry.get("screen_size")
        timezone_target = telemetry.get("timezone")
        time_cutoff = datetime.utcnow() - timedelta(minutes=window_minutes)

        # Query recent analytics click records matching OS, screen size, or IP
        stmt = (
            select(AnalyticsEvent, Link)
            .join(Link, AnalyticsEvent.link_id == Link.id)
            .where(AnalyticsEvent.created_at >= time_cutoff)
            .where(AnalyticsEvent.os.ilike(f"%{os_target}%"))
            .order_by(AnalyticsEvent.created_at.desc())
            .limit(10)
        )

        result = await self._session.execute(stmt)
        matches = result.all()

        for event, link in matches:
            # Score match confidence based on screen size, timezone, and language
            confidence = 0.5
            if event.screen_size == screen_target:
                confidence += 0.3
            if event.timezone == timezone_target:
                confidence += 0.2

            if confidence >= 0.7:
                return {
                    "matched": True,
                    "confidence_score": confidence,
                    "link_id": link.id,
                    "alias": link.alias,
                    "original_url": link.original_url,
                    "target_platform": link.detected_platform,
                    "utm_source": link.utm_source,
                    "utm_campaign": link.utm_campaign,
                    "click_timestamp": event.created_at.isoformat(),
                }

        return {
            "matched": False,
            "confidence_score": 0.0,
            "message": "No matching deferred deep link click found within window.",
        }
