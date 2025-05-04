"""
料理リクエスト関連エンドポイントのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta

from app.main import app
from app.db.models.user import User, UserRole
from app.db.models.recipe_request import RecipeRequest, RecipeRequestStatus


@pytest.fixture
async def create_test_recipe_request(test_db: AsyncSession, normal_user_token_headers: dict):
    """テスト用料理リクエスト作成フィクスチャー"""
    from app.core.auth import get_user_from_token
    
    # トークンからユーザー情報取得
    token = normal_user_token_headers["Authorization"].split(" ")[1]
    user_info = get_user_from_token(token)
    
    # ユーザーIDの取得（テストユーザーは conftest.py で作成済み）
    from app.crud.users import crud_user
    user = await crud_user.get_by_email(test_db, email=user_info.get("sub"))
    
    # 料理リクエスト作成
    recipe_request = RecipeRequest(
        user_id=user.id,
        title="テスト料理リクエスト",
        description="これはテスト用の料理リクエストです。",
        recipe_url="https://example.com/recipe/123",
        recipe_content="カレーライスの作り方...",
        scheduled_date=date.today() + timedelta(days=3),
        status=RecipeRequestStatus.PENDING
    )
    test_db.add(recipe_request)
    await test_db.commit()
    await test_db.refresh(recipe_request)
    
    return {
        "id": recipe_request.id,
        "user_id": user.id,
        "title": recipe_request.title
    }


@pytest.mark.asyncio
async def test_create_recipe_request(
    test_client: AsyncClient,
    normal_user_token_headers: dict
):
    """料理リクエスト作成エンドポイントのテスト"""
    # 自分のリクエストを作成する
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    recipe_request_data = {
        "user_id": user_id,
        "title": "新しい料理リクエスト",
        "description": "これは新しい料理リクエストのテストです。",
        "recipe_url": "https://example.com/recipe/new",
        "recipe_content": "ハンバーグの作り方...",
        "scheduled_date": str(date.today() + timedelta(days=5)),
        "status": "pending"
    }
    
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=recipe_request_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == recipe_request_data["title"]
    assert data["user_id"] == user_id
    
    # 他ユーザーのリクエストを作成しようとする（エラー）
    recipe_request_data["user_id"] = user_id + 1
    
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=recipe_request_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_read_recipe_requests(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_recipe_request: dict
):
    """料理リクエスト一覧取得エンドポイントのテスト"""
    # 一般ユーザーが自分のリクエスト一覧取得
    response = await test_client.get(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["id"] == create_test_recipe_request["id"] for r in data)
    
    # 管理者が全リクエスト一覧取得
    response = await test_client.get(
        "/api/v1/recipe-requests/",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_read_recipe_request_by_id(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_recipe_request: dict
):
    """料理リクエスト個別取得エンドポイントのテスト"""
    recipe_id = create_test_recipe_request["id"]
    
    # 自分のリクエスト取得
    response = await test_client.get(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe_id
    assert data["title"] == create_test_recipe_request["title"]
    
    # 管理者が任意のリクエスト取得
    response = await test_client.get(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=admin_user_token_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == recipe_id


@pytest.mark.asyncio
async def test_update_recipe_request(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    create_test_recipe_request: dict
):
    """料理リクエスト更新エンドポイントのテスト"""
    recipe_id = create_test_recipe_request["id"]
    
    # リクエスト更新
    update_data = {
        "title": "更新された料理リクエスト",
        "description": "これは更新されたリクエストです。"
    }
    
    response = await test_client.put(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["description"] == update_data["description"]


@pytest.mark.asyncio
async def test_update_recipe_request_status(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    helper_user_token_headers: dict,
    create_test_recipe_request: dict
):
    """料理リクエストステータス更新エンドポイントのテスト"""
    recipe_id = create_test_recipe_request["id"]
    
    # ヘルパーがステータス更新
    status_data = {
        "status": "active"
    }
    
    response = await test_client.patch(
        f"/api/v1/recipe-requests/{recipe_id}/status",
        headers=helper_user_token_headers,
        params=status_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    
    # ユーザーがキャンセルに更新
    status_data = {
        "status": "cancelled"
    }
    
    response = await test_client.patch(
        f"/api/v1/recipe-requests/{recipe_id}/status",
        headers=normal_user_token_headers,
        params=status_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "cancelled"
    
    # ユーザーが完了に更新（エラー）
    status_data = {
        "status": "completed"
    }
    
    response = await test_client.patch(
        f"/api/v1/recipe-requests/{recipe_id}/status",
        headers=normal_user_token_headers,
        params=status_data
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_recipe_request(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    admin_user_token_headers: dict,
    test_db: AsyncSession
):
    """料理リクエスト削除エンドポイントのテスト"""
    # 新しいリクエストを作成
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    recipe_request_data = {
        "user_id": user_id,
        "title": "削除用リクエスト",
        "description": "これは削除テスト用のリクエストです。",
        "status": "pending"
    }
    
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=recipe_request_data
    )
    recipe_id = response.json()["id"]
    
    # リクエスト削除
    response = await test_client.delete(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 204
    
    # 削除されたことを確認
    response = await test_client.get(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers
    )
    assert response.status_code == 404
