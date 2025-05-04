"""
QRコードのスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from app.db.models.qrcode import QRCodeTargetType

class QRCodeBase(BaseModel):
    """QRコード基本スキーマ"""
    target_type: QRCodeTargetType
    target_id: int
    url: str = Field(..., max_length=512)
    title: str = Field(..., min_length=1, max_length=200)
    expire_at: Optional[datetime] = None
    created_by: int

class QRCodeCreate(QRCodeBase):
    """QRコード作成スキーマ"""
    pass

class QRCodeUpdate(BaseModel):
    """QRコード更新スキーマ"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    expire_at: Optional[datetime] = None
    access_count: Optional[int] = None

class QRCodeResponse(QRCodeBase):
    """QRコードレスポンススキーマ"""
    id: int
    access_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
