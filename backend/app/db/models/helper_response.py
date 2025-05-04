"""
フィードバック返信モデル定義
"""
from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel

class HelperResponse(Base, BaseModel):
    """フィードバック返信モデル"""
    __tablename__ = "feedback_responses"
    
    feedback_id = Column(Integer, ForeignKey("recipe_feedbacks.id", ondelete="CASCADE"), nullable=False, index=True)
    helper_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    cooking_notes = Column(Text)
    
    # リレーションシップ
    feedback = relationship("Feedback", backref="responses")
    helper = relationship("User", backref="feedback_responses")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<HelperResponse(id={self.id}, feedback_id={self.feedback_id}, helper_id={self.helper_id})>"
