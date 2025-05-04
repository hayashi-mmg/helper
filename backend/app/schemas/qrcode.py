"""
QRコードのスキーマ定義
"""
from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime, timedelta
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
    
class QRCodeRequestCreate(BaseModel):
    """QRコード作成リクエストスキーマ"""
    target_type: QRCodeTargetType
    target_id: int
    title: str = Field(..., min_length=1, max_length=200)
    expire_in: Optional[int] = Field(None, description="有効期限（秒）", ge=0)
    
    def to_qrcode_create(self, url: str, user_id: int) -> QRCodeCreate:
        """QRCodeCreateに変換"""
        # 有効期限の計算
        expire_at = None
        if self.expire_in:
            expire_at = datetime.now() + timedelta(seconds=self.expire_in)
            
        return QRCodeCreate(
            target_type=self.target_type,
            target_id=self.target_id,
            url=url,
            title=self.title,
            expire_at=expire_at,
            created_by=user_id
        )

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
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
        
class QRCodeBatchCreate(BaseModel):
    """QRコード一括作成スキーマ"""
    qrcodes: List[QRCodeRequestCreate] = Field(..., min_items=1)
