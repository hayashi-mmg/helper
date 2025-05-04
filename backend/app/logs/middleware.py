"""
FastAPIアプリケーションのリクエスト/レスポンスログを記録するミドルウェア
"""
import uuid
import time
import traceback
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.logs.app_logger import ApplicationLogger, request_id_var
from app.logs.performance_logger import PerformanceLogger
from app.database import get_db

class LoggingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # リクエストIDを生成
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)
        
        # リクエスト情報を取得
        path = request.url.path
        method = request.method
        
        start_time = time.time()
        
        # DBセッションを取得
        db = next(get_db())
        
        # パフォーマンスロガーを初期化
        perf_logger = PerformanceLogger(db).start_timer()
        
        try:
            # リクエスト処理を実行
            response = await call_next(request)
            
            # リクエスト情報をリクエストオブジェクトに保存
            request.state.request_id = request_id
            request.state.start_time = start_time
            request.state.path = path
            request.state.method = method
            
            # パフォーマンスログを記録
            response_size = int(response.headers.get("content-length", 0))
            await perf_logger.log_request(
                endpoint=path,
                status_code=response.status_code,
                request_method=method,
                response_size=response_size,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
            
            return response
        
        except Exception as e:
            # 例外発生時のアプリケーションログ記録
            app_logger = ApplicationLogger(db)
            await app_logger.log(
                level="ERROR",
                source="MIDDLEWARE",
                message=f"Request processing error: {str(e)}",
                endpoint=path,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                additional_data={"exception": str(e), "traceback": traceback.format_exc()}
            )
            
            # パフォーマンスログも記録
            await perf_logger.log_request(
                endpoint=path,
                status_code=500,
                request_method=method,
                ip_address=request.client.host if request.client else None
            )
            
            raise
