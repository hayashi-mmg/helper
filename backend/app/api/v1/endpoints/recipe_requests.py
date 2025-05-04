"""
料理リクエスト関連のAPIエンドポイント
"""
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.recipe_request import crud_recipe_request
from app.crud.users import crud_user
from app.db.models.user import User, UserRole
from app.db.models.recipe_request import RecipeRequestStatus
from app.core.auth import get_current_active_user
from app.database import get_db
from app.schemas.recipe_request import (
    RecipeRequestCreate,
    RecipeRequestUpdate,
    RecipeRequestResponse
)

router = APIRouter(prefix="/recipe-requests", tags=["recipe-requests"])


@router.post("/", response_model=RecipeRequestResponse)
async def create_recipe_request(
    recipe_request: RecipeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    新しい料理リクエストを作成します。
    一般ユーザーは自分のリクエストのみ作成可能です。
    管理者は任意のユーザーのリクエストを作成可能です。
    """
    # リクエスト対象ユーザーの存在確認
    target_user = await crud_user.get(db, id=recipe_request.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたユーザーが見つかりません。"
        )
    
    # 権限チェック：一般ユーザーは自分のリクエストのみ作成可能
    if current_user.role != UserRole.ADMIN and current_user.id != recipe_request.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="他のユーザーのリクエストは作成できません。"
        )
    
    # リクエスト作成
    db_recipe_request = await crud_recipe_request.create(db, obj_in=recipe_request)
    return db_recipe_request


@router.get("/", response_model=List[RecipeRequestResponse])
async def read_recipe_requests(
    status: Optional[RecipeRequestStatus] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    料理リクエストの一覧を取得します。
    管理者はすべてのリクエストを取得できます。
    一般ユーザーは自分のリクエストのみ取得できます。
    """
    # 管理者は全ユーザーのリクエストを取得可能
    if current_user.role == UserRole.ADMIN:
        recipe_requests = await crud_recipe_request.search(
            db,
            status=status,
            start_date=start_date,
            end_date=end_date,
            search_term=search,
            skip=skip,
            limit=limit
        )
    else:
        # 一般ユーザーは自分のリクエストのみ取得可能
        recipe_requests = await crud_recipe_request.search(
            db,
            user_id=current_user.id,
            status=status,
            start_date=start_date,
            end_date=end_date,
            search_term=search,
            skip=skip,
            limit=limit
        )
    
    return recipe_requests


@router.get("/{request_id}", response_model=RecipeRequestResponse)
async def read_recipe_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDの料理リクエストを取得します。
    管理者はすべてのリクエストを取得できます。
    一般ユーザーは自分のリクエストのみ取得できます。
    """
    recipe_request = await crud_recipe_request.get(db, id=request_id)
    if not recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="料理リクエストが見つかりません。"
        )
    
    # 権限チェック：管理者または自分のリクエストのみアクセス可能
    if current_user.role != UserRole.ADMIN and current_user.id != recipe_request.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このリクエストにアクセスする権限がありません。"
        )
    
    return recipe_request


@router.put("/{request_id}", response_model=RecipeRequestResponse)
async def update_recipe_request(
    request_id: int,
    recipe_request_update: RecipeRequestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDの料理リクエストを更新します。
    管理者はすべてのリクエストを更新できます。
    一般ユーザーは自分のリクエストのみ更新できます。
    """
    db_recipe_request = await crud_recipe_request.get(db, id=request_id)
    if not db_recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="料理リクエストが見つかりません。"
        )
    
    # 権限チェック：管理者または自分のリクエストのみ更新可能
    if current_user.role != UserRole.ADMIN and current_user.id != db_recipe_request.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このリクエストを更新する権限がありません。"
        )
    
    # リクエスト更新
    updated_recipe_request = await crud_recipe_request.update(
        db, db_obj=db_recipe_request, obj_in=recipe_request_update
    )
    return updated_recipe_request


@router.patch("/{request_id}/status", response_model=RecipeRequestResponse)
async def update_recipe_request_status(
    request_id: int,
    status: RecipeRequestStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDの料理リクエストのステータスを更新します。
    管理者とヘルパーはすべてのリクエストのステータスを更新できます。
    一般ユーザーは自分のリクエストのみキャンセル可能です。
    """
    db_recipe_request = await crud_recipe_request.get(db, id=request_id)
    if not db_recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="料理リクエストが見つかりません。"
        )
    
    # 権限チェック
    is_admin_or_helper = current_user.role in [UserRole.ADMIN, UserRole.HELPER]
    is_owner = current_user.id == db_recipe_request.user_id
    
    # 一般ユーザーは自分のリクエストのみキャンセル可能
    if not is_admin_or_helper and (not is_owner or status != RecipeRequestStatus.CANCELLED):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このリクエストのステータスを変更する権限がありません。"
        )
    
    # ステータス更新
    update_data = {"status": status}
    updated_recipe_request = await crud_recipe_request.update(
        db, db_obj=db_recipe_request, obj_in=update_data
    )
    return updated_recipe_request


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたIDの料理リクエストを削除します。
    管理者はすべてのリクエストを削除できます。
    一般ユーザーはPENDINGステータスの自分のリクエストのみ削除できます。
    """
    db_recipe_request = await crud_recipe_request.get(db, id=request_id)
    if not db_recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="料理リクエストが見つかりません。"
        )
    
    # 権限チェック
    is_admin = current_user.role == UserRole.ADMIN
    is_owner = current_user.id == db_recipe_request.user_id
    is_pending = db_recipe_request.status == RecipeRequestStatus.PENDING
    
    # 管理者でなければ、自分のPENDINGリクエストのみ削除可能
    if not is_admin and (not is_owner or not is_pending):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このリクエストを削除する権限がありません。"
        )
    
    # リクエスト削除
    await crud_recipe_request.remove(db, id=request_id)
    return None


@router.get("/users/{user_id}", response_model=List[RecipeRequestResponse])
async def read_user_recipe_requests(
    user_id: int,
    status: Optional[RecipeRequestStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定されたユーザーの料理リクエスト一覧を取得します。
    管理者とヘルパーはすべてのユーザーのリクエストを取得できます。
    一般ユーザーは自分のリクエストのみ取得できます。
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
            detail="このユーザーのリクエストを閲覧する権限がありません。"
        )
    
    # リクエスト一覧取得
    recipe_requests = await crud_recipe_request.search(
        db, user_id=user_id, status=status, skip=skip, limit=limit
    )
    
    return recipe_requests
