"""
料理リクエストのスキーマ定義
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator, root_validator
from datetime import datetime, date
from app.db.models.recipe_request import RecipeRequestStatus
from app.schemas.validators import (
    validate_url, 
    validate_future_date, 
    validate_recipe_content,
    validate_tags
)

class RecipeRequestBase(BaseModel):
    """料理リクエスト基本スキーマ"""
    title: str = Field(..., min_length=1, max_length=200, description="リクエストのタイトル")
    description: str = Field(..., min_length=1, description="リクエストの説明")
    recipe_url: Optional[str] = Field(None, description="レシピのURL（クックパッド等）")
    recipe_content: Optional[Dict[str, Any]] = Field(None, description="レシピ内容")
    scheduled_date: Optional[date] = Field(None, description="予定日")
    notes: Optional[str] = Field(None, description="特記事項（アレルギー対応等）")
    priority: int = Field(0, ge=0, le=5, description="優先度（0-5）")
    status: RecipeRequestStatus = Field(RecipeRequestStatus.PENDING, description="リクエストのステータス")
    
    # URLバリデーション
    _validate_url = validator('recipe_url', allow_reuse=True, pre=True)(validate_url)
    
    # 日付バリデーション
    _validate_date = validator('scheduled_date', allow_reuse=True)(validate_future_date)
    
    # レシピ内容のバリデーション
    _validate_recipe_content = validator('recipe_content', allow_reuse=True)(validate_recipe_content)

class RecipeRequestCreate(RecipeRequestBase):
    """料理リクエスト作成スキーマ"""
    user_id: int = Field(..., description="リクエスト作成者のユーザーID")
    tags: List[str] = Field([], description="タグのリスト")
    
    # タグのバリデーション
    _validate_tags = validator('tags', allow_reuse=True)(validate_tags)
    
    @root_validator(skip_on_failure=True)
    def validate_recipe_info(cls, values):
        """
        レシピURLまたはレシピ内容のいずれかが必要
        """
        recipe_url = values.get('recipe_url')
        recipe_content = values.get('recipe_content')
        
        if not recipe_url and not recipe_content:
            raise ValueError("レシピURLまたはレシピ内容のいずれかを指定してください")
        
        return values
    
class RecipeRequestUpdate(BaseModel):
    """料理リクエスト更新スキーマ"""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="リクエストのタイトル")
    description: Optional[str] = Field(None, min_length=1, description="リクエストの説明")
    recipe_url: Optional[str] = Field(None, description="レシピのURL（クックパッド等）")
    recipe_content: Optional[Dict[str, Any]] = Field(None, description="レシピ内容")
    scheduled_date: Optional[date] = Field(None, description="予定日")
    notes: Optional[str] = Field(None, description="特記事項（アレルギー対応等）")
    priority: Optional[int] = Field(None, ge=0, le=5, description="優先度（0-5）")
    status: Optional[RecipeRequestStatus] = Field(None, description="リクエストのステータス")
    tags: Optional[List[str]] = Field(None, description="タグのリスト")
    
    # URLバリデーション
    _validate_url = validator('recipe_url', allow_reuse=True, pre=True)(validate_url)
    
    # 日付バリデーション
    _validate_date = validator('scheduled_date', allow_reuse=True)(validate_future_date)
    
    # レシピ内容のバリデーション
    _validate_recipe_content = validator('recipe_content', allow_reuse=True)(validate_recipe_content)
    
    # タグのバリデーション
    _validate_tags = validator('tags', allow_reuse=True)(validate_tags)
    
    class Config:
        validate_assignment = True

class RecipeRequestResponse(RecipeRequestBase):
    """料理リクエストレスポンススキーマ"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True