"""
料理リクエストモデル定義
"""
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel
import enum

class RecipeRequestStatus(str, enum.Enum):
    """料理リクエストステータス定義"""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class RecipeRequest(Base, BaseModel):
    """料理リクエストモデル"""
    __tablename__ = "recipe_requests"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    recipe_url = Column(String(512))
    recipe_content = Column(Text)
    scheduled_date = Column(Date, index=True)
    status = Column(Enum(RecipeRequestStatus), default=RecipeRequestStatus.PENDING, nullable=False, index=True)
    
    # リレーションシップ
    user = relationship("User", backref="recipe_requests")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<RecipeRequest(id={self.id}, user_id={self.user_id}, title={self.title}, status={self.status})>"
