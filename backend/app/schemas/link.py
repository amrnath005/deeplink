"""Pydantic schemas for Link operations."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class LinkBase(BaseModel):
    original_url: HttpUrl
    alias: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None

    # UTM Parameters
    utm_source: Optional[str] = Field(None, max_length=255)
    utm_medium: Optional[str] = Field(None, max_length=255)
    utm_campaign: Optional[str] = Field(None, max_length=255)
    utm_content: Optional[str] = Field(None, max_length=255)
    utm_term: Optional[str] = Field(None, max_length=255)

    @field_validator("alias")
    @classmethod
    def validate_alias(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        if len(v) < 3:
            raise ValueError("Alias must be at least 3 characters")
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Alias can only contain letters, numbers, hyphens, and underscores")
        return v.lower()


class LinkCreate(LinkBase):
    password: Optional[str] = Field(None, max_length=128)
    expires_in_hours: Optional[int] = Field(None, ge=1, le=8760)
    max_clicks: Optional[int] = Field(None, ge=1)


class LinkUpdate(BaseModel):
    original_url: Optional[HttpUrl] = None
    alias: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, max_length=128)
    expires_in_hours: Optional[int] = Field(None, ge=1, le=8760)
    max_clicks: Optional[int] = Field(None, ge=1)


class LinkResponse(BaseModel):
    id: str
    short_url: str
    original_url: str
    alias: Optional[str]
    title: Optional[str]
    description: Optional[str]
    detected_platform: Optional[str]
    is_active: bool
    expires_at: Optional[datetime]
    max_clicks: Optional[int]
    current_clicks: int
    qr_code_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class LinkStats(BaseModel):
    total_clicks: int
    unique_visitors: int
    countries: dict[str, int]
    devices: dict[str, int]
    browsers: dict[str, int]
    os: dict[str, int]
    clicks_over_time: list[dict]
