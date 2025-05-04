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
    
    async def get_statistics(self, days: int = 7) -> Dict[str, Any]:
        """
        ログの統計情報を取得
        
        Args:
            days: 統計を取得する日数
            
        Returns:
            Dict[str, Any]: 統計情報
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # アプリケーションログのレベル別統計
        app_log_query = (
            select(
                ApplicationLog.level, 
                func.count(ApplicationLog.id).label("count")
            )
            .filter(ApplicationLog.timestamp >= cutoff_date)
            .group_by(ApplicationLog.level)
        )
        app_log_result = await self.db.execute(app_log_query)
        app_log_counts = {level: count for level, count in app_log_result}
        
        # 監査ログのアクション別統計
        audit_log_query = (
            select(
                AuditLog.action, 
                func.count(AuditLog.id).label("count")
            )
            .filter(AuditLog.timestamp >= cutoff_date)
            .group_by(AuditLog.action)
        )
        audit_log_result = await self.db.execute(audit_log_query)
        audit_log_counts = {action: count for action, count in audit_log_result}
        
        # エンドポイント別エラー数
        error_endpoints_query = (
            select(
                ApplicationLog.endpoint,
                func.count(ApplicationLog.id).label("error_count")
            )
            .filter(
                ApplicationLog.timestamp >= cutoff_date,
                ApplicationLog.level.in_(["ERROR", "CRITICAL"])
            )
            .group_by(ApplicationLog.endpoint)
            .order_by(desc("error_count"))
            .limit(5)
        )
        error_endpoints_result = await self.db.execute(error_endpoints_query)
        error_endpoints = [
            {"endpoint": endpoint, "count": count}
            for endpoint, count in error_endpoints_result
            if endpoint  # 空のエンドポイントを除外
        ]
        
        # 日別のログ数トレンド
        daily_logs_query = (
            select(
                func.date_trunc('day', ApplicationLog.timestamp).label("date"),
                func.count(ApplicationLog.id).label("count")
            )
            .filter(ApplicationLog.timestamp >= cutoff_date)
            .group_by(func.date_trunc('day', ApplicationLog.timestamp))
            .order_by(func.date_trunc('day', ApplicationLog.timestamp))
        )
        daily_logs_result = await self.db.execute(daily_logs_query)
        daily_trend = [
            {"date": date.strftime("%Y-%m-%d"), "count": count}
            for date, count in daily_logs_result
        ]
        
        return {
            "period_days": days,
            "app_log_counts": app_log_counts,
            "audit_log_counts": audit_log_counts,
            "error_endpoints": error_endpoints,
            "daily_trend": daily_trend,
            "total_app_logs": sum(app_log_counts.values()) if app_log_counts else 0,
            "total_audit_logs": sum(audit_log_counts.values()) if audit_log_counts else 0,
        }
        
    async def analyze_performance(self, days: int = 7, min_requests: int = 10) -> Dict[str, Any]:
        """
        パフォーマンスログを分析
        
        Args:
            days: 分析する日数
            min_requests: 分析対象とする最小リクエスト数
            
        Returns:
            Dict[str, Any]: 分析結果
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # エンドポイント別のパフォーマンス統計
        endpoint_stats_query = (
            select(
                PerformanceLog.endpoint,
                PerformanceLog.request_method,
                func.count(PerformanceLog.id).label("request_count"),
                func.avg(PerformanceLog.response_time).label("avg_time"),
                func.min(PerformanceLog.response_time).label("min_time"),
                func.max(PerformanceLog.response_time).label("max_time"),
                func.percentile_cont(0.95).within_group(PerformanceLog.response_time).label("p95_time")
            )
            .filter(PerformanceLog.timestamp >= cutoff_date)
            .group_by(PerformanceLog.endpoint, PerformanceLog.request_method)
            .having(func.count(PerformanceLog.id) >= min_requests)
        )
        
        try:
            endpoint_stats_result = await self.db.execute(endpoint_stats_query)
            endpoint_stats = [
                {
                    "endpoint": endpoint,
                    "method": method,
                    "request_count": count,
                    "avg_time_ms": round(avg_time),
                    "min_time_ms": min_time,
                    "max_time_ms": max_time,
                    "p95_time_ms": round(p95_time) if p95_time else None
                }
                for endpoint, method, count, avg_time, min_time, max_time, p95_time in endpoint_stats_result
                if endpoint  # 空のエンドポイントを除外
            ]
        except Exception:
            # percentile_contが使えない場合はp95を除外
            endpoint_stats_query = (
                select(
                    PerformanceLog.endpoint,
                    PerformanceLog.request_method,
                    func.count(PerformanceLog.id).label("request_count"),
                    func.avg(PerformanceLog.response_time).label("avg_time"),
                    func.min(PerformanceLog.response_time).label("min_time"),
                    func.max(PerformanceLog.response_time).label("max_time")
                )
                .filter(PerformanceLog.timestamp >= cutoff_date)
                .group_by(PerformanceLog.endpoint, PerformanceLog.request_method)
                .having(func.count(PerformanceLog.id) >= min_requests)
            )
            endpoint_stats_result = await self.db.execute(endpoint_stats_query)
            endpoint_stats = [
                {
                    "endpoint": endpoint,
                    "method": method,
                    "request_count": count,
                    "avg_time_ms": round(avg_time),
                    "min_time_ms": min_time,
                    "max_time_ms": max_time,
                }
                for endpoint, method, count, avg_time, min_time, max_time in endpoint_stats_result
                if endpoint
            ]
        
        # 全体の統計
        summary_query = (
            select(
                func.count(PerformanceLog.id).label("total_requests"),
                func.avg(PerformanceLog.response_time).label("avg_time"),
                func.min(PerformanceLog.response_time).label("min_time"),
                func.max(PerformanceLog.response_time).label("max_time")
            )
            .filter(PerformanceLog.timestamp >= cutoff_date)
        )
        summary_result = await self.db.execute(summary_query)
        summary = summary_result.first()
        
        # HTTPステータスコード別の集計
        status_query = (
            select(
                PerformanceLog.status_code,
                func.count(PerformanceLog.id).label("count")
            )
            .filter(PerformanceLog.timestamp >= cutoff_date)
            .group_by(PerformanceLog.status_code)
            .order_by(desc("count"))
        )
        status_result = await self.db.execute(status_query)
        status_counts = {str(status): count for status, count in status_result}
        
        # 遅いエンドポイント
        slow_endpoints = sorted(
            [stat for stat in endpoint_stats if stat.get("avg_time_ms")],
            key=lambda x: x.get("avg_time_ms", 0),
            reverse=True
        )[:5]
        
        return {
            "period_days": days,
            "total_requests": summary[0] if summary else 0,
            "avg_response_time_ms": round(summary[1]) if summary and summary[1] else 0,
            "min_response_time_ms": summary[2] if summary else 0,
            "max_response_time_ms": summary[3] if summary else 0,
            "status_code_distribution": status_counts,
            "slow_endpoints": slow_endpoints,
            "all_endpoints": endpoint_stats
        }
    
    async def record_client_log(
        self, 
        level: str,
        message: str,
        source: str,
        user_id: Optional[int] = None,
        endpoint: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        クライアントからのログを記録
        """
        log = ApplicationLog(
            level=level,
            message=message,
            source=source,
            user_id=user_id,
            endpoint=endpoint,
            ip_address=ip_address,
            user_agent=user_agent,
            additional_data=additional_data or {}
        )
        self.db.add(log)
        await self.db.commit()
