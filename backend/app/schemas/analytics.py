"""Pydantic schemas for Analytics operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AnalyticsEventCreate(BaseModel):
    link_id: str = Field(..., max_length=16)

    # Visitor
    visitor_id: Optional[str] = Field(None, max_length=64)
    session_id: Optional[str] = Field(None, max_length=64)

    # Network
    ip_address: Optional[str] = Field(None, max_length=45)
    country: Optional[str] = Field(None, max_length=100)
    region: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    isp: Optional[str] = Field(None, max_length=255)
    asn: Optional[str] = Field(None, max_length=50)

    # Device
    user_agent: Optional[str] = None
    browser: Optional[str] = Field(None, max_length=100)
    browser_version: Optional[str] = Field(None, max_length=50)
    os: Optional[str] = Field(None, max_length=100)
    os_version: Optional[str] = Field(None, max_length=50)
    device: Optional[str] = Field(None, max_length=100)
    device_type: Optional[str] = Field(None, max_length=50)
    platform: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=50)

    # Screen
    screen_size: Optional[str] = Field(None, max_length=50)
    viewport: Optional[str] = Field(None, max_length=50)
    color_depth: Optional[int] = None
    orientation: Optional[str] = Field(None, max_length=20)

    # Capabilities
    dark_mode: Optional[bool] = None
    touch_support: Optional[bool] = None
    cookies_enabled: Optional[bool] = None

    # Referrer
    referrer: Optional[str] = None
    utm_source: Optional[str] = Field(None, max_length=255)
    utm_medium: Optional[str] = Field(None, max_length=255)
    utm_campaign: Optional[str] = Field(None, max_length=255)
    utm_content: Optional[str] = Field(None, max_length=255)
    utm_term: Optional[str] = Field(None, max_length=255)

    # Network Performance
    network_type: Optional[str] = Field(None, max_length=50)
    downlink: Optional[float] = None
    rtt: Optional[int] = None
    save_data: Optional[bool] = None

    # Hardware
    hardware_concurrency: Optional[int] = None
    device_memory: Optional[float] = None
    battery_level: Optional[float] = None

    # Fingerprints
    canvas_fingerprint: Optional[str] = Field(None, max_length=64)
    webgl_fingerprint: Optional[str] = Field(None, max_length=64)
    audio_fingerprint: Optional[str] = Field(None, max_length=64)

    # Bot Detection
    bot_score: float = 0.0
    bot_label: str = "unknown"

    # Redirect
    redirect_time_ms: Optional[float] = None
    target_platform: Optional[str] = Field(None, max_length=50)
    redirect_strategy: Optional[str] = Field(None, max_length=50)


class AnalyticsEventResponse(AnalyticsEventCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
