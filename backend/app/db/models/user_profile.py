"""
ユーザープロファイルモデル定義
"""
from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base, BaseModel

class UserProfile(Base, BaseModel):
    """ユーザープロファイルモデル"""
    __tablename__ = "user_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    full_name = Column(String(100))
    phone_number = Column(String(20))
    address = Column(String(255))
    preferences = Column(JSON)
    
    # リレーションシップ
    user = relationship("User", backref="profile", uselist=False)
    
    def __repr__(self) -> str:
        """文字列表現"""
        return f"<UserProfile(id={self.id}, user_id={self.user_id}, full_name={self.full_name})>"
