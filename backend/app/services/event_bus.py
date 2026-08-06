"""Asynchronous Redis Streams Event Bus for high-throughput click logging."""

import orjson
import logging
from typing import Dict, Any, Optional
import redis.asyncio as aioredis

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EventBusService:
    """Publish high-volume redirect click events to Redis Streams for async processing."""

    def __init__(self, redis_url: str = settings.REDIS_URL):
        self._redis_url = redis_url
        self._redis: Optional[aioredis.Redis] = None
        self.stream_name = "deeplink:events:stream"

    async def connect(self) -> None:
        """Initialize Redis connection."""
        if not self._redis:
            self._redis = aioredis.from_url(self._redis_url, encoding="utf-8", decode_responses=True)

    async def publish_click_event(self, event_data: Dict[str, Any]) -> None:
        """Publish click event to Redis Stream without blocking redirect latency."""
        try:
            await self.connect()
            if self._redis:
                payload = {
                    "event_id": str(event_data.get("id", "")),
                    "link_id": str(event_data.get("link_id", "")),
                    "data": orjson.dumps(event_data).decode("utf-8"),
                }
                await self._redis.xadd(self.stream_name, payload)
        except Exception as e:
            logger.error(f"Event bus publish error: {e}")

    async def close(self) -> None:
        if self._redis:
            await self._redis.close()


_event_bus: Optional[EventBusService] = None


def get_event_bus() -> EventBusService:
    global _event_bus
    if _event_bus is None:
        _event_bus = EventBusService()
    return _event_bus
