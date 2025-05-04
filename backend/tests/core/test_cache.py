"""
キャッシュ機能のテスト
"""
import pytest
import json
from unittest.mock import patch, AsyncMock, MagicMock
from app.core.cache import (
    set_cache,
    get_cache,
    delete_cache,
    delete_pattern,
    cached,
    invalidate_cache,
    redis_client
)

@pytest.fixture
def mock_redis():
    """Redisクライアントのモック"""
    with patch('app.core.cache.redis_client') as mock:
        mock.get = AsyncMock()
        mock.set = AsyncMock()
        mock.delete = AsyncMock()
        mock.keys = AsyncMock()
        yield mock

@pytest.mark.asyncio
async def test_set_get_cache(mock_redis):
    """キャッシュの設定と取得のテスト"""
    # テストデータ
    test_key = "test:key"
    test_value = {"name": "test", "value": 123}
    
    # モックの設定
    mock_redis.get.return_value = json.dumps(test_value)
    
    # キャッシュ設定
    await set_cache(test_key, test_value, 60)
    
    # キャッシュ取得
    result = await get_cache(test_key)
    
    # 検証
    mock_redis.set.assert_called_once_with(test_key, json.dumps(test_value), ex=60)
    mock_redis.get.assert_called_once_with(test_key)
    assert result == test_value

@pytest.mark.asyncio
async def test_get_cache_none(mock_redis):
    """存在しないキーの取得テスト"""
    # モックの設定
    mock_redis.get.return_value = None
    
    # キャッシュ取得
    result = await get_cache("nonexistent:key")
    
    # 検証
    assert result is None
    mock_redis.get.assert_called_once_with("nonexistent:key")

@pytest.mark.asyncio
async def test_delete_cache(mock_redis):
    """キャッシュ削除のテスト"""
    test_key = "test:key:to:delete"
    
    # キャッシュ削除
    await delete_cache(test_key)
    
    # 検証
    mock_redis.delete.assert_called_once_with(test_key)

@pytest.mark.asyncio
async def test_delete_pattern(mock_redis):
    """パターンによるキャッシュ削除のテスト"""
    test_pattern = "test:*"
    test_keys = ["test:1", "test:2", "test:3"]
    
    # モックの設定
    mock_redis.keys.return_value = test_keys
    
    # パターンによるキャッシュ削除
    await delete_pattern(test_pattern)
    
    # 検証
    mock_redis.keys.assert_called_once_with(test_pattern)
    mock_redis.delete.assert_called_once_with(*test_keys)

@pytest.mark.asyncio
async def test_delete_pattern_no_keys(mock_redis):
    """キーが存在しないパターンによるキャッシュ削除のテスト"""
    test_pattern = "nonexistent:*"
    
    # モックの設定
    mock_redis.keys.return_value = []
    
    # パターンによるキャッシュ削除
    await delete_pattern(test_pattern)
    
    # 検証
    mock_redis.keys.assert_called_once_with(test_pattern)
    mock_redis.delete.assert_not_called()

@pytest.mark.asyncio
async def test_cached_decorator(mock_redis):
    """キャッシュデコレータのテスト"""
    # テスト関数
    @cached(prefix="test", expire=300)
    async def test_function(arg1, arg2=None):
        return f"{arg1}-{arg2}"
    
    # モックの設定
    mock_redis.get.return_value = None  # 最初はキャッシュなし
    
    # 関数呼び出し
    result1 = await test_function("value1", arg2="value2")
    
    # 検証
    assert result1 == "value1-value2"
    mock_redis.get.assert_called_once()
    mock_redis.set.assert_called_once()
    
    # キャッシュがある場合のテスト
    mock_redis.get.reset_mock()
    mock_redis.set.reset_mock()
    mock_redis.get.return_value = json.dumps("value1-value2")
    
    # 2回目の呼び出し（キャッシュから取得されるはず）
    result2 = await test_function("value1", arg2="value2")
    
    # 検証
    assert result2 == "value1-value2"
    mock_redis.get.assert_called_once()
    mock_redis.set.assert_not_called()  # キャッシュヒットのため設定されない

@pytest.mark.asyncio
async def test_invalidate_cache_decorator(mock_redis):
    """キャッシュ無効化デコレータのテスト"""
    # テスト関数
    @invalidate_cache(prefix="test")
    async def update_function(item_id):
        return {"id": item_id, "updated": True}
    
    # 関数呼び出し
    result = await update_function(123)
    
    # 検証
    assert result == {"id": 123, "updated": True}
    mock_redis.keys.assert_called_once_with("test:*")
