"""Analytics event ORM database model."""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, Integer, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnalyticsEvent(Base):
    """Rich visit analytics event entity (50+ data points)."""

    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    link_id: Mapped[str] = mapped_column(String(16), ForeignKey("links.id", ondelete="CASCADE"), index=True, nullable=False)

    visitor_id: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    isp: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    asn: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    browser: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    browser_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    os: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    os_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    device: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    device_type: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    platform: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    languages: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    screen_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    viewport: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pixel_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    color_depth: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    orientation: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    dark_mode: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    reduced_motion: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    high_contrast: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    touch_support: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    max_touch_points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cookies_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    local_storage_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    session_storage_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    indexed_db_enabled: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    service_worker_support: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    webgpu_support: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    referrer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    utm_source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_medium: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_campaign: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_content: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_term: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    network_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    downlink: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rtt: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    save_data: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    hardware_concurrency: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    device_memory: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    battery_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    canvas_fingerprint: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    webgl_fingerprint: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    audio_fingerprint: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    bot_score: Mapped[float] = mapped_column(Float, default=0.0)
    bot_label: Mapped[str] = mapped_column(String(50), default="unknown")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    proxy_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    tor_detected: Mapped[bool] = mapped_column(Boolean, default=False)

    redirect_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    target_platform: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    redirect_strategy: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    link = relationship("Link", back_populates="analytics_events")

    __table_args__ = (
        Index("ix_analytics_link_created", "link_id", "created_at"),
        Index("ix_analytics_visitor_link", "visitor_id", "link_id"),
    )
