"""
ユーザー関連のAPIエンドポイント
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import crud_user
from app.crud.helper_profile import crud_helper_profile
from app.crud.user_helper_assignment import crud_user_helper_assignment
from app.db.models.user import User, UserRole
from app.db.models.user_helper_assignment import RelationshipStatus
from app.core.auth import get_current_active_user
from app.database import get_db
from app.schemas.user import UserResponse
from app.schemas.helper import HelperProfileResponse
from app.schemas.user_helper_assignment import (
    UserHelperAssignmentCreate,
    UserHelperAssignmentUpdate,
    UserHelperAssignmentResponse
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """
    現在のログインユーザーの情報を取得します。
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したIDのユーザー情報を取得します。
    管理者ユーザー、または自分自身の情報のみアクセス可能です。
    """
    # 管理者か自分自身の情報かチェック
    if not (current_user.role == UserRole.ADMIN or current_user.id == user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="アクセス権限がありません。"
        )
    
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません。"
        )
    return user


@router.get("/{user_id}/helpers", response_model=List[UserHelperAssignmentResponse])
async def read_user_helpers(
    user_id: int,
    status: Optional[RelationshipStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したユーザーに関連付けられたヘルパー一覧を取得します。
    管理者ユーザー、または自分自身の情報のみアクセス可能です。
    """
    # 管理者か自分自身の情報かチェック
    if not (current_user.role == UserRole.ADMIN or current_user.id == user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="アクセス権限がありません。"
        )
    
    # ユーザーの存在チェック
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません。"
        )
    
    # 紐付けられたヘルパー一覧を取得
    assignments = await crud_user_helper_assignment.get_helpers_for_user(
        db, user_id=user_id, status=status
    )
    return assignments
