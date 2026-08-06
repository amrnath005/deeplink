"""Link data access layer."""

from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.link import Link
from app.core.exceptions import LinkNotFoundException


class LinkRepository:
    """Repository for Link CRUD operations."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, link_id: str) -> Optional[Link]:
        result = await self._session.execute(
            select(Link).where(Link.id == link_id, Link.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_by_alias(self, alias: str) -> Optional[Link]:
        result = await self._session.execute(
            select(Link).where(
                Link.alias == alias,
                Link.is_active == True,
                Link.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id_or_alias(self, identifier: str) -> Optional[Link]:
        result = await self._session.execute(
            select(Link).where(
                ((Link.id == identifier) | (Link.alias == identifier)),
                Link.is_active == True,
                Link.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, link: Link) -> Link:
        self._session.add(link)
        await self._session.flush()
        await self._session.refresh(link)
        return link

    async def update(self, link_id: str, **kwargs) -> Optional[Link]:
        await self._session.execute(
            update(Link)
            .where(Link.id == link_id)
            .values(updated_at=datetime.utcnow(), **kwargs)
        )
        return await self.get_by_id(link_id)

    async def delete(self, link_id: str) -> bool:
        result = await self._session.execute(
            update(Link)
            .where(Link.id == link_id)
            .values(is_deleted=True, is_active=False, updated_at=datetime.utcnow())
        )
        return result.rowcount > 0

    async def increment_clicks(self, link_id: str) -> None:
        await self._session.execute(
            update(Link)
            .where(Link.id == link_id)
            .values(
                current_clicks=Link.current_clicks + 1,
                last_clicked_at=datetime.utcnow(),
            )
        )

    async def alias_exists(self, alias: str) -> bool:
        result = await self._session.execute(
            select(func.count(Link.id)).where(
                Link.alias == alias,
                Link.is_deleted == False,
            )
        )
        return result.scalar() > 0

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
    ) -> Sequence[Link]:
        query = select(Link).where(Link.is_deleted == False)
        if active_only:
            query = query.where(Link.is_active == True)
        query = query.order_by(Link.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(query)
        return result.scalars().all()

    async def get_expired_links(self) -> Sequence[Link]:
        result = await self._session.execute(
            select(Link).where(
                Link.is_active == True,
                Link.is_deleted == False,
                Link.expires_at < datetime.utcnow(),
            )
        )
        return result.scalars().all()
