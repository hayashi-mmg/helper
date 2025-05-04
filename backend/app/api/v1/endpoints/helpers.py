"""
ヘルパー関連のAPIエンドポイント
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
from app.schemas.helper import HelperProfileResponse, HelperProfileUpdate
from app.schemas.user import UserResponse
from app.schemas.user_helper_assignment import (
    UserHelperAssignmentCreate,
    UserHelperAssignmentUpdate,
    UserHelperAssignmentResponse
)

router = APIRouter(prefix="/helpers", tags=["helpers"])


@router.get("/me", response_model=HelperProfileResponse)
async def read_helper_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    現在のログインユーザーのヘルパープロファイル情報を取得します。
    """
    # ヘルパーロールのみアクセス可能
    if current_user.role != UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ヘルパーユーザーのみアクセス可能です。"
        )
    
    helper_profile = await crud_helper_profile.get_by_user_id(db, user_id=current_user.id)
    if not helper_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ヘルパープロファイルが見つかりません。"
        )
    return helper_profile


@router.get("/{helper_id}", response_model=HelperProfileResponse)
async def read_helper(
    helper_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したIDのヘルパー情報を取得します。
    管理者、ヘルパー自身、またはそのヘルパーに関連付けられたユーザーのみアクセス可能です。
    """
    # ヘルパーの存在チェック
    helper = await crud_user.get(db, id=helper_id)
    if not helper or helper.role != UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ヘルパーが見つかりません。"
        )
    
    # アクセス権限チェック
    is_admin = current_user.role == UserRole.ADMIN
    is_self = current_user.id == helper_id
    
    # 関連付けられたユーザーかチェック
    is_related = False
    if not (is_admin or is_self):
        assignment = await crud_user_helper_assignment.get_by_user_and_helper(
            db, user_id=current_user.id, helper_id=helper_id
        )
        is_related = assignment is not None and assignment.status == RelationshipStatus.ACTIVE
    
    if not (is_admin or is_self or is_related):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="アクセス権限がありません。"
        )
    
    helper_profile = await crud_helper_profile.get_by_user_id(db, user_id=helper_id)
    if not helper_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ヘルパープロファイルが見つかりません。"
        )
    return helper_profile


@router.get("/{helper_id}/users", response_model=List[UserHelperAssignmentResponse])
async def read_helper_users(
    helper_id: int,
    status: Optional[RelationshipStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したヘルパーに関連付けられたユーザー一覧を取得します。
    管理者ユーザー、またはヘルパー自身のみアクセス可能です。
    """
    # ヘルパーの存在チェック
    helper = await crud_user.get(db, id=helper_id)
    if not helper or helper.role != UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ヘルパーが見つかりません。"
        )
    
    # 管理者またはヘルパー自身のみアクセス可能
    if not (current_user.role == UserRole.ADMIN or current_user.id == helper_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="アクセス権限がありません。"
        )
    
    # 紐付けられたユーザー一覧を取得
    assignments = await crud_user_helper_assignment.get_users_for_helper(
        db, helper_id=helper_id, status=status
    )
    return assignments
