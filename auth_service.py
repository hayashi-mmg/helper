"""
認証サービス（ユーザー認証、トークン発行、パスワードリセット等）
"""
from datetime import timedelta
from typing import Dict, Optional, Tuple
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.core.auth import (verify_password, get_password_hash, create_access_token, 
                          create_refresh_token, decode_jwt_token, ACCESS_TOKEN_EXPIRE_MINUTES)
from app.crud.users import get_user_by_username, get_user_by_email, create_user, update_user_password, user
from app.db.models.user import User, UserRole
from app.database import get_db
import secrets
import logging

# ロガーの設定
logger = logging.getLogger(__name__)

# OAuth2 スキーマのセットアップ
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# パスワードリセットトークン保存用の一時ディクショナリ
# 注: 実運用環境では Redis などを使用すべき
password_reset_tokens = {}

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[User]:
    """
    ユーザー認証
    :param db: DBセッション
    :param username: ユーザー名
    :param password: パスワード
    :return: User or None
    """
    user_obj = await get_user_by_username(db, username)
    if not user_obj or not verify_password(password, user_obj.password_hash):
        return None
    return user_obj

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
    user_obj = await create_user(db, username=username, email=email, password_hash=hashed_password)
    return user_obj

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

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """
    現在のユーザーを取得する依存関数
    :param token: JWTトークン
    :param db: DBセッション
    :return: ユーザーオブジェクト
    :raises: HTTPException - トークンが無効な場合
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証情報が無効です",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # トークンをデコード
        payload = decode_jwt_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
              # ユーザーの取得
        user_obj = await user.get(db, id=int(user_id))
        if user_obj is None:
            raise credentials_exception
        return user_obj
    except JWTError:
        raise credentials_exception

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    現在の管理者ユーザーを取得する依存関数
    :param current_user: 現在のユーザー
    :return: 管理者ユーザー
    :raises: HTTPException - ユーザーが管理者でない場合
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です",
        )
    return current_user

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


async def request_password_reset(db: AsyncSession, email: str) -> Dict[str, str]:
    """
    パスワードリセット要求を処理
    :param db: DBセッション
    :param email: ユーザーのメールアドレス
    :return: メッセージを含む辞書
    """
    # メールアドレスからユーザーを検索
    user_obj = await get_user_by_email(db, email)
    
    # ユーザーが存在しない場合も成功を装う（セキュリティのため）
    if not user_obj:
        logger.info(f"Password reset requested for non-existent email: {email}")
        return {"message": "パスワードリセットの手順をメールで送信しました（存在する場合）"}
    
    # ランダムなリセットトークンを生成
    reset_token = secrets.token_urlsafe(32)
    
    # トークンをユーザーIDと紐付けて保存
    # 本来はRedisなどに有効期限付きで保存するのが望ましい
    password_reset_tokens[reset_token] = user_obj.id
    
    # 実際の環境ではここでメール送信
    logger.info(f"Password reset token generated for user {user_obj.id}: {reset_token}")
    
    return {"message": "パスワードリセットの手順をメールで送信しました"}


async def confirm_password_reset(db: AsyncSession, token: str, new_password: str) -> Dict[str, str]:
    """
    パスワードリセット確認を処理
    :param db: DBセッション
    :param token: リセットトークン
    :param new_password: 新しいパスワード
    :return: メッセージを含む辞書
    :raises: HTTPException - トークンが無効な場合
    """
    # トークンの検証
    user_id = password_reset_tokens.get(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効または期限切れのトークンです"
        )
    
    # パスワードの更新
    hashed_password = get_password_hash(new_password)
    await update_user_password(db, user_id, hashed_password)
    
    # 使用済みトークンを削除
    del password_reset_tokens[token]
    
    return {"message": "パスワードが正常にリセットされました"}
