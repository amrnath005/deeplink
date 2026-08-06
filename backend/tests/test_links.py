"""Tests for link endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.db.base import Base
from app.db.session import get_db

# Test database
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/deeplink_test"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_create_link(client: AsyncClient):
    response = await client.post("/api/v1/links", json={
        "original_url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
        "alias": "test-link",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["original_url"] == "https://youtube.com/watch?v=dQw4w9WgXcQ"
    assert data["alias"] == "test-link"


@pytest.mark.asyncio
async def test_create_link_invalid_url(client: AsyncClient):
    response = await client.post("/api/v1/links", json={
        "original_url": "not-a-url",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_link(client: AsyncClient):
    # Create first
    create_resp = await client.post("/api/v1/links", json={
        "original_url": "https://example.com",
        "alias": "get-test",
    })
    link_id = create_resp.json()["id"]

    # Get
    response = await client.get(f"/api/v1/links/{link_id}")
    assert response.status_code == 200
    assert response.json()["id"] == link_id


@pytest.mark.asyncio
async def test_list_links(client: AsyncClient):
    response = await client.get("/api/v1/links")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
