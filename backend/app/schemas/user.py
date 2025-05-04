"""
ユーザー関連のスキーマ
"""
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.schemas.validators import (
    validate_email, 
    validate_username, 
    validate_phone_number, 
    validate_postal_code,
    validate_address
)
from app.core.password_policy import PasswordPolicy


class UserBase(BaseModel):
    """ユーザー基本情報"""
    username: str = Field(..., min_length=3, max_length=50, description="ユーザー名")
    email: EmailStr = Field(..., description="メールアドレス")
    full_name: Optional[str] = Field(None, max_length=100, description="氏名")
    is_active: bool = Field(True, description="アクティブ状態")
    phone_number: Optional[str] = Field(None, description="電話番号")
    postal_code: Optional[str] = Field(None, description="郵便番号")
    address: Optional[Dict[str, Any]] = Field(None, description="住所情報")
    
    # カスタムバリデータ
    _validate_username = validator('username', allow_reuse=True)(validate_username)
    _validate_email = validator('email', allow_reuse=True)(validate_email)
    _validate_phone = validator('phone_number', allow_reuse=True)(validate_phone_number)
    _validate_postal = validator('postal_code', allow_reuse=True)(validate_postal_code)
    _validate_address = validator('address', allow_reuse=True)(validate_address)


class UserCreate(UserBase):
    """ユーザー作成スキーマ"""
    password: str = Field(..., min_length=8, description="パスワード")
    
    @validator('password')
    def validate_password(cls, v):
        """パスワードポリシーに基づく検証"""
        password_policy = PasswordPolicy()
        is_valid, errors = password_policy.validate(v)
        
        if not is_valid:
            raise ValueError('; '.join(errors))
            
        return v


class UserUpdate(BaseModel):
    """ユーザー更新スキーマ"""
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="ユーザー名")
    email: Optional[EmailStr] = Field(None, description="メールアドレス")
    full_name: Optional[str] = Field(None, max_length=100, description="氏名")
    is_active: Optional[bool] = Field(None, description="アクティブ状態")
    phone_number: Optional[str] = Field(None, description="電話番号")
    postal_code: Optional[str] = Field(None, description="郵便番号")
    address: Optional[Dict[str, Any]] = Field(None, description="住所情報")
    
    # カスタムバリデータ（Noneの場合は検証をスキップ）
    _validate_username = validator('username', allow_reuse=True, pre=True)(lambda v: validate_username(v) if v else None)
    _validate_email = validator('email', allow_reuse=True, pre=True)(lambda v: validate_email(v) if v else None)
    _validate_phone = validator('phone_number', allow_reuse=True, pre=True)(lambda v: validate_phone_number(v) if v else None)
    _validate_postal = validator('postal_code', allow_reuse=True, pre=True)(lambda v: validate_postal_code(v) if v else None)
    _validate_address = validator('address', allow_reuse=True, pre=True)(lambda v: validate_address(v) if v else None)
    
    class Config:
        validate_assignment = True


class UserResponse(UserBase):
    """ユーザー情報レスポンス"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PasswordChange(BaseModel):
    """パスワード変更スキーマ"""
    current_password: str = Field(..., description="現在のパスワード")
    new_password: str = Field(..., min_length=8, description="新しいパスワード")
    
    @validator('new_password')
    def validate_password(cls, v, values):
        """パスワードポリシーに基づく検証"""
        if 'current_password' in values and v == values['current_password']:
            raise ValueError('新しいパスワードは現在のパスワードと異なる必要があります')
            
        password_policy = PasswordPolicy()
        is_valid, errors = password_policy.validate(v)
        
        if not is_valid:
            raise ValueError('; '.join(errors))
            
        return v
