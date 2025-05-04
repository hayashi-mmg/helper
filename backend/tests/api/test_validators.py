"""
入力バリデーション機能テスト
"""
import pytest
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.auth import get_current_active_user
from app.schemas.validators import (
    validate_url,
    validate_future_date,
    validate_recipe_content,
    validate_email,
    validate_phone_number,
    validate_postal_code,
    validate_tags,
    validate_username
)
from pydantic import ValidationError


class TestURLValidator:
    """URLバリデータのテスト"""

    def test_valid_urls(self):
        """有効なURLの検証"""
        valid_urls = [
            "https://cookpad.com/recipe/123456",
            "http://example.com/recipe",
            "https://www.delish-kitchen.com/recipe/123456",
            "https://localhost:8000/recipe",
            "https://192.168.1.1/recipe"
        ]
        for url in valid_urls:
            assert validate_url(url) == url

    def test_invalid_urls(self):
        """無効なURLの検証"""
        invalid_urls = [
            "ftp://example.com/recipe",  # 未サポートのスキーム
            "https://",  # ホストなし
            "example.com",  # スキームなし
            "javascript:alert('XSS')",  # 危険なスキーム
            "<script>alert('XSS')</script>",  # スクリプトインジェクション
        ]
        for url in invalid_urls:
            with pytest.raises(ValueError):
                validate_url(url)

    def test_none_url(self):
        """None値の処理"""
        assert validate_url(None) is None


class TestDateValidator:
    """日付バリデータのテスト"""

    def test_future_date(self):
        """未来の日付は有効"""
        future_date = date.today() + timedelta(days=7)
        assert validate_future_date(future_date) == future_date

    def test_today_date(self):
        """今日の日付は有効"""
        today = date.today()
        assert validate_future_date(today) == today

    def test_past_date(self):
        """過去の日付は無効"""
        past_date = date.today() - timedelta(days=7)
        with pytest.raises(ValueError):
            validate_future_date(past_date)

    def test_none_date(self):
        """None値の処理"""
        assert validate_future_date(None) is None


class TestRecipeContentValidator:
    """レシピ内容バリデータのテスト"""

    def test_valid_recipe_content(self):
        """有効なレシピ内容の検証"""
        valid_content = {
            "title": "ハンバーグ",
            "ingredients": [
                {"name": "牛ひき肉", "quantity": "300g"},
                {"name": "玉ねぎ", "quantity": "1個"}
            ],
            "steps": [
                {"number": 1, "text": "ボウルに材料を入れる"},
                {"number": 2, "text": "よく混ぜる"}
            ]
        }
        assert validate_recipe_content(valid_content) == valid_content

    def test_missing_required_keys(self):
        """必須キーが欠けている場合"""
        invalid_contents = [
            {"ingredients": [], "steps": []},  # titleなし
            {"title": "ハンバーグ", "steps": []},  # ingredientsなし
            {"title": "ハンバーグ", "ingredients": []}  # stepsなし
        ]
        for content in invalid_contents:
            with pytest.raises(ValueError):
                validate_recipe_content(content)

    def test_invalid_ingredient_format(self):
        """無効な材料フォーマット"""
        invalid_content = {
            "title": "ハンバーグ",
            "ingredients": "牛ひき肉300g",  # 文字列（配列であるべき）
            "steps": [{"number": 1, "text": "混ぜる"}]
        }
        with pytest.raises(ValueError):
            validate_recipe_content(invalid_content)

    def test_invalid_step_format(self):
        """無効な手順フォーマット"""
        invalid_content = {
            "title": "ハンバーグ",
            "ingredients": [{"name": "牛ひき肉", "quantity": "300g"}],
            "steps": "混ぜて焼く"  # 文字列（配列であるべき）
        }
        with pytest.raises(ValueError):
            validate_recipe_content(invalid_content)

    def test_empty_steps(self):
        """空の手順リスト"""
        invalid_content = {
            "title": "ハンバーグ",
            "ingredients": [{"name": "牛ひき肉", "quantity": "300g"}],
            "steps": []  # 空リスト
        }
        with pytest.raises(ValueError):
            validate_recipe_content(invalid_content)

    def test_none_content(self):
        """None値の処理"""
        assert validate_recipe_content(None) is None


class TestTagsValidator:
    """タグバリデータのテスト"""

    def test_valid_tags(self):
        """有効なタグリスト"""
        valid_tags = ["肉", "和食", "簡単"]
        assert validate_tags(valid_tags) == valid_tags

    def test_duplicate_tags(self):
        """重複タグの処理"""
        duplicate_tags = ["肉", "和食", "肉"]
        result = validate_tags(duplicate_tags)
        # 重複が排除されていることを検証
        assert len(result) == 2
        assert "肉" in result and "和食" in result

    def test_invalid_tag_format(self):
        """無効なタグフォーマット"""
        invalid_tags = ["肉", 123, "和食"]  # 数値が含まれる
        with pytest.raises(ValueError):
            validate_tags(invalid_tags)

    def test_empty_tags(self):
        """空のタグリスト"""
        assert validate_tags([]) == []

    def test_none_tags(self):
        """None値の処理"""
        assert validate_tags(None) is None
