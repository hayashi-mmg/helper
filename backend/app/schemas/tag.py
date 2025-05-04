"""
タグのスキーマ定義
"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class TagBase(BaseModel):
    """タグ基本スキーマ"""
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, max_length=20)

class TagCreate(TagBase):
    """タグ作成スキーマ"""
    pass

class TagUpdate(BaseModel):
    """タグ更新スキーマ"""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, max_length=20)

class TagResponse(TagBase):
    """タグレスポンススキーマ"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# タグの参照用スキーマ（関連エンティティ用）
class TagInResponse(BaseModel):
    """関連エンティティ用のタグ情報"""
    id: int
    name: str
    color: Optional[str] = None

    class Config:
        from_attributes = True
