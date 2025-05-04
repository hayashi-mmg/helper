"""
ヘルパー関連エンドポイントのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.models.user import User, UserRole
from app.core.auth import create_access_token


@pytest.fixture
async def helper_user_token_headers(test_client: AsyncClient) -> dict:
    """ヘルパーユーザーのアクセストークン付きヘッダーを返す"""
    access_token = create_access_token(
        data={"sub": "testhelper@example.com", "role": UserRole.HELPER}
    )
    return {"Authorization": f"Bearer {access_token}"}


@pytest.mark.asyncio
async def test_read_helper_me(
    test_client: AsyncClient, 
    helper_user_token_headers: dict,
    create_test_helper_profile: dict
):
    """現在のヘルパープロファイル情報取得エンドポイントのテスト"""
    response = await test_client.get(
        "/api/v1/helpers/me",
        headers=helper_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "qualification" in data
    assert "specialties" in data
    assert "availability" in data


@pytest.mark.asyncio
async def test_read_helper_by_id(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    helper_user_token_headers: dict,
    create_test_helper_profile: dict,
    create_test_user_helper_relationship: dict
):
    """指定IDのヘルパー情報取得エンドポイントのテスト"""
    helper_id = create_test_helper_profile["user_id"]
    
    # ヘルパー自身の情報取得
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}",
        headers=helper_user_token_headers
    )
    assert response.status_code == 200
    
    # 管理者がヘルパー情報取得
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    
    # 関連付けられたユーザーがヘルパー情報取得
    user_id = create_test_user_helper_relationship["user_id"]
    helper_id = create_test_user_helper_relationship["helper_id"]
    
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    
    # 関連のないユーザーがヘルパー情報取得（権限なし）
    unrelated_helper_id = helper_id + 1
    response = await test_client.get(
        f"/api/v1/helpers/{unrelated_helper_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code in [403, 404]  # 存在しない場合は404、存在するが関連がない場合は403


@pytest.mark.asyncio
async def test_read_helper_users(
    test_client: AsyncClient,
    helper_user_token_headers: dict,
    admin_user_token_headers: dict,
    normal_user_token_headers: dict,
    create_test_user_helper_relationship: dict
):
    """ヘルパーに紐付けられたユーザー一覧取得エンドポイントのテスト"""
    user_id = create_test_user_helper_relationship["user_id"]
    helper_id = create_test_user_helper_relationship["helper_id"]
    
    # ヘルパー自身のユーザー一覧取得
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}/users",
        headers=helper_user_token_headers
    )
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 1
    assert any(u["user_id"] == user_id for u in users)
    
    # 管理者がヘルパーのユーザー一覧取得
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}/users",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    
    # 一般ユーザーがヘルパーのユーザー一覧取得（権限なし）
    response = await test_client.get(
        f"/api/v1/helpers/{helper_id}/users",
        headers=normal_user_token_headers
    )
    assert response.status_code == 403
