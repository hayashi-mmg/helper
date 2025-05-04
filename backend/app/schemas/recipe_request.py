"""
料理リクエストのスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime, date
from app.db.models.recipe_request import RecipeRequestStatus

class RecipeRequestBase(BaseModel):
    """料理リクエスト基本スキーマ"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    recipe_url: Optional[str] = None  # TODO: バリデーション
    recipe_content: Optional[str] = None
    scheduled_date: Optional[date] = None
    status: RecipeRequestStatus = RecipeRequestStatus.PENDING

class RecipeRequestCreate(RecipeRequestBase):
    """料理リクエスト作成スキーマ"""
    user_id: int
    
class RecipeRequestUpdate(BaseModel):
    """料理リクエスト更新スキーマ"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    recipe_url: Optional[str] = None
    recipe_content: Optional[str] = None
    scheduled_date: Optional[date] = None
    status: Optional[RecipeRequestStatus] = None

class RecipeRequestResponse(RecipeRequestBase):
    """料理リクエストレスポンススキーマ"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
