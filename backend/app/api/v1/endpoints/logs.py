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
    endpoint: Optional[str] = Query(None, description="エンドポイント"),
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
        endpoint=endpoint,
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

@router.get("/stats", summary="ログ統計情報を取得")
async def get_log_statistics(
    days: int = Query(7, ge=1, le=30, description="統計期間（日数）"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    ログの統計情報を取得（管理者専用）

    - エラーレベル別のログ件数
    - 期間別のログ発生トレンド
    - 最も多いエラー発生エンドポイント
    """
    log_manager = LogManager(db)
    return await log_manager.get_statistics(days=days)

@router.get("/performance/analysis", summary="パフォーマンスログの分析結果を取得")
async def analyze_performance_logs(
    days: int = Query(7, ge=1, le=30, description="分析期間（日数）"),
    min_requests: int = Query(10, ge=1, description="分析対象とする最小リクエスト数"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    パフォーマンスログの分析結果を取得（管理者専用）

    - エンドポイント別の平均/最大/最小レスポンス時間
    - 異常に遅いエンドポイントの検出
    - リクエスト頻度の高いエンドポイント
    """
    log_manager = LogManager(db)
    return await log_manager.analyze_performance(days=days, min_requests=min_requests)

@router.post("/client", summary="クライアントからのログを受け取る")
async def record_client_log(
    log_data: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    クライアントサイドのログを受け取って保存する

    フロントエンドからのエラーや警告を記録するためのエンドポイント
    """
    user_id = current_user.id if current_user else None

    log_manager = LogManager(db)
    # バックグラウンドタスクとして実行して応答を遅延させない
    background_tasks.add_task(
        log_manager.record_client_log,
        level=log_data.get("level", "INFO"),
        message=log_data.get("message", ""),
        source="CLIENT",
        user_id=user_id,
        endpoint=log_data.get("url", ""),
        ip_address=log_data.get("ip", ""),
        user_agent=log_data.get("userAgent", ""),
        additional_data={
            "error_type": log_data.get("errorType", ""),
            "stack": log_data.get("stack", ""),
            "component": log_data.get("component", ""),
            "browser": log_data.get("browser", ""),
            "os": log_data.get("os", "")
        }
    )

    return {"status": "success", "message": "ログが記録されました"}
