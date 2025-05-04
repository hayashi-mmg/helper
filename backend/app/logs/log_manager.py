"""
ログの検索や管理を行うマネージャークラス
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.db.models.logs import ApplicationLog, AuditLog, PerformanceLog
from fastapi import Depends
from app.database import get_db
from datetime import datetime, timedelta

class LogManager:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_application_logs(
        self,
        level: Optional[str] = None,
        source: Optional[str] = None,
        user_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[ApplicationLog]:
        """アプリケーションログを検索"""
        query = select(ApplicationLog)
        
        # フィルタ条件の適用
        if level:
            query = query.filter(ApplicationLog.level == level)
        if source:
            query = query.filter(ApplicationLog.source == source)
        if user_id:
            query = query.filter(ApplicationLog.user_id == user_id)
        if start_time:
            query = query.filter(ApplicationLog.timestamp >= start_time)
        if end_time:
            query = query.filter(ApplicationLog.timestamp <= end_time)
        
        # ソートとページネーション
        query = query.order_by(desc(ApplicationLog.timestamp))
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_audit_logs(
        self,
        user_id: Optional[int] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """監査ログを検索"""
        query = select(AuditLog)
        
        # フィルタ条件の適用
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if resource_id:
            query = query.filter(AuditLog.resource_id == resource_id)
        if start_time:
            query = query.filter(AuditLog.timestamp >= start_time)
        if end_time:
            query = query.filter(AuditLog.timestamp <= end_time)
        
        # ソートとページネーション
        query = query.order_by(desc(AuditLog.timestamp))
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_performance_logs(
        self,
        endpoint: Optional[str] = None,
        min_response_time: Optional[int] = None,
        max_response_time: Optional[int] = None,
        status_code: Optional[int] = None,
        request_method: Optional[str] = None,
        user_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[PerformanceLog]:
        """パフォーマンスログを検索"""
        query = select(PerformanceLog)
        
        # フィルタ条件の適用
        if endpoint:
            query = query.filter(PerformanceLog.endpoint == endpoint)
        if min_response_time:
            query = query.filter(PerformanceLog.response_time >= min_response_time)
        if max_response_time:
            query = query.filter(PerformanceLog.response_time <= max_response_time)
        if status_code:
            query = query.filter(PerformanceLog.status_code == status_code)
        if request_method:
            query = query.filter(PerformanceLog.request_method == request_method)
        if user_id:
            query = query.filter(PerformanceLog.user_id == user_id)
        if start_time:
            query = query.filter(PerformanceLog.timestamp >= start_time)
        if end_time:
            query = query.filter(PerformanceLog.timestamp <= end_time)
        
        # ソートとページネーション
        query = query.order_by(desc(PerformanceLog.timestamp))
        query = query.offset(offset).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_slow_endpoints(
        self, threshold_ms: int = 500, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """遅いエンドポイントの統計情報を取得"""
        query = select(
            PerformanceLog.endpoint,
            func.avg(PerformanceLog.response_time).label("avg_time"),
            func.max(PerformanceLog.response_time).label("max_time"),
            func.min(PerformanceLog.response_time).label("min_time"),
            func.count(PerformanceLog.id).label("request_count")
        ).group_by(
            PerformanceLog.endpoint
        ).having(
            func.avg(PerformanceLog.response_time) > threshold_ms
        ).order_by(
            desc("avg_time")
        ).limit(limit)
        
        result = await self.db.execute(query)
        return [
            {
                "endpoint": row.endpoint,
                "avg_time": row.avg_time,
                "max_time": row.max_time,
                "min_time": row.min_time,
                "request_count": row.request_count
            }
            for row in result
        ]
