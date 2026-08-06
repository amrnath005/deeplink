"""Async ClickHouse analytics event batch flusher and high-throughput query service."""

import logging
from typing import List, Dict, Any, Optional
import clickhouse_connect

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class ClickHouseService:
    """ClickHouse client wrapper for batch event logging and analytical queries."""

    def __init__(self, host_url: str = settings.CLICKHOUSE_URL):
        self._client: Optional[Any] = None
        self._url = host_url

    def connect(self) -> None:
        """Initialize ClickHouse connection."""
        try:
            url_clean = self._url.replace("http://", "").replace("https://", "")
            host = url_clean.split(":")[0]
            port = int(url_clean.split(":")[1]) if ":" in url_clean else 8123

            self._client = clickhouse_connect.get_client(
                host=host,
                port=port,
                username="default",
                password="",
                connect_timeout=5,
            )
            self._ensure_tables()
        except Exception as e:
            logger.warning(f"ClickHouse connection warning: {e}. Analytics will fallback to PostgreSQL.")

    def _ensure_tables(self) -> None:
        """Create ClickHouse analytics events table if not exists."""
        if not self._client:
            return
        query = """
        CREATE TABLE IF NOT EXISTS analytics_events (
            event_id String,
            link_id String,
            visitor_id String,
            session_id String,
            ip_address String,
            country String,
            city String,
            user_agent String,
            browser String,
            os String,
            device_type String,
            canvas_fingerprint String,
            webgl_fingerprint String,
            bot_score Float32,
            bot_label String,
            redirect_time_ms Float32,
            target_platform String,
            timestamp DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (link_id, timestamp)
        """
        self._client.command(query)

    async def insert_batch(self, events: List[Dict[str, Any]]) -> None:
        """Batch insert analytics events into ClickHouse MergeTree table."""
        if not self._client or not events:
            return

        try:
            data_rows = [
                [
                    str(e.get("id", "")),
                    str(e.get("link_id", "")),
                    str(e.get("visitor_id", "")),
                    str(e.get("session_id", "")),
                    str(e.get("ip_address", "")),
                    str(e.get("country", "")),
                    str(e.get("city", "")),
                    str(e.get("user_agent", "")),
                    str(e.get("browser", "")),
                    str(e.get("os", "")),
                    str(e.get("device_type", "")),
                    str(e.get("canvas_fingerprint", "")),
                    str(e.get("webgl_fingerprint", "")),
                    float(e.get("bot_score", 0.0)),
                    str(e.get("bot_label", "unknown")),
                    float(e.get("redirect_time_ms", 0.0)),
                    str(e.get("target_platform", "")),
                ]
                for e in events
            ]

            columns = [
                "event_id", "link_id", "visitor_id", "session_id", "ip_address",
                "country", "city", "user_agent", "browser", "os", "device_type",
                "canvas_fingerprint", "webgl_fingerprint", "bot_score", "bot_label",
                "redirect_time_ms", "target_platform"
            ]

            self._client.insert("analytics_events", data_rows, column_names=columns)
        except Exception as e:
            logger.error(f"ClickHouse batch insert error: {e}")


_clickhouse_service: Optional[ClickHouseService] = None


def get_clickhouse_service() -> ClickHouseService:
    global _clickhouse_service
    if _clickhouse_service is None:
        _clickhouse_service = ClickHouseService()
        _clickhouse_service.connect()
    return _clickhouse_service
