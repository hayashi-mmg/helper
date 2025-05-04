"""
ヘルパープロファイルモデル定義
"""
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel

class HelperProfile(Base, BaseModel):
    """ヘルパープロファイルモデル"""
    __tablename__ = "helper_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    qualification = Column(String(100))
    specialties = Column(JSON)
    availability = Column(JSON)
    
    # リレーションシップ
    user = relationship("User", backref="helper_profile", uselist=False)
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<HelperProfile(id={self.id}, user_id={self.user_id}, qualification={self.qualification})>"
