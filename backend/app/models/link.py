"""Link ORM database model."""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, Integer, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Link(Base):
    """Smart link database entity."""

    __tablename__ = "links"

    id: Mapped[str] = mapped_column(String(16), primary_key=True, index=True)
    original_url: Mapped[str] = mapped_column(Text, nullable=False)
    alias: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    detected_platform: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    target_app_scheme: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, index=True, nullable=True)
    max_clicks: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_clicks: Mapped[int] = mapped_column(Integer, default=0)
    last_clicked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # UTM Parameters
    utm_source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_medium: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_campaign: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_content: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utm_term: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analytics_events = relationship("AnalyticsEvent", back_populates="link", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_links_alias_active", "alias", "is_active", "is_deleted"),
        Index("ix_links_id_active", "id", "is_active", "is_deleted"),
    )
