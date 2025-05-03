"""
認証・認可関連のユーティリティ（JWT生成・検証、パスワードハッシュ化など）
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.config import settings

# パスワードハッシュ用コンテキスト
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# パスワードハッシュ化

def get_password_hash(password: str) -> str:
    """
    パスワードをハッシュ化
    :param password: 平文パスワード
    :return: ハッシュ化済みパスワード
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    パスワード検証
    :param plain_password: 平文パスワード
    :param hashed_password: ハッシュ化済みパスワード
    :return: 一致すればTrue
    """
    return pwd_context.verify(plain_password, hashed_password)

# JWTトークン生成

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    アクセストークンを生成
    :param data: ペイロード
    :param expires_delta: 有効期限
    :return: JWTトークン
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    リフレッシュトークンを生成
    :param data: ペイロード
    :return: JWTトークン
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt

def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    JWTトークンをデコード
    :param token: JWTトークン
    :return: デコード済みペイロード
    :raises: JWTError
    """
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
