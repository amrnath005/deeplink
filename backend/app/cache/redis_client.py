"""Redis cache client for high-performance lookups."""

import json
from typing import Optional, Any
from functools import lru_cache

import redis.asyncio as redis

from app.config import get_settings

settings = get_settings()


class RedisCache:
    """Async Redis cache wrapper."""

    def __init__(self, redis_url: str = settings.REDIS_URL):
        self._pool = redis.ConnectionPool.from_url(
            redis_url,
            max_connections=settings.REDIS_POOL_SIZE,
            decode_responses=True,
        )
        self._client: Optional[redis.Redis] = None

    async def connect(self) -> None:
        self._client = redis.Redis(connection_pool=self._pool)

    async def disconnect(self) -> None:
        if self._client:
            await self._client.close()

    async def get(self, key: str) -> Optional[str]:
        if not self._client:
            return None
        return await self._client.get(key)

    async def get_json(self, key: str) -> Optional[Any]:
        data = await self.get(key)
        return json.loads(data) if data else None

    async def set(
        self,
        key: str,
        value: str,
        ttl: Optional[int] = None,
    ) -> None:
        if self._client:
            await self._client.set(key, value, ex=ttl)

    async def set_json(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> None:
        await self.set(key, json.dumps(value), ttl)

    async def delete(self, key: str) -> None:
        if self._client:
            await self._client.delete(key)

    async def exists(self, key: str) -> bool:
        if not self._client:
            return False
        return await self._client.exists(key) > 0

    async def increment(self, key: str, amount: int = 1) -> int:
        if not self._client:
            return 0
        return await self._client.incr(key, amount)

    async def expire(self, key: str, seconds: int) -> None:
        if self._client:
            await self._client.expire(key, seconds)

    async def rate_limit_check(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> tuple[bool, int]:
        """Check if rate limit is exceeded. Returns (allowed, remaining)."""
        if not self._client:
            return True, max_requests

        pipe = self._client.pipeline()
        now = await self._client.time()
        current_time = int(now[0])
        window_start = current_time - window_seconds

        # Use sorted set for sliding window
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(current_time): current_time})
        pipe.expire(key, window_seconds)
        results = await pipe.execute()

        request_count = results[1]
        allowed = request_count < max_requests
        remaining = max(0, max_requests - request_count - 1)

        return allowed, remaining


@lru_cache
def get_redis_cache() -> RedisCache:
    return RedisCache()
