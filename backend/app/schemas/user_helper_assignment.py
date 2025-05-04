"""
ユーザーヘルパー割り当てのスキーマ定義
"""
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.db.models.user_helper_assignment import RelationshipStatus

class UserHelperAssignmentBase(BaseModel):
    """ユーザーヘルパー割り当て基本スキーマ"""
    user_id: int
    helper_id: int
    status: RelationshipStatus = RelationshipStatus.PENDING

class UserHelperAssignmentCreate(UserHelperAssignmentBase):
    """ユーザーヘルパー割り当て作成スキーマ"""
    pass

class UserHelperAssignmentUpdate(BaseModel):
    """ユーザーヘルパー割り当て更新スキーマ"""
    status: Optional[RelationshipStatus] = None

class UserHelperAssignmentResponse(UserHelperAssignmentBase):
    """ユーザーヘルパー割り当てレスポンススキーマ"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
