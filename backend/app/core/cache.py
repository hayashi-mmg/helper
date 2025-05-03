"""
Redisキャッシュユーティリティ
"""
import json
from typing import Any, Optional
import redis.asyncio as redis
from app.config import settings

# Redisクライアントの初期化
redis_client = redis.from_url(getattr(settings, 'redis_url', getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')))

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
