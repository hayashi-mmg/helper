"""
お願いごと関連のAPIエンドポイント
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.task import crud_task
from app.crud.users import crud_user
from app.db.models.user import User, UserRole
from app.db.models.task import TaskStatus
from app.core.auth import get_current_active_user
from app.database import get_db
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    新しいお願いごとを作成します。
    一般ユーザーは自分のお願いごとのみ作成可能です。
    管理者は任意のユーザーのお願いごとを作成可能です。
    """
    # リクエスト対象ユーザーの存在確認
    target_user = await crud_user.get(db, id=task.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたユーザーが見つかりません。"
        )
    
    # 権限チェック：一般ユーザーは自分のリクエストのみ作成可能
    if current_user.role != UserRole.ADMIN and current_user.id != task.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="他のユーザーのお願いごとは作成できません。"
        )
    
    # お願いごと作成
    db_task = await crud_task.create(db, obj_in=task)
    return db_task


@router.get("/", response_model=List[TaskResponse])
async def read_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[int] = Query(None, ge=1, le=5),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    お願いごとの一覧を取得します。
    管理者はすべてのお願いごとを取得できます。
    一般ユーザーは自分のお願いごとのみ取得できます。
    """
    # 管理者は全ユーザーのお願いごとを取得可能
    if current_user.role == UserRole.ADMIN:
        tasks = await crud_task.search(
            db,
            status=status,
            priority=priority,
            start_date=start_date,
            end_date=end_date,
            search_term=search,
            skip=skip,
            limit=limit
        )
    else:
        # 一般ユーザーは自分のお願いごとのみ取得可能
        tasks = await crud_task.search(
            db,
            user_id=current_user.id,
            status=status,
            priority=priority,
            start_date=start_date,
            end_date=end_date,
            search_term=search,
            skip=skip,
            limit=limit
        )
    
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def read_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDのお願いごとを取得します。
    管理者はすべてのお願いごとを取得できます。
    一般ユーザーは自分のお願いごとのみ取得できます。
    """
    task = await crud_task.get(db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="お願いごとが見つかりません。"
        )
    
    # 権限チェック：管理者または自分のお願いごとのみアクセス可能
    if current_user.role != UserRole.ADMIN and current_user.id != task.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このお願いごとにアクセスする権限がありません。"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDのお願いごとを更新します。
    管理者はすべてのお願いごとを更新できます。
    一般ユーザーは自分のお願いごとのみ更新できます。
    """
    db_task = await crud_task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="お願いごとが見つかりません。"
        )
    
    # 権限チェック：管理者または自分のお願いごとのみ更新可能
    if current_user.role != UserRole.ADMIN and current_user.id != db_task.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このお願いごとを更新する権限がありません。"
        )
    
    # お願いごと更新
    updated_task = await crud_task.update(
        db, db_obj=db_task, obj_in=task_update
    )
    return updated_task


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status: TaskStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDのお願いごとのステータスを更新します。
    管理者とヘルパーはすべてのお願いごとのステータスを更新できます。
    一般ユーザーは自分のお願いごとのみキャンセル可能です。
    """
    db_task = await crud_task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="お願いごとが見つかりません。"
        )
    
    # 権限チェック
    is_admin_or_helper = current_user.role in [UserRole.ADMIN, UserRole.HELPER]
    is_owner = current_user.id == db_task.user_id
    
    # 一般ユーザーは自分のお願いごとのみキャンセル可能
    if not is_admin_or_helper and (not is_owner or status != TaskStatus.CANCELLED):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このお願いごとのステータスを変更する権限がありません。"
        )
    
    # ステータス更新
    update_data = {"status": status}
    updated_task = await crud_task.update(
        db, db_obj=db_task, obj_in=update_data
    )
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDのお願いごとを削除します。
    管理者はすべてのお願いごとを削除できます。
    一般ユーザーはPENDINGステータスの自分のお願いごとのみ削除できます。
    """
    db_task = await crud_task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="お願いごとが見つかりません。"
        )
    
    # 権限チェック
    is_admin = current_user.role == UserRole.ADMIN
    is_owner = current_user.id == db_task.user_id
    is_pending = db_task.status == TaskStatus.PENDING
    
    # 管理者でなければ、自分のPENDINGお願いごとのみ削除可能
    if not is_admin and (not is_owner or not is_pending):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このお願いごとを削除する権限がありません。"
        )
    
    # お願いごと削除
    await crud_task.remove(db, id=task_id)
    return None


@router.get("/users/{user_id}", response_model=List[TaskResponse])
async def read_user_tasks(
    user_id: int,
    status: Optional[TaskStatus] = None,
    priority: Optional[int] = Query(None, ge=1, le=5),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたユーザーのお願いごと一覧を取得します。
    管理者とヘルパーはすべてのユーザーのお願いごとを取得できます。
    一般ユーザーは自分のお願いごとのみ取得できます。
    """
    # ユーザーの存在確認
    user = await crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたユーザーが見つかりません。"
        )
    
    # 権限チェック
    is_admin_or_helper = current_user.role in [UserRole.ADMIN, UserRole.HELPER]
    is_owner = current_user.id == user_id
    
    if not is_admin_or_helper and not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このユーザーのお願いごとを閲覧する権限がありません。"
        )
    
    # お願いごと一覧取得
    tasks = await crud_task.search(
        db, user_id=user_id, status=status, priority=priority, skip=skip, limit=limit
    )
    
    return tasks
