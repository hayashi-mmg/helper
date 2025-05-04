"""
認証関連エンドポイント
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services import auth_service
from app.schemas.auth import UserCreate, UserLogin, Token, RefreshToken
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    ユーザー登録エンドポイント
    :param user_data: 登録ユーザー情報
    :param db: DBセッション
    :return: 作成ユーザー情報
    """
    user = await auth_service.register_user(db, user_data.username, user_data.email, user_data.password)
    return user

@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    ユーザーログインエンドポイント
    :param user_data: ログイン情報
    :param db: DBセッション
    :return: アクセストークンとリフレッシュトークン
    :raises: HTTPException - 認証失敗時
    """
    user = await auth_service.authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return await auth_service.create_auth_tokens(user.id)

@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: RefreshToken,
    db: AsyncSession = Depends(get_db)
):
    """
    トークン更新エンドポイント
    :param token_data: リフレッシュトークン
    :param db: DBセッション
    :return: 新しいアクセストークンとリフレッシュトークン
    :raises: HTTPException - トークンが無効な場合
    """
    return await auth_service.refresh_access_token(db, token_data.refresh_token)
