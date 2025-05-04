"""
ログインAPIのユニットテスト
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.auth import get_password_hash
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_login_success(db_session: AsyncSession):
    """
    正常なログイン
    """
    # テストユーザー登録
    test_user = User(
        username="testlogin",
        email="testlogin@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "username": "testlogin",
            "password": "password123"
        })
        
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(db_session: AsyncSession):
    """
    無効な認証情報によるログイン失敗
    """
    # テストユーザー登録
    test_user = User(
        username="testloginfail",
        email="testloginfail@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "username": "testloginfail",
            "password": "wrongpassword"
        })
        
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "WWW-Authenticate" in response.headers
    assert response.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_login_non_existent_user():
    """
    存在しないユーザーのログイン
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={
            "username": "nonexistentuser",
            "password": "password123"
        })
        
    assert response.status_code == 401
