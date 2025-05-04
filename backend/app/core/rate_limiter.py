"""
レート制限ミドルウェア
"""
import time
from typing import Dict, Tuple, Optional
import redis.asyncio as redis
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
from app.config import settings

class RateLimiter(BaseHTTPMiddleware):
    """
    レート制限ミドルウェア
    
    指定した期間内のリクエスト数を制限し、
    制限を超えた場合は429エラーを返す。
    """
    def __init__(
        self,
        app: FastAPI,
        redis_client: redis.Redis,
        limit: int = 100,
        timeframe: int = 60,
        whitelist_paths: list = None,
        whitelist_ips: list = None
    ):
        super().__init__(app)
        self.redis_client = redis_client
        self.limit = limit
        self.timeframe = timeframe
        self.whitelist_paths = whitelist_paths or ["/api/v1/health", "/ping"]
        self.whitelist_ips = whitelist_ips or ["127.0.0.1", "::1"]
    
    async def dispatch(self, request: Request, call_next):
        """リクエストの処理とレート制限のチェック"""
        # 設定で無効化されている場合はスキップ
        if not settings.rate_limit_enabled:
            return await call_next(request)
        
        # ホワイトリストパスの確認
        if any(request.url.path.startswith(path) for path in self.whitelist_paths):
            return await call_next(request)
        
        # クライアントIPの取得
        client_ip = request.client.host
        
        # ホワイトリストIPの確認
        if client_ip in self.whitelist_ips:
            return await call_next(request)
        
        # リクエストカウント更新
        current_count, is_limited = await self._increment_counter(client_ip)
        
        # リクエストヘッダーに制限情報を追加
        response = await call_next(request) if not is_limited else self._rate_limited_response()
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, self.limit - current_count))
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + self.timeframe))
        
        return response
    
    async def _increment_counter(self, client_ip: str) -> Tuple[int, bool]:
        """
        クライアントIPに対するカウンターを更新
        
        Returns:
            Tuple[int, bool]: (現在のカウント, 制限超過フラグ)
        """
        key = f"rate_limit:{client_ip}"
        
        # パイプラインを使用して複数操作をアトミックに実行
        pipe = self.redis_client.pipeline()
        
        # カウンターが存在しない場合は作成
        pipe.incr(key)
        pipe.expire(key, self.timeframe)
        
        # 結果の取得
        results = await pipe.execute()
        current_count = results[0]
        
        # 制限を超えているかどうかの確認
        return current_count, current_count > self.limit
    
    def _rate_limited_response(self) -> Response:
        """レート制限超過時のレスポンス"""
        content = {
            "error": "Too many requests",
            "detail": f"リクエスト数の上限（{self.limit}回/{self.timeframe}秒）を超過しました。少し時間を空けてからもう一度お試しください。"
        }
        return JSONResponse(
            status_code=HTTP_429_TOO_MANY_REQUESTS,
            content=content
        )
