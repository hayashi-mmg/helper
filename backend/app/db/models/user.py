"""
ユーザーモデル定義
"""
from sqlalchemy import Column, String, Boolean, Enum
from app.db.base import Base, BaseModel
import enum

class UserRole(str, enum.Enum):
    """ユーザーロール定義"""
    USER = "user"
    HELPER = "helper"
    ADMIN = "admin"

class User(Base, BaseModel):
    """ユーザーモデル"""
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
