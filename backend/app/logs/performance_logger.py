"""
パフォーマンスログ（処理時間）を記録するためのロガークラス
"""
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.logs import PerformanceLog
from fastapi import Request

class PerformanceLogger:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.start_time = None
        self.metrics = {}
    
    def start_timer(self):
        """処理時間計測開始"""
        self.start_time = time.time()
        return self
    
    def add_metric(self, key: str, value):
        """カスタムメトリクスの追加"""
        self.metrics[key] = value
        return self
    
    async def log_request(self, endpoint: str, status_code: int, 
                          request_method: str, request_size: int = None, 
                          response_size: int = None, ip_address: str = None, 
                          user_agent: str = None, user_id: int = None):
        """
        リクエスト処理のパフォーマンスを記録
        
        Args:
            endpoint: APIエンドポイント
            status_code: HTTPステータスコード
            request_method: HTTPメソッド (GET, POST など)
            request_size: リクエストサイズ (バイト)
            response_size: レスポンスサイズ (バイト)
            ip_address: IPアドレス
            user_agent: ユーザーエージェント
            user_id: ユーザーID
        """
        # 処理時間の計算 (ミリ秒)
        response_time = int((time.time() - self.start_time) * 1000) if self.start_time else None
        
        # ログエントリの作成
        log_entry = PerformanceLog(
            endpoint=endpoint,
            response_time=response_time,
            status_code=status_code,
            request_method=request_method,
            request_size=request_size,
            response_size=response_size,
            ip_address=ip_address,
            user_agent=user_agent,
            user_id=user_id,
            additional_metrics=self.metrics if self.metrics else None
        )
        
        self.db_session.add(log_entry)
        await self.db_session.flush()
        
        return log_entry
    
    @classmethod
    def from_request(cls, request: Request, db_session: AsyncSession):
        """リクエストからパフォーマンスロガーインスタンスを生成"""
        return cls(db_session)
