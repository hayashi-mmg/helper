"""
認証サービス（ユーザー認証、トークン発行、パスワードリセット等）
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.auth import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.crud.users import get_user_by_username, get_user_by_email, create_user
from app.db.models.user import User

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    """
    ユーザー認証
    :param db: DBセッション
    :param username: ユーザー名
    :param password: パスワード
    :return: User or None
    """
    user = await get_user_by_username(db, username)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

async def register_user(db: AsyncSession, username: str, email: str, password: str) -> User:
    """
    ユーザー登録
    :param db: DBセッション
    :param username: ユーザー名
    :param email: メールアドレス
    :param password: パスワード
    :return: 作成ユーザー
    """
    hashed_password = get_password_hash(password)
    user = await create_user(db, username=username, email=email, password_hash=hashed_password)
    return user
