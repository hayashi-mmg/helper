"""
パスワードリセット確認APIのユニットテスト
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.auth import get_password_hash, verify_password
from app.db.models.user import User
from app.services.auth_service import password_reset_tokens
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_password_reset_confirm_success(db_session: AsyncSession):
    """
    正常系: 有効なトークンでのパスワードリセット確認
    """
    # テストユーザー登録
    test_user = User(
        username="resetconfirm",
        email="resetconfirm@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)
    
    # リセットトークン手動設定
    test_token = "valid_test_token"
    password_reset_tokens[test_token] = test_user.id
    
    # 新パスワード
    new_password = "newpassword456"
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset/confirm", json={
            "token": test_token,
            "new_password": new_password
        })
    
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    
    # DBからユーザーを再取得してパスワードが変更されたか確認
    await db_session.refresh(test_user)
    assert verify_password(new_password, test_user.password_hash)
    
    # トークンが削除されたことを確認
    assert test_token not in password_reset_tokens


@pytest.mark.asyncio
async def test_password_reset_confirm_invalid_token():
    """
    異常系: 無効なトークンでのパスワードリセット確認
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset/confirm", json={
            "token": "invalid_token",
            "new_password": "newpassword456"
        })
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "無効" in data["detail"]  # 「無効または期限切れのトークン」などのメッセージを確認


@pytest.mark.asyncio
async def test_password_reset_confirm_weak_password(db_session: AsyncSession):
    """
    異常系: 安全でない新しいパスワード
    """
    # テストユーザー登録
    test_user = User(
        username="weakpassuser",
        email="weakpass@example.com",
        password_hash=get_password_hash("password123")
    )
    db_session.add(test_user)
    await db_session.commit()
    await db_session.refresh(test_user)
    
    # リセットトークン手動設定
    test_token = "weak_pass_token"
    password_reset_tokens[test_token] = test_user.id
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/password-reset/confirm", json={
            "token": test_token,
            "new_password": "short"  # 短すぎるパスワード
        })
    
    assert response.status_code == 422  # バリデーションエラー
    data = response.json()
    assert "detail" in data
