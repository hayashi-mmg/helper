# app/db/models/logs.py
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base

class ApplicationLog(Base):
    __tablename__ = "application_logs"
    __table_args__ = (
        Index('idx_app_logs_timestamp_level', 'timestamp', 'level'),
        Index('idx_app_logs_source_level', 'source', 'level'),
        {'extend_existing': True}  # テーブル再定義を許可
    )
    
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

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index('idx_audit_logs_user_action', 'user_id', 'action'),
        Index('idx_audit_logs_resource', 'resource_type', 'resource_id'),
        {'extend_existing': True}  # テーブル再定義を許可
    )
    
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
    additional_data = Column(JSON, nullable=True)  # クライアント固有の情報

class PerformanceLog(Base):
    __tablename__ = "performance_logs"
    __table_args__ = (
        Index('idx_perf_logs_endpoint_time', 'endpoint', 'response_time'),
        Index('idx_perf_logs_timestamp_endpoint', 'timestamp', 'endpoint'),
        {'extend_existing': True}  # テーブル再定義を許可
    )
    
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