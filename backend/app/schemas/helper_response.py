"""
ヘルパー返信のスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class HelperResponseBase(BaseModel):
    """ヘルパー返信基本スキーマ"""
    feedback_id: int
    helper_id: int
    response_text: str
    cooking_notes: Optional[str] = None

class HelperResponseCreate(HelperResponseBase):
    """ヘルパー返信作成スキーマ"""
    pass

class HelperResponseUpdate(BaseModel):
    """ヘルパー返信更新スキーマ"""
    response_text: Optional[str] = None
    cooking_notes: Optional[str] = None

class HelperResponseRead(HelperResponseBase):
    """ヘルパー返信レスポンススキーマ"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
# 後方互換性のためにエイリアスを作成
HelperResponseResponse = HelperResponseRead
