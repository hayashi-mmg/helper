"""
レシピURLパースAPIエンドポイントのテスト
"""
import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient
from fastapi import status

from app.main import app
from app.services.recipe_parser import RecipeParserFactory


@pytest.mark.asyncio
class TestRecipeParseEndpoints:
    """レシピ解析エンドポイントのテスト"""
    
    @patch("app.services.recipe_parser.RecipeParserFactory.get_parser")
    async def test_parse_recipe_url(self, mock_get_parser, test_client: AsyncClient, normal_user_token_headers: dict):
        """レシピURL解析エンドポイントのテスト"""
        # パーサーのモック
        mock_parser = AsyncMock()
        mock_parser.parse.return_value = {
            "title": "テストレシピ",
            "ingredients": [
                {"name": "材料1", "quantity": "100g"},
                {"name": "材料2", "quantity": "1個"}
            ],
            "steps": [
                {"number": 1, "text": "手順1"},
                {"number": 2, "text": "手順2"}
            ],
            "cooking_time": "30分",
            "source_url": "https://cookpad.com/recipe/12345",
            "source_site": "クックパッド"
        }
        mock_get_parser.return_value = mock_parser
        
        # テスト実行
        response = await test_client.post(
            "/api/v1/recipe-requests/parse-url",
            headers=normal_user_token_headers,
            json={"url": "https://cookpad.com/recipe/12345"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "テストレシピ"
        assert len(data["ingredients"]) == 2
        assert len(data["steps"]) == 2
    
    @patch("app.services.recipe_parser.RecipeParserFactory.get_parser")
    async def test_create_recipe_request_from_url(
        self, mock_get_parser, test_client: AsyncClient, normal_user_token_headers: dict
    ):
        """レシピURLからリクエスト作成エンドポイントのテスト"""
        # パーサーのモック
        mock_parser = AsyncMock()
        mock_parser.parse.return_value = {
            "title": "カレーライス",
            "ingredients": [
                {"name": "肉", "quantity": "200g"},
                {"name": "玉ねぎ", "quantity": "1個"},
                {"name": "じゃがいも", "quantity": "2個"}
            ],
            "steps": [
                {"number": 1, "text": "野菜を切る"},
                {"number": 2, "text": "肉を炒める"},
                {"number": 3, "text": "煮込む"}
            ],
            "cooking_time": "40分",
            "source_url": "https://cookpad.com/recipe/67890",
            "source_site": "クックパッド"
        }
        mock_get_parser.return_value = mock_parser
        
        # テスト実行
        response = await test_client.post(
            "/api/v1/recipe-requests/from-url",
            headers=normal_user_token_headers,
            json={"url": "https://cookpad.com/recipe/67890"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == "カレーライス"
        assert "recipe_url" in data
        assert data["recipe_url"] == "https://cookpad.com/recipe/67890"
        assert "recipe_content" in data
        assert "カレーライス" in data["recipe_content"]
        assert "材料" in data["recipe_content"]
        assert "手順" in data["recipe_content"]
    
    async def test_parse_invalid_url(self, test_client: AsyncClient, normal_user_token_headers: dict):
        """無効なURLの解析テスト"""
        response = await test_client.post(
            "/api/v1/recipe-requests/parse-url",
            headers=normal_user_token_headers,
            json={"url": "https://example.com/not-a-recipe"}
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
