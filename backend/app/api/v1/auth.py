"""
認証関連エンドポイント
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    username: str,
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ユーザー登録エンドポイント
    :param username: ユーザー名
    :param email: メールアドレス
    :param password: パスワード
    :param db: DBセッション
    :return: 作成ユーザー情報
    """
    user = await auth_service.register_user(db, username, email, password)
    return {"id": user.id, "username": user.username, "email": user.email}
