"""
フィードバック関連APIのテスト
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status

from app.db.models.user import User, UserRole
from app.db.models.recipe_request import RecipeRequest
from app.db.models.feedback import Feedback
from app.tests.utils.user import create_test_user
from app.tests.utils.auth import create_token_for_user
from app.tests.utils.recipe_request import create_test_recipe_request
from app.tests.utils.feedback import create_test_feedback


@pytest.mark.asyncio
async def test_create_feedback(client: AsyncClient, db_session: AsyncSession):
    """フィードバック作成のテスト"""
    # テストユーザー作成
    user = await create_test_user(db_session)
    token = create_token_for_user(user)
    
    # レシピリクエスト作成
    recipe_request = await create_test_recipe_request(db_session, user_id=user.id)
    
    # フィードバックデータ
    feedback_data = {
        "recipe_request_id": recipe_request.id,
        "user_id": user.id,
        "taste_rating": 5,
        "texture_rating": 4,
        "quantity_rating": 3,
        "overall_rating": 4,
        "comments": "とても美味しかったです。また食べたいです。",
        "request_for_next": "次回はもう少し量を増やしていただけると嬉しいです。"
    }
    
    # フィードバック作成リクエスト
    response = await client.post(
        "/api/v1/feedback/",
        json=feedback_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["recipe_request_id"] == recipe_request.id
    assert data["user_id"] == user.id
    assert data["taste_rating"] == 5
    assert data["overall_rating"] == 4
    assert data["comments"] == "とても美味しかったです。また食べたいです。"
    assert "created_at" in data


@pytest.mark.asyncio
async def test_read_feedback(client: AsyncClient, db_session: AsyncSession):
    """フィードバック取得のテスト"""
    # テストユーザー作成
    user = await create_test_user(db_session)
    token = create_token_for_user(user)
    
    # レシピリクエスト作成
    recipe_request = await create_test_recipe_request(db_session, user_id=user.id)
    
    # フィードバック作成
    feedback = await create_test_feedback(db_session, recipe_request_id=recipe_request.id, user_id=user.id)
    
    # フィードバック取得リクエスト
    response = await client.get(
        f"/api/v1/feedback/{feedback.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == feedback.id
    assert data["recipe_request_id"] == recipe_request.id
    assert data["user_id"] == user.id


@pytest.mark.asyncio
async def test_update_feedback(client: AsyncClient, db_session: AsyncSession):
    """フィードバック更新のテスト"""
    # テストユーザー作成
    user = await create_test_user(db_session)
    token = create_token_for_user(user)
    
    # レシピリクエスト作成
    recipe_request = await create_test_recipe_request(db_session, user_id=user.id)
    
    # フィードバック作成
    feedback = await create_test_feedback(db_session, recipe_request_id=recipe_request.id, user_id=user.id)
    
    # 更新データ
    update_data = {
        "overall_rating": 5,
        "comments": "更新後のコメントです。"
    }
    
    # フィードバック更新リクエスト
    response = await client.put(
        f"/api/v1/feedback/{feedback.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == feedback.id
    assert data["overall_rating"] == 5
    assert data["comments"] == "更新後のコメントです。"


@pytest.mark.asyncio
async def test_delete_feedback(client: AsyncClient, db_session: AsyncSession):
    """フィードバック削除のテスト"""
    # テストユーザー作成
    user = await create_test_user(db_session)
    token = create_token_for_user(user)
    
    # レシピリクエスト作成
    recipe_request = await create_test_recipe_request(db_session, user_id=user.id)
    
    # フィードバック作成
    feedback = await create_test_feedback(db_session, recipe_request_id=recipe_request.id, user_id=user.id)
    
    # フィードバック削除リクエスト
    response = await client.delete(
        f"/api/v1/feedback/{feedback.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # 削除確認
    response = await client.get(
        f"/api/v1/feedback/{feedback.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
