"""
ユーザー関連のスキーマ
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """ユーザー基本情報"""
    username: str
    email: EmailStr
    is_active: bool


class UserResponse(UserBase):
    """ユーザー情報レスポンス"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
