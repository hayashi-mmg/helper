"""
お願いごとモデル定義
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel
import enum

class TaskStatus(str, enum.Enum):
    """お願いごとステータス定義"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Task(Base, BaseModel):
    """お願いごとモデル"""
    __tablename__ = "task_requests"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Integer, default=3, nullable=False, index=True) # 1: 高 - 5: 低
    scheduled_date = Column(Date, index=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False, index=True)
    
    # リレーションシップ
    user = relationship("User", backref="tasks")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<Task(id={self.id}, user_id={self.user_id}, title={self.title}, priority={self.priority}, status={self.status})>"
