"""Link management API endpoints."""

from typing import Sequence, List

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.cache.redis_client import get_redis_cache, RedisCache
from app.schemas.link import LinkCreate, LinkResponse, LinkUpdate, LinkStats
from app.services.link_service import LinkService
from app.core.exceptions import handle_deeplink_exception, DeepLinkException

router = APIRouter()


@router.post(
    "",
    response_model=LinkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a smart link",
    description="Create a new deep-link redirect with optional alias, expiry, and password.",
)
async def create_link(
    request: Request,
    data: LinkCreate,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> LinkResponse:
    try:
        service = LinkService(db, cache)
        base_url = f"{request.base_url.scheme}://{request.base_url.netloc}"
        return await service.create_link(data, base_url)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.post(
    "/bulk",
    response_model=List[LinkResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk create smart links",
    description="Create multiple deep-links at once from a batch payload.",
)
async def bulk_create_links(
    request: Request,
    data_list: List[LinkCreate],
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> List[LinkResponse]:
    try:
        service = LinkService(db, cache)
        base_url = f"{request.base_url.scheme}://{request.base_url.netloc}"
        created_links = []
        for item in data_list:
            created = await service.create_link(item, base_url)
            created_links.append(created)
        return created_links
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.get(
    "",
    response_model=list[LinkResponse],
    summary="List all links",
    description="Get a paginated list of all created links.",
)
async def list_links(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Sequence[LinkResponse]:
    service = LinkService(db)
    links = await service.list_links(skip=skip, limit=limit)
    return [
        LinkResponse(
            **{k: v for k, v in link.__dict__.items() if not k.startswith("_")},
            short_url=f"http://localhost:8000/{link.alias or link.id}",
        )
        for link in links
    ]


@router.get(
    "/{identifier}",
    response_model=LinkResponse,
    summary="Get link details",
    description="Get details of a specific link by ID or alias.",
)
async def get_link(
    identifier: str,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> LinkResponse:
    try:
        service = LinkService(db, cache)
        link = await service.get_link(identifier)
        return LinkResponse(
            **{k: v for k, v in link.__dict__.items() if not k.startswith("_")},
            short_url=f"http://localhost:8000/{link.alias or link.id}",
        )
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.get(
    "/{link_id}/stats",
    response_model=LinkStats,
    summary="Get link statistics",
    description="Get analytics statistics for a specific link.",
)
async def get_link_stats(
    link_id: str,
    db: AsyncSession = Depends(get_db),
) -> LinkStats:
    try:
        service = LinkService(db)
        return await service.get_link_stats(link_id)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.patch(
    "/{link_id}",
    response_model=LinkResponse,
    summary="Update a link",
    description="Update link properties like URL, alias, expiry, etc.",
)
async def update_link(
    link_id: str,
    data: LinkUpdate,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> LinkResponse:
    try:
        service = LinkService(db, cache)
        return await service.update_link(link_id, data)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)


@router.delete(
    "/{link_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a link",
    description="Soft delete a link (marks as inactive).",
)
async def delete_link(
    link_id: str,
    db: AsyncSession = Depends(get_db),
    cache: RedisCache = Depends(get_redis_cache),
) -> None:
    try:
        service = LinkService(db, cache)
        await service.delete_link(link_id)
    except DeepLinkException as exc:
        raise handle_deeplink_exception(exc)
