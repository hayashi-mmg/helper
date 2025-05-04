"""
レシピパーサーのテスト
"""
import pytest
from unittest.mock import patch, AsyncMock
from fastapi import HTTPException

from app.services.recipe_parser import (
    RecipeParserFactory, 
    RecipeUrlValidator,
    CookpadParser,
    RakutenRecipeParser,
    ExciteRecipeParser
)


class TestRecipeUrlValidator:
    """レシピURLバリデーターのテスト"""
    
    def test_validate_valid_url(self):
        """有効なURLの検証テスト"""
        valid_urls = [
            "https://cookpad.com/recipe/123456",
            "https://recipe.rakuten.co.jp/recipe/1234567890/",
            "http://erecipe.excite.co.jp/detail/123456"
        ]
        
        for url in valid_urls:
            assert RecipeUrlValidator.validate(url) is True
    
    def test_validate_invalid_url(self):
        """無効なURLの検証テスト"""
        invalid_urls = [
            "not_a_url",
            "http://",
            "https://example.com",
            "ftp://cookpad.com/recipe/123456"
        ]
        
        for url in invalid_urls:
            assert RecipeUrlValidator.validate(url) is False


class TestRecipeParserFactory:
    """レシピパーサーファクトリーのテスト"""
    
    def test_get_parser_cookpad(self):
        """クックパッドURLのパーサー取得テスト"""
        url = "https://cookpad.com/recipe/123456"
        parser = RecipeParserFactory.get_parser(url)
        assert isinstance(parser, CookpadParser)
    
    def test_get_parser_rakuten(self):
        """楽天レシピURLのパーサー取得テスト"""
        url = "https://recipe.rakuten.co.jp/recipe/1234567890/"
        parser = RecipeParserFactory.get_parser(url)
        assert isinstance(parser, RakutenRecipeParser)
    
    def test_get_parser_excite(self):
        """エキサイトレシピURLのパーサー取得テスト"""
        url = "http://erecipe.excite.co.jp/detail/123456"
        parser = RecipeParserFactory.get_parser(url)
        assert isinstance(parser, ExciteRecipeParser)
    
    def test_get_parser_unsupported(self):
        """サポートされていないURLのパーサー取得テスト"""
        url = "https://example.com/recipe/123456"
        with pytest.raises(HTTPException):
            RecipeParserFactory.get_parser(url)
    
    def test_is_supported_url(self):
        """サポート対象URLの確認テスト"""
        supported_urls = [
            "https://cookpad.com/recipe/123456",
            "https://recipe.rakuten.co.jp/recipe/1234567890/",
            "http://erecipe.excite.co.jp/detail/123456"
        ]
        
        for url in supported_urls:
            assert RecipeParserFactory.is_supported_url(url) is True
        
        unsupported_urls = [
            "https://example.com/recipe/123456",
            "http://cooking.com/recipe/123"
        ]
        
        for url in unsupported_urls:
            assert RecipeParserFactory.is_supported_url(url) is False


@pytest.mark.asyncio
class TestCookpadParser:
    """クックパッドパーサーのテスト"""
    
    @patch("httpx.AsyncClient.get")
    async def test_parse_cookpad(self, mock_get):
        """クックパッドレシピの解析テスト"""
        # モックの設定
        mock_response = AsyncMock()
        mock_response.text = """
        <html>
            <head><title>テストレシピ</title></head>
            <body>
                <h1 class="recipe-title">カレーライス</h1>
                <div class="ingredient-list-item">
                    <div class="ingredient-name">肉</div>
                    <div class="ingredient-quantity">200g</div>
                </div>
                <div class="ingredient-list-item">
                    <div class="ingredient-name">玉ねぎ</div>
                    <div class="ingredient-quantity">1個</div>
                </div>
                <div class="step">
                    <p class="step-text">肉を炒める</p>
                </div>
                <div class="step">
                    <p class="step-text">野菜を加える</p>
                </div>
                <span class="cooking-time">30分</span>
            </body>
        </html>
        """
        mock_response.raise_for_status = AsyncMock()
        mock_get.return_value = mock_response
        
        url = "https://cookpad.com/recipe/123456"
        parser = CookpadParser()
        result = await parser.parse(url)
        
        assert result["title"] == "カレーライス"
        assert len(result["ingredients"]) == 2
        assert result["ingredients"][0]["name"] == "肉"
        assert result["ingredients"][0]["quantity"] == "200g"
        assert len(result["steps"]) == 2
        assert result["steps"][0]["text"] == "肉を炒める"
        assert result["cooking_time"] == "30分"
        assert result["source_url"] == url
        assert result["source_site"] == "クックパッド"


@pytest.mark.asyncio
class TestRakutenRecipeParser:
    """楽天レシピパーサーのテスト"""
    
    @patch("httpx.AsyncClient.get")
    async def test_parse_rakuten(self, mock_get):
        """楽天レシピの解析テスト"""
        # モックの設定
        mock_response = AsyncMock()
        mock_response.text = """
        <html>
            <head><title>テストレシピ</title></head>
            <body>
                <h1 class="recipe-title">ハンバーグ</h1>
                <div class="ingredients-list">
                    <li>
                        <span class="ingredient-name">ひき肉</span>
                        <span class="ingredient-quantity">300g</span>
                    </li>
                    <li>
                        <span class="ingredient-name">パン粉</span>
                        <span class="ingredient-quantity">大さじ2</span>
                    </li>
                </div>
                <div class="procedure">
                    <p>材料を混ぜる</p>
                </div>
                <div class="procedure">
                    <p>形を整えて焼く</p>
                </div>
                <span class="cooking-time">45分</span>
            </body>
        </html>
        """
        mock_response.raise_for_status = AsyncMock()
        mock_get.return_value = mock_response
        
        url = "https://recipe.rakuten.co.jp/recipe/1234567890/"
        parser = RakutenRecipeParser()
        result = await parser.parse(url)
        
        assert result["title"] == "ハンバーグ"
        assert len(result["ingredients"]) == 2
        assert result["ingredients"][0]["name"] == "ひき肉"
        assert result["ingredients"][0]["quantity"] == "300g"
        assert len(result["steps"]) == 2
        assert result["steps"][0]["text"] == "材料を混ぜる"
        assert result["cooking_time"] == "45分"
        assert result["source_url"] == url
        assert result["source_site"] == "楽天レシピ"
