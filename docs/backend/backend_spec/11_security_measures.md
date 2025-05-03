## 11. セキュリティ対策

### 11.1 CORS設定

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# CORSミドルウェアの設定
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
```

### 11.2 レート制限の実装

```python
# app/core/security.py
from typing import Callable
from fastapi import FastAPI, Request, Response
import redis.asyncio as redis
import time
from app.config import settings

# Redis接続
redis_client = redis.from_url(settings.REDIS_URL)

# レート制限ミドルウェア
async def rate_limit_middleware(
    request: Request,
    call_next: Callable,
    limit: int = 100,
    window: int = 60
) -> Response:
    """
    レート制限ミドルウェア
    
    Args:
        request: リクエストオブジェクト
        call_next: 次のミドルウェア/ハンドラ
        limit: 単位時間あたりの最大リクエスト数
        window: 時間枠（秒）
    """
    # クライアントIPの取得
    client_ip = request.client.host
    
    # レート制限キーの作成
    key = f"rate_limit:{client_ip}"
    
    # 現在時刻
    current_time = int(time.time())
    
    # キー存在チェック
    exists = await redis_client.exists(key)
    
    if not exists:
        # 新規キーの作成
        pipeline = redis_client.pipeline()
        pipeline.zadd(key, {str(current_time): current_time})
        pipeline.expire(key, window)
        await pipeline.execute()
        
        # 次のミドルウェア/ハンドラを呼び出し
        return await call_next(request)
    
    # 古いリクエストを削除
    cutoff_time = current_time - window
    await redis_client.zremrangebyscore(key, 0, cutoff_time)
    
    # 残りのリクエスト数をカウント
    count = await redis_client.zcard(key)
    
    # 新しいリクエストを追加
    await redis_client.zadd(key, {str(current_time): current_time})
    
    # リクエスト数が制限以内の場合
    if count < limit:
        # 有効期限を更新
        await redis_client.expire(key, window)
        
        # ヘッダーを設定
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(limit - count - 1)
        response.headers["X-RateLimit-Reset"] = str(current_time + window)
        
        return response
    else:
        # レート制限超過
        from fastapi.responses import JSONResponse
        from fastapi import status
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "レート制限を超過しました。しばらく時間を置いて再試行してください。"
            },
            headers={
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(current_time + window),
                "Retry-After": str(window)
            }
        )
```

