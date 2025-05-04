"""
APIエンドポイントの入力バリデーションテスト
"""
import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.recipe_request import RecipeRequest, RecipeRequestStatus


@pytest.mark.asyncio
async def test_invalid_recipe_request_creation(
    test_client: AsyncClient,
    normal_user_token_headers: dict
):
    """
    料理リクエスト作成エンドポイントの入力バリデーションテスト
    """
    # 自分のリクエストを作成用のユーザーID取得
    user_response = await test_client.get(
        "/api/v1/users/me",
        headers=normal_user_token_headers
    )
    user_id = user_response.json()["id"]
    
    # テストケース1: 必須フィールドなし
    empty_data = {
        "user_id": user_id
    }
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=empty_data
    )
    assert response.status_code == 422  # バリデーションエラー
    
    # テストケース2: タイトルが長すぎる
    long_title_data = {
        "user_id": user_id,
        "title": "あ" * 201,  # 201文字（上限は200文字）
        "description": "テスト説明"
    }
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=long_title_data
    )
    assert response.status_code == 422
    
    # テストケース3: 無効な優先度
    invalid_priority_data = {
        "user_id": user_id,
        "title": "テストレシピ",
        "description": "テスト説明",
        "priority": 6  # 範囲外（0-5が有効）
    }
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=invalid_priority_data
    )
    assert response.status_code == 422
    
    # テストケース4: 過去の日付
    past_date_data = {
        "user_id": user_id,
        "title": "テストレシピ",
        "description": "テスト説明",
        "scheduled_date": str(date.today() - timedelta(days=1))  # 昨日
    }
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=past_date_data
    )
    assert response.status_code == 422
    
    # テストケース5: 無効なURL形式
    invalid_url_data = {
        "user_id": user_id,
        "title": "テストレシピ",
        "description": "テスト説明",
        "recipe_url": "invalid-url"  # 無効なURL
    }
    response = await test_client.post(
        "/api/v1/recipe-requests/",
        headers=normal_user_token_headers,
        json=invalid_url_data
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recipe_request_update_validation(
    test_client: AsyncClient,
    normal_user_token_headers: dict,
    create_test_recipe_request: dict
):
    """料理リクエスト更新エンドポイントのバリデーションテスト"""
    recipe_id = create_test_recipe_request["id"]
    
    # テストケース1: 無効なタイトル
    invalid_title_data = {
        "title": ""  # 空のタイトル（最小1文字）
    }
    response = await test_client.put(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers,
        json=invalid_title_data
    )
    assert response.status_code == 422
    
    # テストケース2: タイトルが長すぎる
    long_title_data = {
        "title": "あ" * 201  # 201文字（上限は200文字）
    }
    response = await test_client.put(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers,
        json=long_title_data
    )
    assert response.status_code == 422
    
    # テストケース3: 無効な優先度
    invalid_priority_data = {
        "priority": -1  # 範囲外（0-5が有効）
    }
    response = await test_client.put(
        f"/api/v1/recipe-requests/{recipe_id}",
        headers=normal_user_token_headers,
        json=invalid_priority_data
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_url_parse_validation(
    test_client: AsyncClient,
    normal_user_token_headers: dict
):
    """URL解析エンドポイントのバリデーションテスト"""
    
    # テストケース1: 無効なURL
    response = await test_client.post(
        "/api/v1/recipe-requests/parse-url",
        headers=normal_user_token_headers,
        json={"url": "not-a-url"}
    )
    assert response.status_code == 400
    
    # テストケース2: サポートされていないスキーム
    response = await test_client.post(
        "/api/v1/recipe-requests/parse-url",
        headers=normal_user_token_headers,
        json={"url": "ftp://example.com/recipe"}
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_from_url_validation(
    test_client: AsyncClient,
    normal_user_token_headers: dict
):
    """URLからのリクエスト作成エンドポイントのバリデーションテスト"""
    
    # テストケース1: 過去の予定日
    past_date = date.today() - timedelta(days=1)
    response = await test_client.post(
        "/api/v1/recipe-requests/from-url",
        headers=normal_user_token_headers,
        json={
            "url": "https://cookpad.com/recipe/123456",
            "scheduled_date": str(past_date)
        }
    )
    assert response.status_code == 400
    
    # テストケース2: 無効な優先度
    response = await test_client.post(
        "/api/v1/recipe-requests/from-url",
        headers=normal_user_token_headers,
        json={
            "url": "https://cookpad.com/recipe/123456",
            "priority": 10  # 範囲外（0-5が有効）
        }
    )
    assert response.status_code == 422
