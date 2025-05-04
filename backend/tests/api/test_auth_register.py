"""
ユーザー登録APIのユニットテスト
"""


import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio

# テスト用DBリセット用fixture
from app.db.base import Base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/markdown_cms")
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
TestSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(autouse=True)
async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.mark.asyncio
async def test_register_user_success():
    """
    正常なユーザー登録
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "password123"
        })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser1"
    assert data["email"] == "testuser1@example.com"

@pytest.mark.asyncio
async def test_register_user_missing_param():
    """
    パラメータ不足時のエラー
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "username": "",
            "email": "",
            "password": ""
        })
    assert response.status_code == 422
