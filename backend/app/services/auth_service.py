"""
認証サービス（ユーザー認証、トークン発行、パスワードリセット等）
"""
from datetime import timedelta
from typing import Dict, Optional, Tuple
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.core.auth import (verify_password, get_password_hash, create_access_token, 
                          create_refresh_token, decode_jwt_token, ACCESS_TOKEN_EXPIRE_MINUTES)
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
    :raises: HTTPException - ユーザー名またはメールアドレスが既に使用されている場合
    """
    # ユーザー名の重複チェック
    existing_user = await get_user_by_username(db, username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このユーザー名は既に使用されています"
        )
        
    # メールアドレスの重複チェック
    existing_email = await get_user_by_email(db, email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
        
    # ユーザー作成
    hashed_password = get_password_hash(password)
    user = await create_user(db, username=username, email=email, password_hash=hashed_password)
    return user

async def create_auth_tokens(user_id: int) -> Dict[str, str]:
    """
    認証トークンを作成
    :param user_id: ユーザーID
    :return: アクセストークンとリフレッシュトークンを含む辞書
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_id)}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(user_id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str) -> Dict[str, str]:
    """
    リフレッシュトークンを使用してアクセストークンを更新
    :param db: DBセッション
    :param refresh_token: リフレッシュトークン
    :return: 新しいトークンペア
    :raises: HTTPException - トークンが無効な場合
    """
    try:
        # リフレッシュトークンをデコード
        payload = decode_jwt_token(refresh_token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="無効なトークンです",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # 新しいトークンペアを作成
        return await create_auth_tokens(int(user_id))
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なリフレッシュトークンです",
            headers={"WWW-Authenticate": "Bearer"},
        )
