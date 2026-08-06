"""Link business logic service."""

from datetime import datetime, timedelta
from typing import Optional, Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.link import Link
from app.repositories.link_repository import LinkRepository
from app.cache.redis_client import RedisCache
from app.utils.id_generator import generate_link_id
from app.utils.validators import detect_platform, get_app_scheme
from app.core.exceptions import (
    AliasTakenException,
    LinkNotFoundException,
    InvalidURLError,
)
from app.schemas.link import LinkCreate, LinkUpdate, LinkResponse, LinkStats

settings = get_settings()


class LinkService:
    """Business logic for link operations."""

    def __init__(
        self,
        session: AsyncSession,
        cache: Optional[RedisCache] = None,
    ):
        self._repo = LinkRepository(session)
        self._cache = cache

    async def create_link(self, data: LinkCreate, base_url: str) -> LinkResponse:
        """Create a new smart link."""
        url_str = str(data.original_url)
        if not url_str.startswith(("http://", "https://")):
            raise InvalidURLError(url_str)

        # Check alias availability
        if data.alias and await self._repo.alias_exists(data.alias):
            raise AliasTakenException(data.alias)

        # Detect platform
        platform = detect_platform(url_str)
        scheme = get_app_scheme(platform) if platform else None

        # Calculate expiry
        expires_at = None
        if data.expires_in_hours:
            expires_at = datetime.utcnow() + timedelta(hours=data.expires_in_hours)

        # Generate ID
        link_id = generate_link_id()
        while await self._repo.get_by_id(link_id):
            link_id = generate_link_id()

        link = Link(
            id=link_id,
            original_url=url_str,
            alias=data.alias,
            title=data.title,
            description=data.description,
            detected_platform=platform,
            target_app_scheme=scheme,
            password_hash=data.password,  # Hash in production
            expires_at=expires_at,
            max_clicks=data.max_clicks,
            utm_source=data.utm_source,
            utm_medium=data.utm_medium,
            utm_campaign=data.utm_campaign,
            utm_content=data.utm_content,
            utm_term=data.utm_term,
        )

        created = await self._repo.create(link)

        # Cache the link
        if self._cache:
            await self._cache.set_json(
                f"link:{created.id}",
                {
                    "id": created.id,
                    "original_url": created.original_url,
                    "alias": created.alias,
                    "detected_platform": created.detected_platform,
                    "target_app_scheme": created.target_app_scheme,
                    "is_active": created.is_active,
                    "expires_at": created.expires_at.isoformat() if created.expires_at else None,
                    "max_clicks": created.max_clicks,
                    "current_clicks": created.current_clicks,
                },
                ttl=settings.REDIRECT_CACHE_TTL,
            )

        short_url = f"{base_url}/{created.alias or created.id}"
        return LinkResponse(
            **{k: v for k, v in created.__dict__.items() if not k.startswith("_")},
            short_url=short_url,
        )

    async def get_link(self, identifier: str) -> Link:
        """Get a link by ID or alias."""
        # Try cache first
        if self._cache:
            cached = await self._cache.get_json(f"link:{identifier}")
            if cached:
                # Reconstruct link object from cache
                pass  # Will implement full cache reconstruction in production

        link = await self._repo.get_by_id_or_alias(identifier)
        if not link:
            raise LinkNotFoundException(identifier)
        return link

    async def get_link_stats(self, link_id: str) -> LinkStats:
        """Get statistics for a link."""
        from app.repositories.analytics_repository import AnalyticsRepository
        analytics_repo = AnalyticsRepository(self._repo._session)

        total = await analytics_repo.get_total_clicks(link_id)
        unique = await analytics_repo.get_unique_visitors(link_id)

        return LinkStats(
            total_clicks=total,
            unique_visitors=unique,
            countries=await analytics_repo.get_country_breakdown(link_id),
            devices=await analytics_repo.get_device_breakdown(link_id),
            browsers=await analytics_repo.get_browser_breakdown(link_id),
            os=await analytics_repo.get_os_breakdown(link_id),
            clicks_over_time=await analytics_repo.get_clicks_over_time(link_id),
        )

    async def list_links(self, skip: int = 0, limit: int = 100) -> Sequence[Link]:
        """List all links."""
        return await self._repo.list_all(skip=skip, limit=limit)

    async def update_link(self, link_id: str, data: LinkUpdate) -> LinkResponse:
        """Update a link."""
        link = await self._repo.get_by_id(link_id)
        if not link:
            raise LinkNotFoundException(link_id)

        update_data = data.model_dump(exclude_unset=True)
        if "expires_in_hours" in update_data:
            hours = update_data.pop("expires_in_hours")
            update_data["expires_at"] = datetime.utcnow() + timedelta(hours=hours)

        updated = await self._repo.update(link_id, **update_data)

        # Invalidate cache
        if self._cache:
            await self._cache.delete(f"link:{link_id}")
            if link.alias:
                await self._cache.delete(f"link:{link.alias}")

        return LinkResponse(
            **{k: v for k, v in updated.__dict__.items() if not k.startswith("_")},
            short_url=f"http://localhost:8000/{updated.alias or updated.id}",
        )

    async def delete_link(self, link_id: str) -> bool:
        """Soft delete a link."""
        result = await self._repo.delete(link_id)
        if self._cache:
            await self._cache.delete(f"link:{link_id}")
        return result
