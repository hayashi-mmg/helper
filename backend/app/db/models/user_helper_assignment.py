"""
ユーザーとヘルパーの関連モデル定義
"""
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel
import enum

class RelationshipStatus(str, enum.Enum):
    """関係ステータス定義"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class UserHelperAssignment(Base, BaseModel):
    """ユーザーとヘルパーの関連モデル"""
    __tablename__ = "user_helper_relationships"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    helper_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(RelationshipStatus), default=RelationshipStatus.ACTIVE, nullable=False)
    
    # リレーションシップ
    user = relationship("User", foreign_keys=[user_id], backref="assigned_helpers")
    helper = relationship("User", foreign_keys=[helper_id], backref="assigned_users")
    
    # 複合ユニーク制約
    __table_args__ = (
        UniqueConstraint("user_id", "helper_id", name="uq_user_helper"),
    )
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<UserHelperAssignment(id={self.id}, user_id={self.user_id}, helper_id={self.helper_id}, status={self.status})>"
