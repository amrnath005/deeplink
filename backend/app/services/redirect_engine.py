"""Smart Redirect Engine orchestrator."""

from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.link import Link
from app.repositories.link_repository import LinkRepository
from app.cache.redis_client import RedisCache
from app.core.exceptions import (
    LinkNotFoundException,
    LinkExpiredException,
    LinkPasswordProtectedException,
)
from app.core.user_agent_parser import parse_user_agent, DeviceInfo
from app.core.bot_detector import detect_bot, BotCheckResult
from app.core.platform_registry import get_platform
from app.core.deep_link_builder import build_app_redirect_url, generate_smart_html_launcher

settings = get_settings()


class SmartRedirectEngine:
    """Core redirect resolver: Cache → Validation → Device parsing → Bot Detection → Deep Link building."""

    def __init__(
        self,
        session: AsyncSession,
        cache: Optional[RedisCache] = None,
    ):
        self._repo = LinkRepository(session)
        self._cache = cache

    async def resolve_redirect(
        self,
        identifier: str,
        user_agent: Optional[str] = None,
        password: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Resolve shortlink identifier into an actionable smart redirect object."""
        # 1. Cache-first lookup
        link_data = None
        if self._cache:
            link_data = await self._cache.get_json(f"link:{identifier}")

        if not link_data:
            link = await self._repo.get_by_id_or_alias(identifier)
            if not link:
                raise LinkNotFoundException(identifier)

            link_data = {
                "id": link.id,
                "original_url": link.original_url,
                "alias": link.alias,
                "detected_platform": link.detected_platform,
                "target_app_scheme": link.target_app_scheme,
                "is_active": link.is_active,
                "expires_at": link.expires_at.isoformat() if link.expires_at else None,
                "max_clicks": link.max_clicks,
                "current_clicks": link.current_clicks,
                "password_hash": link.password_hash,
            }
            if self._cache:
                await self._cache.set_json(f"link:{identifier}", link_data, ttl=settings.REDIRECT_CACHE_TTL)

        # 2. Validation
        if not link_data.get("is_active"):
            raise LinkNotFoundException(identifier)

        if link_data.get("expires_at"):
            expires = datetime.fromisoformat(link_data["expires_at"])
            if expires < datetime.utcnow():
                raise LinkExpiredException(identifier)

        if link_data.get("max_clicks") and link_data.get("current_clicks", 0) >= link_data["max_clicks"]:
            raise LinkExpiredException(identifier)

        if link_data.get("password_hash") and not password:
            raise LinkPasswordProtectedException()

        # 3. Device & Bot Heuristics
        device_info: DeviceInfo = parse_user_agent(user_agent)
        bot_info: BotCheckResult = detect_bot(user_agent)

        # 4. App Redirect Resolution
        platform_key = link_data.get("detected_platform")
        original_url = link_data["original_url"]

        redirect_build = build_app_redirect_url(platform_key, original_url, device_info)
        platform_cfg = get_platform(platform_key) if platform_key else None

        # 5. Async Click Increment
        await self._repo.increment_clicks(link_data["id"])

        html_launcher = None
        if platform_cfg and redirect_build["app_scheme"]:
            html_launcher = generate_smart_html_launcher(
                app_name=platform_cfg.name,
                app_scheme=redirect_build["app_scheme"],
                web_url=original_url,
                brand_color=platform_cfg.brand_color,
            )

        return {
            "link_id": link_data["id"],
            "original_url": original_url,
            "redirect_url": redirect_build["redirect_url"],
            "strategy": redirect_build["strategy"],
            "platform": platform_key,
            "device_info": device_info.model_dump(),
            "bot_info": bot_info.model_dump(),
            "html_launcher": html_launcher,
        }
