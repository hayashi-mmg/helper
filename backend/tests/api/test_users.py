"""
ユーザー関連エンドポイントのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.models.user import User, UserRole
from app.core.auth import create_access_token


@pytest.mark.asyncio
async def test_read_users_me(
    test_client: AsyncClient, normal_user_token_headers: dict
):
    """現在のユーザー情報取得エンドポイントのテスト"""
    response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data
    assert "email" in data


@pytest.mark.asyncio
async def test_read_user_by_id(
    test_client: AsyncClient, 
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    test_db: AsyncSession
):
    """指定IDのユーザー情報取得エンドポイントのテスト"""
    # 自分自身の情報取得
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    response = await test_client.get(
        f"/api/v1/users/{user_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == user_id

    # 管理者が他ユーザーの情報取得
    response = await test_client.get(
        f"/api/v1/users/{user_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == user_id

    # 他ユーザーの情報取得（権限なし）
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=admin_user_token_headers
    )
    admin_id = user_response.json()["id"]
    
    response = await test_client.get(
        f"/api/v1/users/{admin_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_read_user_helpers(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_user_helper_relationship: dict,
    test_db: AsyncSession
):
    """ユーザーに紐付けられたヘルパー一覧取得エンドポイントのテスト"""
    user_id = create_test_user_helper_relationship["user_id"]
    helper_id = create_test_user_helper_relationship["helper_id"]
    
    # 自分自身のヘルパー一覧取得
    response = await test_client.get(
        f"/api/v1/users/{user_id}/helpers",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    helpers = response.json()
    assert len(helpers) >= 1
    assert any(h["helper_id"] == helper_id for h in helpers)

    # 管理者が他ユーザーのヘルパー一覧取得
    response = await test_client.get(
        f"/api/v1/users/{user_id}/helpers",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    
    # 他ユーザーのヘルパー一覧取得（権限なし）
    other_user_response = await test_client.get(
        "/api/v1/users/me",
        headers=admin_user_token_headers
    )
    other_user_id = other_user_response.json()["id"]
    
    response = await test_client.get(
        f"/api/v1/users/{other_user_id}/helpers",
        headers=normal_user_token_headers
    )
    assert response.status_code == 403
