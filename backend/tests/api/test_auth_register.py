"""
ユーザー登録APIのユニットテスト
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from sqlalchemy.ext.asyncio import AsyncSession

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
    assert "id" in data
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_register_user_duplicate_username(db_session: AsyncSession):
    """
    重複するユーザー名でのユーザー登録
    """
    # 事前にユーザーを登録
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/v1/auth/register", json={
            "username": "duplicateuser",
            "email": "original@example.com",
            "password": "password123"
        })

    # 同じユーザー名で再登録を試みる
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "username": "duplicateuser",
            "email": "different@example.com",
            "password": "password123"
        })
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_register_user_duplicate_email(db_session: AsyncSession):
    """
    重複するメールアドレスでのユーザー登録
    """
    # 事前にユーザーを登録
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/v1/auth/register", json={
            "username": "emailuser1",
            "email": "duplicate@example.com",
            "password": "password123"
        })

    # 同じメールアドレスで再登録を試みる
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "username": "emailuser2",
            "email": "duplicate@example.com",
            "password": "password123"
        })
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_register_user_invalid_params():
    """
    無効なパラメータでのユーザー登録
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/register", json={
            "username": "a",  # 短すぎるユーザー名
            "email": "invalid-email",  # 無効なメールアドレス形式
            "password": "123"  # 短すぎるパスワード
        })
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
