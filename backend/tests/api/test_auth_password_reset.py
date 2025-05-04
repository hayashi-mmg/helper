"""
パスワードリセット要求APIのユニットテスト
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.auth import get_password_hash
from app.db.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
import re


@pytest.mark.asyncio
async def test_password_reset_request_existing_email(db_session: AsyncSession):
    """
    正常系: 存在するメールアドレスでのパスワードリセット要求
    """
    # テストユーザー登録
    test_user = User(
        username="resetuser",
        email="reset@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset", json={
            "email": "reset@example.com"
        })
        
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    # リセット手順が送信されたというメッセージを確認
    assert re.search(r"パスワードリセット", data["message"]) is not None


@pytest.mark.asyncio
async def test_password_reset_request_nonexistent_email():
    """
    正常系: 存在しないメールアドレスでのパスワードリセット要求
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset", json={
            "email": "nonexistent@example.com"
        })
        
    assert response.status_code == 200  # セキュリティのため、存在しないメールでも200を返す
    data = response.json()
    assert "message" in data
    # リセット手順が送信されたというメッセージを確認
    assert re.search(r"パスワードリセット", data["message"]) is not None


@pytest.mark.asyncio
async def test_password_reset_request_invalid_email():
    """
    異常系: 無効なメールアドレス形式
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset", json={
            "email": "invalid-email"
        })
        
    assert response.status_code == 422  # バリデーションエラー
    data = response.json()
    assert "detail" in data
