## 9. パフォーマンス最適化

### 9.1 キャッシュの実装

```python
# app/core/cache.py
from functools import wraps
import json
from typing import Any, Callable, Dict, Optional, TypeVar, cast
import redis.asyncio as redis
from app.config import settings

# Redis接続
redis_client = redis.from_url(settings.REDIS_URL)

T = TypeVar("T")

async def set_cache(key: str, value: Any, expire: int = 3600) -> None:
    """キャッシュに値を設定"""
    serialized = json.dumps(value)
    await redis_client.set(key, serialized, ex=expire)

async def get_cache(key: str) -> Optional[Any]:
    """キャッシュから値を取得"""
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None

async def delete_cache(key: str) -> None:
    """キャッシュから値を削除"""
    await redis_client.delete(key)

async def delete_pattern(pattern: str) -> None:
    """パターンに一致するキャッシュを削除"""
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)

def cached(prefix: str, expire: int = 3600):
    """
    関数の結果をキャッシュするデコレータ
    
    Args:
        prefix: キャッシュキーのプレフィックス
        expire: キャッシュの有効期間（秒）
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # 最初の引数がselfの場合は除外（クラスメソッド用）
            cache_args = args[1:] if args and hasattr(args[0], "__class__") else args
            
            # キャッシュキーの作成
            key_parts = [prefix, func.__name__]
            if cache_args:
                key_parts.extend([str(arg) for arg in cache_args])
            if kwargs:
                key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
            
            cache_key = ":".join(key_parts)
            
            # キャッシュから取得
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
```

### 9.2 データベースクエリの最適化

```python
# app/crud/recipe_requests.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import joinedload, selectinload

from app.db.models.recipe_request import RecipeRequest
from app.db.models.tag import Tag, recipe_tags
from app.core.cache import cached

async def get_recipe_request_with_relations(db: AsyncSession, id: int) -> Optional[RecipeRequest]:
    """リクエストとその関連データを取得（1回のクエリで）"""
    stmt = (
        select(RecipeRequest)
        .options(
            joinedload(RecipeRequest.user),
            selectinload(RecipeRequest.tags)
        )
        .filter(RecipeRequest.id == id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

@cached(prefix="recipe_requests", expire=300)  # 5分間キャッシュ
async def get_recipe_requests_for_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
) -> List[RecipeRequest]:
    """ユーザーの料理リクエスト一覧取得（キャッシュ付き）"""
    stmt = (
        select(RecipeRequest)
        .filter(RecipeRequest.user_id == user_id)
        .order_by(RecipeRequest.created_at.desc())
    )
    
    if status:
        stmt = stmt.filter(RecipeRequest.status == status)
    
    stmt = stmt.offset(skip).limit(limit)
    
    # 関連データのロード
    stmt = stmt.options(
        selectinload(RecipeRequest.tags)
    )
    
    result = await db.execute(stmt)
    return result.scalars().all()
```

