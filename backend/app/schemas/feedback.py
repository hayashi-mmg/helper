"""
フィードバックのスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime

class FeedbackBase(BaseModel):
    """フィードバック基本スキーマ"""
    recipe_request_id: int
    user_id: int
    taste_rating: int = Field(..., ge=1, le=5)
    texture_rating: int = Field(..., ge=1, le=5)
    quantity_rating: int = Field(..., ge=1, le=5)
    overall_rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None
    request_for_next: Optional[str] = None
    photo_url: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    """フィードバック作成スキーマ"""
    pass

class FeedbackUpdate(BaseModel):
    """フィードバック更新スキーマ"""
    taste_rating: Optional[int] = Field(None, ge=1, le=5)
    texture_rating: Optional[int] = Field(None, ge=1, le=5)
    quantity_rating: Optional[int] = Field(None, ge=1, le=5)
    overall_rating: Optional[int] = Field(None, ge=1, le=5)
    comments: Optional[str] = None
    request_for_next: Optional[str] = None
    photo_url: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    """フィードバックレスポンススキーマ"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
