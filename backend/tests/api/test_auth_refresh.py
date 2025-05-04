"""
トークン更新APIのユニットテスト
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.auth import get_password_hash, create_refresh_token
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_refresh_token_success(db_session: AsyncSession):
    """
    正常なトークン更新
    """
    # テストユーザー登録
    test_user = User(
        username="testrefresh",
        email="testrefresh@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)
    
    # リフレッシュトークン作成
    refresh_token = create_refresh_token({"sub": str(test_user.id)})
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_refresh_token_invalid():
    """
    無効なリフレッシュトークン
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.string"
        })
        
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data
    assert "WWW-Authenticate" in response.headers


@pytest.mark.asyncio
async def test_refresh_token_expired():
    """
    期限切れリフレッシュトークン（注: 実際の期限切れトークンを模倣した不正なトークン）
    """
    # 不正な署名のトークン
    expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNTE2MjM5MDIyfQ.invalid_signature"
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/refresh", json={
            "refresh_token": expired_token
        })
        
    assert response.status_code == 401
