"""
フィードバックのスキーマ定義
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator, model_validator
from datetime import datetime
from app.schemas.validators import validate_url, validate_comments

class FeedbackBase(BaseModel):
    """フィードバック基本スキーマ"""
    recipe_request_id: int = Field(..., description="料理リクエストID")
    user_id: int = Field(..., description="ユーザーID")
    taste_rating: int = Field(..., ge=1, le=5, description="味の評価 (1-5)")
    texture_rating: int = Field(..., ge=1, le=5, description="食感の評価 (1-5)")
    quantity_rating: int = Field(..., ge=1, le=5, description="量の評価 (1-5)")
    overall_rating: int = Field(..., ge=1, le=5, description="全体的な評価 (1-5)")
    comments: Optional[str] = Field(None, max_length=1000, description="コメント")
    request_for_next: Optional[str] = Field(None, max_length=500, description="次回のリクエスト")
    photo_url: Optional[str] = Field(None, description="写真のURL")
    
    # コメントのバリデーション
    _validate_comments = validator('comments', allow_reuse=True, pre=True)(validate_comments)
    
    # 写真URLのバリデーション
    _validate_url = validator('photo_url', allow_reuse=True, pre=True)(validate_url)
    
    @model_validator(mode='after')
    def calculate_overall_rating(self):
        """
        全体的な評価が指定されていない場合、他の評価の平均値を計算
        """
        if not self.overall_rating:
            ratings = [self.taste_rating, self.texture_rating, self.quantity_rating]
            ratings = [r for r in ratings if r is not None]
            if ratings:
                self.overall_rating = round(sum(ratings) / len(ratings))
        return self
        
    @validator('request_for_next')
    def validate_request_length(cls, v):
        """リクエストの長さ検証"""
        if v is not None and len(v) < 5:
            raise ValueError("次回のリクエストは5文字以上で入力してください")
        return v

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
