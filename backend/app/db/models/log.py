"""
ログ関連モデル定義
"""
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, JSON, ForeignKey, Enum
from app.db.base import Base, BaseModel
import enum
from sqlalchemy.orm import relationship

class LogLevel(str, enum.Enum):
    """ログレベル定義"""
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class ApplicationLog(Base, BaseModel):
    """アプリケーションログモデル"""
    __tablename__ = "application_logs"
    
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    level = Column(Enum(LogLevel), nullable=False, index=True)
    source = Column(String(50), nullable=False, index=True)
    message = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    endpoint = Column(String(200))
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    request_id = Column(String(50))
    additional_data = Column(JSON)
    
    # リレーションシップ
    user = relationship("User", backref="application_logs")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<ApplicationLog(id={self.id}, level={self.level}, source={self.source})>"

class AuditAction(str, enum.Enum):
    """監査アクション定義"""
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"

class AuditLog(Base, BaseModel):
    """監査ログモデル"""
    __tablename__ = "audit_logs"
    
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    action = Column(Enum(AuditAction), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False, index=True)
    resource_id = Column(Integer)
    previous_state = Column(JSON)
    new_state = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    additional_data = Column(JSON)
    
    # リレーションシップ
    user = relationship("User", backref="audit_logs")
    
    # インデックス用のテーブル引数
    __table_args__ = (
        {"postgresql_using": "btree", "index": True, "columns": ["resource_type", "resource_id"]},
    )
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<AuditLog(id={self.id}, action={self.action}, resource_type={self.resource_type}, resource_id={self.resource_id})>"

class PerformanceLog(Base, BaseModel):
    """パフォーマンスログモデル"""
    __tablename__ = "performance_logs"
    
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    endpoint = Column(String(200), nullable=False, index=True)
    response_time = Column(Integer, nullable=False, index=True)  # ミリ秒
    status_code = Column(Integer)
    request_method = Column(String(10))
    request_size = Column(Integer)
    response_size = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    ip_address = Column(String(50))
    additional_metrics = Column(JSON)
    
    # リレーションシップ
    user = relationship("User", backref="performance_logs")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<PerformanceLog(id={self.id}, endpoint={self.endpoint}, response_time={self.response_time}ms)>"
