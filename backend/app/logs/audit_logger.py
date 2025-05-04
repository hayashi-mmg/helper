"""
監査ログ（ユーザーアクション）を記録するためのロガークラス
"""
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.logs import AuditLog
from fastapi import Request

class AuditLogger:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def log_action(self, user_id: int, action: str, resource_type: str, 
                         resource_id: int = None, previous_state: dict = None, 
                         new_state: dict = None, ip_address: str = None, 
                         user_agent: str = None):
        """
        ユーザーアクションを監査ログに記録する
        
        Args:
            user_id: 実行ユーザーID
            action: 実行アクション (CREATE, UPDATE, DELETE, LOGIN など)
            resource_type: リソースタイプ (POST, USER, CATEGORY など)
            resource_id: リソースID
            previous_state: 変更前の状態 (辞書形式)
            new_state: 変更後の状態 (辞書形式)
            ip_address: IPアドレス
            user_agent: ユーザーエージェント
        """
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            previous_state=previous_state,
            new_state=new_state,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.db_session.add(log_entry)
        await self.db_session.flush()
        
        return log_entry

    @classmethod
    def from_request(cls, request: Request, db_session: AsyncSession):
        """リクエストから監査ロガーインスタンスを生成"""
        return cls(db_session)
