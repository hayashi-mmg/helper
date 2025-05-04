"""
アプリケーションログを記録するためのロガークラス
"""
import logging
from contextvars import ContextVar
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.logs import ApplicationLog

# リクエストIDの文脈変数
request_id_var = ContextVar('request_id', default=None)

class ApplicationLogger:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self.logger = logging.getLogger("app")
    
    async def log(self, level: str, source: str, message: str, user_id: int = None, 
                  endpoint: str = None, ip_address: str = None, user_agent: str = None,
                  additional_data: dict = None):
        """
        アプリケーションログをデータベースに記録する
        
        Args:
            level: ログレベル (INFO, WARNING, ERROR, CRITICAL)
            source: ログソース (API, UI, SYSTEM など)
            message: ログメッセージ
            user_id: 関連ユーザーID
            endpoint: APIエンドポイント
            ip_address: IPアドレス
            user_agent: ユーザーエージェント
            additional_data: 追加データ (辞書形式)
        """
        # ログレベルに応じたPythonロガーの呼び出し
        log_method = getattr(self.logger, level.lower(), self.logger.info)
        log_method(f"{source}: {message}")
        
        # データベースへの保存
        log_entry = ApplicationLog(
            level=level,
            source=source,
            message=message,
            user_id=user_id,
            endpoint=endpoint,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id_var.get(),
            additional_data=additional_data
        )
        
        self.db_session.add(log_entry)
        await self.db_session.flush()  # 即時フラッシュ（IDが必要な場合）
        
        return log_entry

    @classmethod
    def from_request(cls, request: Request, db_session: AsyncSession):
        """リクエストからロガーインスタンスを生成"""
        return cls(db_session)
