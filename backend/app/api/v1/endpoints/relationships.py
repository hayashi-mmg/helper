"""
ユーザーとヘルパーの関連付けを管理するAPIエンドポイント
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import crud_user
from app.crud.user_helper_assignment import crud_user_helper_assignment
from app.db.models.user import User, UserRole
from app.db.models.user_helper_assignment import RelationshipStatus
from app.core.auth import get_current_active_user
from app.database import get_db
from app.schemas.user_helper_assignment import (
    UserHelperAssignmentCreate,
    UserHelperAssignmentUpdate,
    UserHelperAssignmentResponse
)

router = APIRouter(prefix="/relationships", tags=["relationships"])


@router.post("/", response_model=UserHelperAssignmentResponse)
async def create_user_helper_relationship(
    relationship: UserHelperAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    ユーザーとヘルパーの関連付けを作成します。
    管理者ユーザーのみ実行可能です。
    """
    # 管理者のみ実行可能
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者のみ実行可能な操作です。"
        )
    
    # ユーザーの存在チェック
    user = await crud_user.get(db, id=relationship.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたユーザーが見つかりません。"
        )
    
    # ヘルパーの存在チェック
    helper = await crud_user.get(db, id=relationship.helper_id)
    if not helper or helper.role != UserRole.HELPER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたヘルパーが見つかりません。"
        )
    
    # 既に関連付けが存在するかチェック
    existing = await crud_user_helper_assignment.get_by_user_and_helper(
        db, user_id=relationship.user_id, helper_id=relationship.helper_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="すでに関連付けが存在します。"
        )
    
    # 関連付けを作成
    assignment = await crud_user_helper_assignment.create(db, obj_in=relationship)
    return assignment


@router.put("/{relationship_id}", response_model=UserHelperAssignmentResponse)
async def update_user_helper_relationship(
    relationship_id: int,
    update_data: UserHelperAssignmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    ユーザーとヘルパーの関連付けを更新します。
    管理者ユーザーのみ実行可能です。
    """
    # 管理者のみ実行可能
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者のみ実行可能な操作です。"
        )
    
    # 関連付けの存在チェック
    existing = await crud_user_helper_assignment.get(db, id=relationship_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された関連付けが見つかりません。"
        )
    
    # 関連付けを更新
    updated = await crud_user_helper_assignment.update(
        db, db_obj=existing, obj_in=update_data
    )
    return updated


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_helper_relationship(
    relationship_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    ユーザーとヘルパーの関連付けを削除します。
    管理者ユーザーのみ実行可能です。
    """
    # 管理者のみ実行可能
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者のみ実行可能な操作です。"
        )
    
    # 関連付けの存在チェック
    existing = await crud_user_helper_assignment.get(db, id=relationship_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された関連付けが見つかりません。"
        )
    
    # 関連付けを削除
    await crud_user_helper_assignment.remove(db, id=relationship_id)
    return None
