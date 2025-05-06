"""
テスト用認証ユーティリティ
"""
from typing import Dict, Any
from datetime import datetime, timedelta

from jose import jwt

from app.core.auth import ACCESS_TOKEN_EXPIRE_MINUTES
from app.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
from app.db.models.user import User


def create_token_for_user(user_id: int) -> str:
    """
    テスト用にJWTトークンを作成する
    :param user_id: ユーザーID
    :return: JWTトークン
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def create_test_token(user_obj: User) -> Dict[str, str]:
    """
    テスト用にトークンを含むヘッダーを作成する
    :param user_obj: ユーザーオブジェクト
    :return: 認証ヘッダー
    """
    token = create_token_for_user(user_obj.id)
    return {"Authorization": f"Bearer {token}"}
