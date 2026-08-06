"""Tests for redirect endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.db.session import get_db
from tests.test_links import override_get_db, setup_database, TestingSessionLocal

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_redirect_link(client: AsyncClient):
    # Create a link
    create_resp = await client.post("/api/v1/links", json={
        "original_url": "https://example.com/target",
        "alias": "redirect-test",
    })
    assert create_resp.status_code == 201

    # Test redirect
    response = await client.get("/api/v1/r/redirect-test", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "https://example.com/target"


@pytest.mark.asyncio
async def test_redirect_not_found(client: AsyncClient):
    response = await client.get("/api/v1/r/nonexistent", follow_redirects=False)
    assert response.status_code == 404
