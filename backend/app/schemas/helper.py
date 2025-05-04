"""
ヘルパープロファイルのスキーマ定義
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class HelperProfileBase(BaseModel):
    """ヘルパープロファイル基本スキーマ"""
    qualification: Optional[str] = None
    specialties: Optional[Dict[str, Any]] = None
    availability: Optional[Dict[str, Any]] = None

class HelperProfileCreate(HelperProfileBase):
    """ヘルパープロファイル作成スキーマ"""
    user_id: int

class HelperProfileUpdate(HelperProfileBase):
    """ヘルパープロファイル更新スキーマ"""
    pass

class HelperProfileResponse(HelperProfileBase):
    """ヘルパープロファイルレスポンススキーマ"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
