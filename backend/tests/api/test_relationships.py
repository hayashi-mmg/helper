"""
ユーザーとヘルパーの関連付け管理エンドポイントのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.models.user import User, UserRole
from app.db.models.user_helper_assignment import RelationshipStatus
from app.core.auth import create_access_token


@pytest.mark.asyncio
async def test_create_relationship(
    test_client: AsyncClient,
    admin_user_token_headers: dict,
    normal_user_token_headers: dict,
    helper_user_token_headers: dict,
    test_db: AsyncSession
):
    """ユーザーとヘルパーの関連付け作成エンドポイントのテスト"""
    # 事前に必要なユーザー情報を取得
    normal_user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    normal_user_id = normal_user_response.json()["id"]
    
    # ヘルパーユーザーのIDを取得（仮定）
    helper_user_response = await test_client.get(
        "/api/v1/users/me",
        headers=helper_user_token_headers
    )
    helper_user_id = helper_user_response.json()["id"]
    
    # 管理者が関連付け作成
    relationship_data = {
        "user_id": normal_user_id,
        "helper_id": helper_user_id,
        "status": RelationshipStatus.ACTIVE
    }
    
    response = await test_client.post(
        "/api/v1/relationships/",
        headers=admin_user_token_headers,
        json=relationship_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == normal_user_id
    assert data["helper_id"] == helper_user_id
    assert data["status"] == RelationshipStatus.ACTIVE
    
    # 一般ユーザーが関連付け作成（権限なし）
    relationship_data = {
        "user_id": normal_user_id + 1,
        "helper_id": helper_user_id,
        "status": RelationshipStatus.ACTIVE
    }
    
    response = await test_client.post(
        "/api/v1/relationships/",
        headers=normal_user_token_headers,
        json=relationship_data
    )
    assert response.status_code == 403
    
    # 重複した関連付け作成（エラー）
    relationship_data = {
        "user_id": normal_user_id,
        "helper_id": helper_user_id,
        "status": RelationshipStatus.ACTIVE
    }
    
    response = await test_client.post(
        "/api/v1/relationships/",
        headers=admin_user_token_headers,
        json=relationship_data
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_update_relationship(
    test_client: AsyncClient,
    admin_user_token_headers: dict,
    normal_user_token_headers: dict,
    create_test_user_helper_relationship: dict
):
    """ユーザーとヘルパーの関連付け更新エンドポイントのテスト"""
    relationship_id = create_test_user_helper_relationship["id"]
    
    # 管理者が関連付け更新
    update_data = {
        "status": RelationshipStatus.INACTIVE
    }
    
    response = await test_client.put(
        f"/api/v1/relationships/{relationship_id}",
        headers=admin_user_token_headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == RelationshipStatus.INACTIVE
    
    # 一般ユーザーが関連付け更新（権限なし）
    update_data = {
        "status": RelationshipStatus.ACTIVE
    }
    
    response = await test_client.put(
        f"/api/v1/relationships/{relationship_id}",
        headers=normal_user_token_headers,
        json=update_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_relationship(
    test_client: AsyncClient,
    admin_user_token_headers: dict,
    normal_user_token_headers: dict,
    create_test_user_helper_relationship: dict
):
    """ユーザーとヘルパーの関連付け削除エンドポイントのテスト"""
    relationship_id = create_test_user_helper_relationship["id"]
    
    # 一般ユーザーが関連付け削除（権限なし）
    response = await test_client.delete(
        f"/api/v1/relationships/{relationship_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 403
    
    # 管理者が関連付け削除
    response = await test_client.delete(
        f"/api/v1/relationships/{relationship_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 204
    
    # 削除済みの関連付けを再度削除（存在しない）
    response = await test_client.delete(
        f"/api/v1/relationships/{relationship_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 404
