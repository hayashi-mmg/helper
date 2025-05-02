# バックエンドログ実装ドキュメント

## 1. 概要

本ドキュメントでは、ヘルパーシステムバックエンドにおけるログ機能の実装方法について説明します。プロジェクトでは以下の3種類のログを実装し、各目的に応じた情報を記録・保存します。

1. **アプリケーションログ** - システムの動作状況や例外情報を記録
2. **監査ログ** - ユーザーのアクション履歴やデータ変更を記録
3. **パフォーマンスログ** - システムのパフォーマンス指標を記録

## 2. 全体アーキテクチャ

### 2.1 ログ機能のコンポーネント構成

```
backend/
├── app/
│   ├── logs/                       # ログ関連モジュール
│   │   ├── __init__.py
│   │   ├── models.py               # ログのORMモデル
│   │   ├── schemas.py              # ログのPydanticスキーマ
│   │   ├── app_logger.py           # アプリケーションログ実装
│   │   ├── audit_logger.py         # 監査ログ実装
│   │   ├── performance_logger.py   # パフォーマンスログ実装
│   │   ├── log_manager.py          # ログマネージャー（全体管理）
│   │   └── middleware.py           # ログミドルウェア
│   ├── routes/
│   │   └── logs.py                 # ログ関連APIエンドポイント
│   ├── main.py                     # FastAPIメインアプリケーション
│   └── ...
```

### 2.2 ログフロー

1. **リクエスト受信**：FastAPIミドルウェアがリクエストを受信
2. **パフォーマンス記録開始**：リクエスト処理時間測定開始
3. **リクエスト処理**：アプリケーションロジック実行
4. **アプリケーションログ記録**：処理中の情報・警告・エラーを記録
5. **監査ログ記録**：ユーザーアクションと結果を記録
6. **パフォーマンス記録終了**：処理完了時間を記録
7. **ログデータ保存**：データベースへの保存（非同期または一括）

## 3. ログモデル実装

### 3.1 アプリケーションログモデル

```python
# app/logs/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base

class ApplicationLog(Base):
    __tablename__ = "application_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    level = Column(String, nullable=False, index=True)
    source = Column(String, nullable=False, index=True)
    message = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    endpoint = Column(String, nullable=True, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    request_id = Column(String, nullable=True, index=True)
    additional_data = Column(JSON, nullable=True)
    
    # インデックス定義
    __table_args__ = (
        Index('idx_app_logs_timestamp_level', timestamp, level),
        Index('idx_app_logs_source_level', source, level),
    )
```

### 3.2 監査ログモデル

```python
# app/logs/models.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False, index=True)
    resource_id = Column(Integer, nullable=True, index=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # インデックス定義
    __table_args__ = (
        Index('idx_audit_logs_user_action', user_id, action),
        Index('idx_audit_logs_resource', resource_type, resource_id),
    )
```

### 3.3 パフォーマンスログモデル

```python
# app/logs/models.py
class PerformanceLog(Base):
    __tablename__ = "performance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    endpoint = Column(String, nullable=False, index=True)
    response_time = Column(Integer, nullable=False)  # ミリ秒単位
    status_code = Column(Integer, nullable=True)
    request_method = Column(String, nullable=True)
    request_size = Column(Integer, nullable=True)
    response_size = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String, nullable=True)
    additional_metrics = Column(JSON, nullable=True)
    
    # インデックス定義
    __table_args__ = (
        Index('idx_perf_logs_endpoint_time', endpoint, response_time),
        Index('idx_perf_logs_timestamp_endpoint', timestamp, endpoint),
    )
```

## 4. ロガー実装

### 4.1 アプリケーションロガー

```python
# app/logs/app_logger.py
import logging
from contextvars import ContextVar
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.logs.models import ApplicationLog

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
```

### 4.2 監査ロガー

```python
# app/logs/audit_logger.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.logs.models import AuditLog
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
```

### 4.3 パフォーマンスロガー

```python
# app/logs/performance_logger.py
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.logs.models import PerformanceLog
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
                          response_size: int = None, user_id: int = None, 
                          ip_address: str = None):
        """
        リクエスト処理のパフォーマンスをログに記録する
        
        Args:
            endpoint: エンドポイント名
            status_code: HTTPステータスコード
            request_method: HTTPメソッド
            request_size: リクエストサイズ（バイト）
            response_size: レスポンスサイズ（バイト）
            user_id: ユーザーID
            ip_address: IPアドレス
        """
        if self.start_time is None:
            return None
        
        # 経過時間をミリ秒で計算
        elapsed_time = int((time.time() - self.start_time) * 1000)
        
        log_entry = PerformanceLog(
            endpoint=endpoint,
            response_time=elapsed_time,
            status_code=status_code,
            request_method=request_method,
            request_size=request_size,
            response_size=response_size,
            user_id=user_id,
            ip_address=ip_address,
            additional_metrics=self.metrics if self.metrics else None
        )
        
        self.db_session.add(log_entry)
        await self.db_session.flush()
        
        return log_entry
    
    @classmethod
    def from_request(cls, request: Request, db_session: AsyncSession):
        """リクエストからパフォーマンスロガーインスタンスを生成"""
        return cls(db_session).start_timer()
```

## 5. ログミドルウェア実装

```python
# app/logs/middleware.py
import uuid
import time
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
                ip_address=request.client.host if request.client else None
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
```

## 6. ログマネージャー実装

```python
# app/logs/log_manager.py
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.logs.models import ApplicationLog, AuditLog, PerformanceLog
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
        """指定条件に一致するアプリケーションログを取得"""
        query = select(ApplicationLog).order_by(desc(ApplicationLog.timestamp))
        
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
        
        query = query.limit(limit).offset(offset)
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
        """指定条件に一致する監査ログを取得"""
        query = select(AuditLog).order_by(desc(AuditLog.timestamp))
        
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
        
        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_performance_logs(
        self,
        endpoint: Optional[str] = None,
        min_response_time: Optional[int] = None,
        max_response_time: Optional[int] = None,
        status_code: Optional[int] = None,
        user_id: Optional[int] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[PerformanceLog]:
        """指定条件に一致するパフォーマンスログを取得"""
        query = select(PerformanceLog).order_by(desc(PerformanceLog.timestamp))
        
        if endpoint:
            query = query.filter(PerformanceLog.endpoint == endpoint)
        if min_response_time:
            query = query.filter(PerformanceLog.response_time >= min_response_time)
        if max_response_time:
            query = query.filter(PerformanceLog.response_time <= max_response_time)
        if status_code:
            query = query.filter(PerformanceLog.status_code == status_code)
        if user_id:
            query = query.filter(PerformanceLog.user_id == user_id)
        if start_time:
            query = query.filter(PerformanceLog.timestamp >= start_time)
        if end_time:
            query = query.filter(PerformanceLog.timestamp <= end_time)
        
        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_performance_summary(
        self,
        endpoint: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """パフォーマンスサマリーを取得"""
        query = select(
            func.avg(PerformanceLog.response_time).label("avg_response_time"),
            func.min(PerformanceLog.response_time).label("min_response_time"),
            func.max(PerformanceLog.response_time).label("max_response_time"),
            func.count().label("request_count")
        )
        
        if endpoint:
            query = query.filter(PerformanceLog.endpoint == endpoint)
        if start_time:
            query = query.filter(PerformanceLog.timestamp >= start_time)
        if end_time:
            query = query.filter(PerformanceLog.timestamp <= end_time)
        
        result = await self.db.execute(query)
        row = result.one()
        
        return {
            "avg_response_time": row.avg_response_time,
            "min_response_time": row.min_response_time,
            "max_response_time": row.max_response_time,
            "request_count": row.request_count
        }
    
    async def cleanup_old_logs(self, days_to_keep: Dict[str, int]):
        """古いログを削除するメンテナンス機能"""
        current_time = datetime.utcnow()
        
        # アプリケーションログのクリーンアップ
        if "application_logs" in days_to_keep:
            cutoff_date = current_time - timedelta(days=days_to_keep["application_logs"])
            delete_query = ApplicationLog.__table__.delete().where(ApplicationLog.timestamp < cutoff_date)
            await self.db.execute(delete_query)
        
        # 監査ログのクリーンアップ
        if "audit_logs" in days_to_keep:
            cutoff_date = current_time - timedelta(days=days_to_keep["audit_logs"])
            delete_query = AuditLog.__table__.delete().where(AuditLog.timestamp < cutoff_date)
            await self.db.execute(delete_query)
        
        # パフォーマンスログのクリーンアップ
        if "performance_logs" in days_to_keep:
            cutoff_date = current_time - timedelta(days=days_to_keep["performance_logs"])
            delete_query = PerformanceLog.__table__.delete().where(PerformanceLog.timestamp < cutoff_date)
            await self.db.execute(delete_query)
        
        await self.db.commit()
```

## 7. ログAPIエンドポイント実装

```python
# app/routes/logs.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.logs.log_manager import LogManager
from app.auth.dependencies import get_current_admin_user
from app.logs.schemas import ApplicationLogResponse, AuditLogResponse, PerformanceLogResponse
from typing import List, Optional
from datetime import datetime

router = APIRouter(
    prefix="/api/logs",
    tags=["logs"]
)

@router.get("/application", response_model=List[ApplicationLogResponse])
async def get_application_logs(
    level: Optional[str] = Query(None, description="ログレベル (INFO, WARNING, ERROR, CRITICAL)"),
    source: Optional[str] = Query(None, description="ログソース (API, UI, SYSTEM)"),
    user_id: Optional[int] = Query(None, description="ユーザーID"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, description="取得件数制限"),
    offset: int = Query(0, description="オフセット"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """アプリケーションログを取得（管理者専用）"""
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
    action: Optional[str] = Query(None, description="アクション種別"),
    resource_type: Optional[str] = Query(None, description="リソース種別"),
    resource_id: Optional[int] = Query(None, description="リソースID"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, description="取得件数制限"),
    offset: int = Query(0, description="オフセット"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """監査ログを取得（管理者専用）"""
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
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    limit: int = Query(100, description="取得件数制限"),
    offset: int = Query(0, description="オフセット"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """パフォーマンスログを取得（管理者専用）"""
    log_manager = LogManager(db)
    logs = await log_manager.get_performance_logs(
        endpoint=endpoint,
        min_response_time=min_response_time,
        max_response_time=max_response_time,
        status_code=status_code,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset
    )
    return logs

@router.get("/performance/summary")
async def get_performance_summary(
    endpoint: Optional[str] = Query(None, description="エンドポイント"),
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """パフォーマンスサマリーを取得（管理者専用）"""
    log_manager = LogManager(db)
    summary = await log_manager.get_performance_summary(
        endpoint=endpoint,
        start_time=start_time,
        end_time=end_time
    )
    return summary

@router.post("/cleanup")
async def cleanup_logs(
    application_logs_days: Optional[int] = Query(30, description="アプリケーションログ保持日数"),
    audit_logs_days: Optional[int] = Query(365, description="監査ログ保持日数"),
    performance_logs_days: Optional[int] = Query(90, description="パフォーマンスログ保持日数"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """古いログを削除（管理者専用）"""
    log_manager = LogManager(db)
    await log_manager.cleanup_old_logs({
        "application_logs": application_logs_days,
        "audit_logs": audit_logs_days,
        "performance_logs": performance_logs_days
    })
    return {"message": "ログクリーンアップが完了しました"}
```

## 8. FastAPIアプリケーションへの統合

```python
# app/main.py
from fastapi import FastAPI
from app.logs.middleware import LoggingMiddleware
from app.routes import posts, users, auth, logs

app = FastAPI(title="Markdown CMS API")

# ミドルウェアの登録
app.add_middleware(LoggingMiddleware)

# ルーターの登録
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(users.router)
app.include_router(logs.router)
```

## 9. 実装例とベストプラクティス

### 9.1 コントローラーでのアプリケーションログ記録例

# app/routes/posts.py
@router.post("/", response_model=PostResponse)
async def create_post(
    post: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    app_logger: ApplicationLogger = Depends(lambda request: ApplicationLogger.from_request(request, db))
):
    """新しい投稿を作成する"""
    # 投稿の作成処理
    db_post = Post(
        title=post.title,
        content=post.content,
        author_id=current_user.id,
        category_id=post.category_id,
        slug=post.slug or generate_slug(post.title)
    )
    db.add(db_post)
    await db.commit()
    await db.refresh(db_post)
    
    # アプリケーションログの記録
    await app_logger.log(
        level="INFO",
        source="API",
        message=f"投稿が作成されました ID: {db_post.id}",
        user_id=current_user.id,
        endpoint="/api/posts",
        additional_data={"post_id": db_post.id, "title": db_post.title}
    )
    
    return db_post
```

### 9.2 コントローラーでの監査ログ記録例

```python
# app/routes/posts.py
@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    audit_logger: AuditLogger = Depends(lambda request: AuditLogger.from_request(request, db))
):
    """投稿を更新する"""
    # 投稿の取得
    result = await db.execute(select(Post).filter(Post.id == post_id))
    db_post = result.scalar_one_or_none()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    # 権限チェック
    if db_post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="この操作を実行する権限がありません")
    
    # 更新前の状態を保存
    previous_state = {
        "title": db_post.title,
        "content": db_post.content,
        "category_id": db_post.category_id,
        "slug": db_post.slug,
        "published": db_post.published
    }
    
    # 更新の適用
    if post_update.title is not None:
        db_post.title = post_update.title
    if post_update.content is not None:
        db_post.content = post_update.content
    if post_update.category_id is not None:
        db_post.category_id = post_update.category_id
    if post_update.slug is not None:
        db_post.slug = post_update.slug
    if post_update.published is not None:
        db_post.published = post_update.published
    
    db_post.updated_at = datetime.utcnow()
    
    # 新しい状態を作成
    new_state = {
        "title": db_post.title,
        "content": db_post.content,
        "category_id": db_post.category_id,
        "slug": db_post.slug,
        "published": db_post.published
    }
    
    await db.commit()
    await db.refresh(db_post)
    
    # 監査ログの記録
    await audit_logger.log_action(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="POST",
        resource_id=post_id,
        previous_state=previous_state,
        new_state=new_state,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return db_post
```

### 9.3 非同期ログ処理の実装例

処理を高速化するために非同期でログを保存する例:

```python
# app/logs/async_log_handler.py
import asyncio
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.logs.models import ApplicationLog, AuditLog, PerformanceLog

class AsyncLogHandler:
    def __init__(self):
        self.app_log_queue = asyncio.Queue()
        self.audit_log_queue = asyncio.Queue()
        self.perf_log_queue = asyncio.Queue()
        self.running = False
        self.worker_task = None
    
    async def start(self):
        """ログハンドラーを起動"""
        if not self.running:
            self.running = True
            self.worker_task = asyncio.create_task(self._worker())
    
    async def stop(self):
        """ログハンドラーを停止"""
        if self.running:
            self.running = False
            if self.worker_task:
                await self.worker_task
    
    async def add_application_log(self, log_data: Dict[str, Any]):
        """アプリケーションログをキューに追加"""
        await self.app_log_queue.put(log_data)
    
    async def add_audit_log(self, log_data: Dict[str, Any]):
        """監査ログをキューに追加"""
        await self.audit_log_queue.put(log_data)
    
    async def add_performance_log(self, log_data: Dict[str, Any]):
        """パフォーマンスログをキューに追加"""
        await self.perf_log_queue.put(log_data)
    
    async def _worker(self):
        """バックグラウンドでログを処理するワーカー"""
        async_session = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        while self.running or not (
            self.app_log_queue.empty() and 
            self.audit_log_queue.empty() and 
            self.perf_log_queue.empty()
        ):
            # バッチサイズ（一度に処理するログの数）
            batch_size = 50
            
            # 各ログタイプのバッチを処理
            await self._process_app_logs(batch_size, async_session)
            await self._process_audit_logs(batch_size, async_session)
            await self._process_perf_logs(batch_size, async_session)
            
            # 短い待機時間
            await asyncio.sleep(0.1)
    
    async def _process_app_logs(self, batch_size: int, async_session):
        """アプリケーションログのバッチ処理"""
        if self.app_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                # キューからログを取得
                for _ in range(min(batch_size, self.app_log_queue.qsize())):
                    try:
                        log_data = self.app_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    # ログをデータベースに一括挿入
                    session.add_all([
                        ApplicationLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    # 各ログの処理完了をマーク
                    for _ in range(len(logs_to_process)):
                        self.app_log_queue.task_done()
    
    async def _process_audit_logs(self, batch_size: int, async_session):
        """監査ログのバッチ処理"""
        if self.audit_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                for _ in range(min(batch_size, self.audit_log_queue.qsize())):
                    try:
                        log_data = self.audit_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    session.add_all([
                        AuditLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    for _ in range(len(logs_to_process)):
                        self.audit_log_queue.task_done()
    
    async def _process_perf_logs(self, batch_size: int, async_session):
        """パフォーマンスログのバッチ処理"""
        if self.perf_log_queue.empty():
            return
        
        async with async_session() as session:
            async with session.begin():
                logs_to_process = []
                
                for _ in range(min(batch_size, self.perf_log_queue.qsize())):
                    try:
                        log_data = self.perf_log_queue.get_nowait()
                        logs_to_process.append(log_data)
                    except asyncio.QueueEmpty:
                        break
                
                if logs_to_process:
                    session.add_all([
                        PerformanceLog(**log_data) for log_data in logs_to_process
                    ])
                    
                    for _ in range(len(logs_to_process)):
                        self.perf_log_queue.task_done()

# グローバルなインスタンス
async_log_handler = AsyncLogHandler()
```

## 10. ログの保持ポリシーとメンテナンス

### 10.1 設定ファイルでの定義

```python
# app/config.py
from pydantic import BaseSettings

class LogSettings(BaseSettings):
    # ログレベル設定
    LOG_LEVEL: str = "INFO"
    
    # ログ保持期間（日数）
    APPLICATION_LOG_RETENTION_DAYS: int = 30  # 一般的なログは30日保持
    AUDIT_LOG_RETENTION_DAYS: int = 365  # 監査ログは1年保持
    PERFORMANCE_LOG_RETENTION_DAYS: int = 90  # パフォーマンスログは90日保持
    
    # バッチ設定
    LOG_BATCH_SIZE: int = 50  # 一括処理のバッチサイズ
    LOG_FLUSH_INTERVAL_SECONDS: float = 5.0  # 強制フラッシュの間隔
    
    # ログクリーンアップ設定
    LOG_CLEANUP_CRON: str = "0 2 * * *"  # 毎日午前2時に実行
    
    class Config:
        env_file = ".env"
        env_prefix = ""

log_settings = LogSettings()
```

### 10.2 スケジュールされたログクリーンアップ

```python
# app/logs/scheduled_tasks.py
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.logs.log_manager import LogManager
from app.database import get_db_async
from app.config import log_settings
import logging

logger = logging.getLogger("scheduled_tasks")

async def cleanup_old_logs():
    """古いログを定期的に削除する処理"""
    try:
        async_session = get_db_async()
        async with async_session() as session:
            log_manager = LogManager(session)
            
            await log_manager.cleanup_old_logs({
                "application_logs": log_settings.APPLICATION_LOG_RETENTION_DAYS,
                "audit_logs": log_settings.AUDIT_LOG_RETENTION_DAYS,
                "performance_logs": log_settings.PERFORMANCE_LOG_RETENTION_DAYS
            })
            
            logger.info(
                f"ログクリーンアップが完了しました - "
                f"保持期間: アプリケーションログ {log_settings.APPLICATION_LOG_RETENTION_DAYS}日, "
                f"監査ログ {log_settings.AUDIT_LOG_RETENTION_DAYS}日, "
                f"パフォーマンスログ {log_settings.PERFORMANCE_LOG_RETENTION_DAYS}日"
            )
    
    except Exception as e:
        logger.error(f"ログクリーンアップ中にエラーが発生しました: {str(e)}")

def setup_scheduled_tasks():
    """スケジュールタスクのセットアップ"""
    scheduler = AsyncIOScheduler()
    
    # ログクリーンアップを設定
    scheduler.add_job(
        cleanup_old_logs, 
        'cron', 
        **parse_cron_expression(log_settings.LOG_CLEANUP_CRON)
    )
    
    scheduler.start()
    logger.info("スケジュールタスクが開始されました")
    
    return scheduler

def parse_cron_expression(cron_expr):
    """Cronエクスプレッションをapsched引数に変換"""
    parts = cron_expr.split()
    return {
        'minute': parts[0],
        'hour': parts[1],
        'day': parts[2],
        'month': parts[3],
        'day_of_week': parts[4]
    }
```

## 11. ログデータのエクスポート機能

```python
# app/routes/logs.py (追加エンドポイント)
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
import os
import csv
import tempfile
from datetime import datetime, timedelta
import json

@router.get("/export/application")
async def export_application_logs(
    start_time: Optional[datetime] = Query(None, description="開始日時"),
    end_time: Optional[datetime] = Query(None, description="終了日時"),
    level: Optional[str] = Query(None, description="ログレベル"),
    source: Optional[str] = Query(None, description="ログソース"),
    format: str = Query("csv", description="エクスポート形式(csv/json)"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """アプリケーションログをエクスポート（管理者専用）"""
    # デフォルトの日付範囲（過去7日間）
    if not end_time:
        end_time = datetime.utcnow()
    if not start_time:
        start_time = end_time - timedelta(days=7)
    
    log_manager = LogManager(db)
    logs = await log_manager.get_application_logs(
        level=level,
        source=source,
        start_time=start_time,
        end_time=end_time,
        limit=10000  # 適切な上限を設定
    )
    
    # 一時ファイルの作成
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as temp_file:
        filename = temp_file.name
        
        if format == "csv":
            # CSVエクスポート
            fieldnames = ['id', 'timestamp', 'level', 'source', 'message', 
                          'user_id', 'endpoint', 'ip_address', 'user_agent', 'request_id']
            
            writer = csv.DictWriter(temp_file, fieldnames=fieldnames)
            writer.writeheader()
            
            for log in logs:
                log_dict = {
                    'id': log.id,
                    'timestamp': log.timestamp.isoformat(),
                    'level': log.level,
                    'source': log.source,
                    'message': log.message,
                    'user_id': log.user_id,
                    'endpoint': log.endpoint,
                    'ip_address': log.ip_address,
                    'user_agent': log.user_agent,
                    'request_id': log.request_id
                }
                writer.writerow(log_dict)
                
        elif format == "json":
            # JSONエクスポート
            json_logs = []
            for log in logs:
                log_dict = {
                    'id': log.id,
                    'timestamp': log.timestamp.isoformat(),
                    'level': log.level,
                    'source': log.source,
                    'message': log.message,
                    'user_id': log.user_id,
                    'endpoint': log.endpoint,
                    'ip_address': log.ip_address,
                    'user_agent': log.user_agent,
                    'request_id': log.request_id,
                    'additional_data': log.additional_data
                }
                json_logs.append(log_dict)
            
            temp_file.write(json.dumps(json_logs, indent=2).encode('utf-8'))
        
        else:
            raise HTTPException(status_code=400, detail="サポートされていないフォーマットです")
    
    # 一時ファイルを返す
    return FileResponse(
        path=filename,
        filename=f"application_logs_{timestamp}.{format}",
        media_type=f"application/{format}",
        background=BackgroundTasks(lambda: os.unlink(filename))
    )

# 同様に監査ログとパフォーマンスログのエクスポートエンドポイントも実装
```

## 12. ログの活用方法

### 12.1 ダッシュボード連携

管理画面でログデータを視覚化するためのAPIエンドポイント:

```python
# app/routes/logs.py (追加エンドポイント)
@router.get("/dashboard/summary")
async def get_logs_dashboard_summary(
    days: int = Query(7, description="過去何日分のデータを取得するか"),
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_admin_user)
):
    """ダッシュボード用のログサマリーを取得（管理者専用）"""
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=days)
    
    # 日付ごとのログ数を集計
    query = select(
        func.date_trunc('day', ApplicationLog.timestamp).label("day"),
        func.count().label("count"),
        ApplicationLog.level
    ).filter(
        ApplicationLog.timestamp >= start_time,
        ApplicationLog.timestamp <= end_time
    ).group_by(
        func.date_trunc('day', ApplicationLog.timestamp),
        ApplicationLog.level
    ).order_by(func.date_trunc('day', ApplicationLog.timestamp))
    
    result = await db.execute(query)
    rows = result.all()
    
    # レスポンス形式に整形
    days_data = {}
    for row in rows:
        day = row.day.strftime("%Y-%m-%d")
        if day not in days_data:
            days_data[day] = {
                "INFO": 0,
                "WARNING": 0,
                "ERROR": 0,
                "CRITICAL": 0,
                "total": 0
            }
        days_data[day][row.level] = row.count
        days_data[day]["total"] += row.count
    
    # エラー数の集計
    error_query = select(
        ApplicationLog.source,
        func.count().label("count")
    ).filter(
        ApplicationLog.timestamp >= start_time,
        ApplicationLog.timestamp <= end_time,
        ApplicationLog.level.in_(["ERROR", "CRITICAL"])
    ).group_by(
        ApplicationLog.source
    ).order_by(desc(func.count()))
    
    error_result = await db.execute(error_query)
    error_sources = [{"source": row.source, "count": row.count} for row in error_result]
    
    # アクセス数の多いエンドポイント集計
    endpoint_query = select(
        PerformanceLog.endpoint,
        func.count().label("count"),
        func.avg(PerformanceLog.response_time).label("avg_time")
    ).filter(
        PerformanceLog.timestamp >= start_time,
        PerformanceLog.timestamp <= end_time
    ).group_by(
        PerformanceLog.endpoint
    ).order_by(desc(func.count())).limit(10)
    
    endpoint_result = await db.execute(endpoint_query)
    popular_endpoints = [
        {
            "endpoint": row.endpoint, 
            "count": row.count, 
            "avg_time": round(row.avg_time, 2)
        } 
        for row in endpoint_result
    ]
    
    return {
        "time_range": {
            "start": start_time.isoformat(),
            "end": end_time.isoformat(),
            "days": days
        },
        "logs_by_day": days_data,
        "error_sources": error_sources,
        "popular_endpoints": popular_endpoints
    }
```

## 13. まとめ

本ドキュメントでは、ヘルパーシステムバックエンドにおけるログ機能の実装方法について説明しました。アプリケーションログ、監査ログ、パフォーマンスログの3種類のログを実装し、効果的なログ管理を行うための基盤を構築しました。

主要な実装ポイント:

1. SQLAlchemyを使用したログモデルの定義
2. 各ログタイプに特化したロガークラスの実装
3. FastAPIミドルウェアを利用したリクエスト処理のログ記録
4. 効率的なログ保存のための非同期処理
5. ログデータの検索・分析・エクスポート機能
6. 定期的なログクリーンアップのスケジュール設定

これらの機能により、システムの動作状況の監視、ユーザーアクションの追跡、パフォーマンスの測定が可能になります。また、収集されたログデータを活用して、システムの改善や問題の早期発見に役立てることができます。

最終更新日: 2025-04-30