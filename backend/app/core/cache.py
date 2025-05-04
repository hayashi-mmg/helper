"""
Redisキャッシュユーティリティ
"""
import json
import inspect
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, TypeVar, cast
import redis.asyncio as redis
from app.config import settings

# Redisクライアントの初期化
redis_client = redis.from_url(getattr(settings, 'redis_url', getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')))

# 戻り値の型変数
T = TypeVar("T")

async def set_cache(key: str, value: Any, expire: int = 3600) -> None:
    """
    キャッシュに値を設定
    Args:
        key (str): キャッシュキー
        value (Any): 保存する値
        expire (int): 有効期限（秒）
    """
    serialized = json.dumps(value, default=str)
    await redis_client.set(key, serialized, ex=expire)

async def get_cache(key: str) -> Optional[Any]:
    """
    キャッシュから値を取得
    Args:
        key (str): キャッシュキー
    Returns:
        Optional[Any]: 取得した値、存在しない場合はNone
    """
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None

async def delete_cache(key: str) -> None:
    """
    キャッシュから値を削除
    Args:
        key (str): 削除するキャッシュキー
    """
    await redis_client.delete(key)

async def delete_pattern(pattern: str) -> None:
    """
    パターンに一致するキャッシュをすべて削除
    Args:
        pattern (str): 削除するキャッシュキーのパターン
    """
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)

def cached(prefix: str, expire: int = 3600):
    """
    関数の結果をキャッシュするデコレータ
    
    Args:
        prefix (str): キャッシュキーのプレフィックス
        expire (int): キャッシュの有効期間（秒）
    
    Returns:
        Callable: デコレータ関数
    
    使用例:
        @cached(prefix="user", expire=300)
        async def get_user_by_id(db, user_id):
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # 最初の引数がselfの場合は除外（クラスメソッド用）
            cache_args = args[1:] if args and hasattr(args[0], "__class__") else args
            
            # キャッシュキーの作成
            key_parts = [prefix, func.__name__]
            
            # 引数をキーに含める
            if cache_args:
                key_parts.extend([str(arg) for arg in cache_args])
            
            # キーワード引数をソートしてキーに含める
            if kwargs:
                key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
            
            cache_key = ":".join(key_parts)
            
            # キャッシュから取得を試みる
            cached_result = await get_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            # キャッシュにない場合は関数を実行
            result = await func(*args, **kwargs)
            
            # 結果をキャッシュ
            await set_cache(cache_key, result, expire)
            
            return result
        
        return cast(Callable[..., T], wrapper)
    
    return decorator

def invalidate_cache(prefix: str, func_name: str = None):
    """
    特定のプレフィックスのキャッシュを無効化するデコレータ
    
    Args:
        prefix (str): 無効化するキャッシュのプレフィックス
        func_name (str, optional): 特定の関数のキャッシュのみ無効化する場合の関数名
    
    Returns:
        Callable: デコレータ関数
    
    使用例:
        @invalidate_cache(prefix="user")
        async def update_user(db, user_id, user_data):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            
            # キャッシュ無効化パターンの作成
            pattern = f"{prefix}:*"
            if func_name:
                pattern = f"{prefix}:{func_name}:*"
            
            # 一致するキャッシュを削除
            await delete_pattern(pattern)
            
            return result
        
        return wrapper
    
    return decorator
