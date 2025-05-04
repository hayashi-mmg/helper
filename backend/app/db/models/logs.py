"""
ロギングシステム用のデータベースモデル定義
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.base import Base

class ApplicationLog(Base):
    """アプリケーションログモデル"""
    __tablename__ = "application_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, index=True, nullable=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    level = Column(String, index=True)  # INFO, WARNING, ERROR, CRITICAL
    source = Column(String, index=True)  # API, UI, SYSTEM など
    message = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    endpoint = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    additional_data = Column(JSON, nullable=True)

class AuditLog(Base):
    """監査ログモデル（ユーザーアクションの記録）"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String, index=True)  # CREATE, UPDATE, DELETE, LOGIN など
    resource_type = Column(String, index=True)  # USER, POST, COMMENT など
    resource_id = Column(Integer, nullable=True)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

class PerformanceLog(Base):
    """パフォーマンスログモデル（処理時間の記録）"""
    __tablename__ = "performance_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), index=True)
    endpoint = Column(String, index=True)
    request_method = Column(String)
    response_time = Column(Integer)  # ミリ秒
    status_code = Column(Integer, index=True)
    request_size = Column(Integer, nullable=True)
    response_size = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    additional_metrics = Column(JSON, nullable=True)
