"""
フィードバックモデル定義
"""
from sqlalchemy import Column, Integer, Text, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel

class Feedback(Base, BaseModel):
    """料理フィードバックモデル"""
    __tablename__ = "recipe_feedbacks"
    
    recipe_request_id = Column(Integer, ForeignKey("recipe_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    taste_rating = Column(Integer, nullable=False)  # 味付け評価(1-5)
    texture_rating = Column(Integer, nullable=False)  # 食感評価(1-5)
    quantity_rating = Column(Integer, nullable=False)  # 量の評価(1-5)
    overall_rating = Column(Integer, nullable=False)  # 総合評価(1-5)
    comments = Column(Text)
    request_for_next = Column(Text)
    photo_url = Column(String(512))
    
    # リレーションシップ
    recipe_request = relationship("RecipeRequest", backref="feedbacks")
    user = relationship("User", backref="feedbacks")
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<Feedback(id={self.id}, recipe_request_id={self.recipe_request_id}, user_id={self.user_id}, overall_rating={self.overall_rating})>"
