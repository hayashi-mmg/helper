"""
ログ関連のPydanticスキーマ
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ApplicationLogBase(BaseModel):
    """アプリケーションログの基本スキーマ"""
    level: str
    source: str
    message: str
    user_id: Optional[int] = None
    endpoint: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    additional_data: Optional[Dict[str, Any]] = None

class ApplicationLogCreate(ApplicationLogBase):
    """アプリケーションログ作成用スキーマ"""
    pass

class ApplicationLogResponse(ApplicationLogBase):
    """アプリケーションログレスポンス用スキーマ"""
    id: int
    timestamp: datetime
    request_id: Optional[str] = None

    class Config:
        from_attributes = True

class AuditLogBase(BaseModel):
    """監査ログの基本スキーマ"""
    user_id: Optional[int] = None
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    """監査ログ作成用スキーマ"""
    pass

class AuditLogResponse(AuditLogBase):
    """監査ログレスポンス用スキーマ"""
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class PerformanceLogBase(BaseModel):
    """パフォーマンスログの基本スキーマ"""
    endpoint: str
    request_method: str
    response_time: int
    status_code: int
    request_size: Optional[int] = None
    response_size: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    user_id: Optional[int] = None
    additional_metrics: Optional[Dict[str, Any]] = None

class PerformanceLogCreate(PerformanceLogBase):
    """パフォーマンスログ作成用スキーマ"""
    pass

class PerformanceLogResponse(PerformanceLogBase):
    """パフォーマンスログレスポンス用スキーマ"""
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
