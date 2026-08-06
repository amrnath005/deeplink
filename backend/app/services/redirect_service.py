"""Redirect engine service."""

from datetime import datetime
from typing import Optional
from urllib.parse import urlencode, parse_qs, urlparse, urlunparse

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
from app.utils.validators import detect_platform

settings = get_settings()


class RedirectService:
    """Handles smart redirect logic with app detection and fallbacks."""

    def __init__(
        self,
        session: AsyncSession,
        cache: Optional[RedisCache] = None,
    ):
        self._repo = LinkRepository(session)
        self._cache = cache

    async def get_redirect_target(
        self,
        identifier: str,
        user_agent: Optional[str] = None,
        password: Optional[str] = None,
    ) -> dict:
        """Determine the optimal redirect target for a visitor."""
        # Try cache first
        cached = None
        if self._cache:
            cached = await self._cache.get_json(f"link:{identifier}")

        if cached:
            link_data = cached
        else:
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

        # Validate link state
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

        # Determine redirect strategy
        platform = link_data.get("detected_platform")
        app_scheme = link_data.get("target_app_scheme")
        original_url = link_data["original_url"]

        # Build redirect response
        redirect_url = original_url

        # If we have an app scheme, construct universal link / app link
        if platform and app_scheme:
            redirect_url = self._build_smart_redirect(
                platform=platform,
                app_scheme=app_scheme,
                original_url=original_url,
                user_agent=user_agent,
            )

        # Increment click counter (async fire-and-forget pattern)
        await self._repo.increment_clicks(link_data["id"])

        return {
            "link_id": link_data["id"],
            "redirect_url": redirect_url,
            "platform": platform,
            "strategy": "app_first" if app_scheme else "browser_fallback",
            "original_url": original_url,
        }

    def _build_smart_redirect(
        self,
        platform: str,
        app_scheme: str,
        original_url: str,
        user_agent: Optional[str],
    ) -> str:
        """Build the optimal redirect URL based on device capabilities."""
        ua = (user_agent or "").lower()

        # iOS Universal Links
        if "iphone" in ua or "ipad" in ua or "ipod" in ua:
            return self._build_ios_redirect(platform, original_url)

        # Android App Links
        if "android" in ua:
            return self._build_android_redirect(platform, original_url)

        # Default: return original URL
        return original_url

    def _build_ios_redirect(self, platform: str, original_url: str) -> str:
        """Build iOS Universal Link or custom scheme."""
        universal_links = {
            "youtube": original_url,  # YouTube handles universal links
            "spotify": original_url,
            "instagram": "instagram://",
            "facebook": "fb://",
            "twitter": "twitter://",
            "x": "twitter://",
        }
        return universal_links.get(platform, original_url)

    def _build_android_redirect(self, platform: str, original_url: str) -> str:
        """Build Android App Link or intent URL."""
        # For Android, we can use intent:// URLs
        intent_urls = {
            "youtube": f"intent://{original_url.replace('https://', '').replace('http://', '')}#Intent;package=com.google.android.youtube;scheme=https;end",
            "spotify": "intent:spotify:open#Intent;package=com.spotify.music;scheme=spotify;end",
        }
        return intent_urls.get(platform, original_url)
