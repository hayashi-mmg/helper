"""
認証関連のスキーマ（リクエスト/レスポンス）
"""
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional


class UserCreate(BaseModel):
    """ユーザー登録リクエスト"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @validator("username")
    def username_alphanumeric(cls, v):
        if not v.isalnum():
            raise ValueError("ユーザー名は英数字のみ使用可能です")
        return v


class UserLogin(BaseModel):
    """ユーザーログインリクエスト"""
    username: str
    password: str


class Token(BaseModel):
    """トークンレスポンス"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """トークンペイロード"""
    sub: Optional[str] = None


class RefreshToken(BaseModel):
    """リフレッシュトークンリクエスト"""
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """パスワードリセット要求リクエスト"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """パスワードリセット確認リクエスト"""
    token: str
    new_password: str = Field(..., min_length=8)


class ResetResponse(BaseModel):
    """パスワードリセット要求レスポンス"""
    message: str
