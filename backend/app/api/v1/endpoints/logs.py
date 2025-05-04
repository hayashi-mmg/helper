"""
ログ関連のAPIエンドポイント
"""
from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.auth_service import get_current_admin_user, get_current_user
from app.logs.log_manager import LogManager
from app.schemas.log import ApplicationLogResponse, AuditLogResponse, PerformanceLogResponse
from app.schemas.user import User
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/logs",
    tags=["logs"]
)

@router.get("/application", response_model=List[ApplicationLogResponse])
async def get_application_logs(
    level: Optional[str] = Query(None, description="ログレベル (INFO, WARNING, ERROR, CRITICAL)"),
    source: Optional[str] = Query(None, description="ログソース (API, UI, SYSTEM)"),
    user_id: Optional[int] = Query(None, description="ユーザーID"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, ge=1, le=1000, description="取得する最大結果数"),
    offset: int = Query(0, ge=0, description="結果をスキップする数"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """アプリケーションログを取得する（管理者専用）"""
    log_manager = LogManager(db)
    logs = await log_manager.get_application_logs(
        level=level,
        source=source,
        user_id=user_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset
    )
    return logs

@router.get("/audit", response_model=List[AuditLogResponse])
async def get_audit_logs(
    user_id: Optional[int] = Query(None, description="ユーザーID"),
    action: Optional[str] = Query(None, description="アクションタイプ"),
    resource_type: Optional[str] = Query(None, description="リソースタイプ"),
    resource_id: Optional[int] = Query(None, description="リソースID"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, ge=1, le=1000, description="取得する最大結果数"),
    offset: int = Query(0, ge=0, description="結果をスキップする数"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """監査ログを取得する（管理者専用）"""
    log_manager = LogManager(db)
    logs = await log_manager.get_audit_logs(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset
    )
    return logs

@router.get("/performance", response_model=List[PerformanceLogResponse])
async def get_performance_logs(
    endpoint: Optional[str] = Query(None, description="エンドポイント"),
    min_response_time: Optional[int] = Query(None, description="最小レスポンス時間（ミリ秒）"),
    max_response_time: Optional[int] = Query(None, description="最大レスポンス時間（ミリ秒）"),
    status_code: Optional[int] = Query(None, description="HTTPステータスコード"),
    request_method: Optional[str] = Query(None, description="HTTPメソッド"),
    user_id: Optional[int] = Query(None, description="ユーザーID"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, ge=1, le=1000, description="取得する最大結果数"),
    offset: int = Query(0, ge=0, description="結果をスキップする数"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """パフォーマンスログを取得する（管理者専用）"""
    log_manager = LogManager(db)
    logs = await log_manager.get_performance_logs(
        endpoint=endpoint,
        min_response_time=min_response_time,
        max_response_time=max_response_time,
        status_code=status_code,
        request_method=request_method,
        user_id=user_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset
    )
    return logs

@router.get("/performance/slow-endpoints")
async def get_slow_endpoints(
    threshold_ms: int = Query(500, description="閾値（ミリ秒）"),
    limit: int = Query(10, ge=1, le=100, description="取得する最大結果数"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """遅いエンドポイントの統計を取得する（管理者専用）"""
    log_manager = LogManager(db)
    return await log_manager.get_slow_endpoints(threshold_ms, limit)

@router.post("/client", status_code=202)
async def receive_client_logs(
    background_tasks: BackgroundTasks,
    logs_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """フロントエンドから送信されたログを受信して保存"""
    # フロントエンドからのログ受信処理は専用のバックグラウンドタスクで処理
    background_tasks.add_task(process_client_logs, logs_data, current_user.id, db)
    return {"status": "accepted"}

async def process_client_logs(logs_data: dict, user_id: int, db: AsyncSession):
    """クライアントから送信されたログを処理"""
    # アプリケーションログの処理
    for log in logs_data.get("app", []):
        await log_manager.add_application_log({
            "level": log.get("level", "INFO"),
            "source": "CLIENT",
            "message": log.get("message", ""),
            "user_id": user_id,
            "endpoint": log.get("url"),
            "additional_data": log
        })
    
    # ユーザーアクションログの処理
    for log in logs_data.get("user_action", []):
        await log_manager.add_audit_log({
            "user_id": user_id,
            "action": log.get("action", ""),
            "resource_type": log.get("resource_type", ""),
            "resource_id": log.get("resource_id"),
            "additional_data": log
        })
    
    # パフォーマンスログの処理
    for log in logs_data.get("performance", []):
        await log_manager.add_performance_log({
            "endpoint": log.get("url", ""),
            "request_method": log.get("method", "GET"),
            "response_time": log.get("duration", 0),
            "status_code": log.get("status_code", 200),
            "user_id": user_id,
            "additional_metrics": log
        })
