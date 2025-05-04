"""
料理リクエスト関連のAPIエンドポイント
"""
from typing import List, Optional, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.recipe_request import crud_recipe_request
from app.crud.users import crud_user
from app.crud.feedback import feedback as crud_feedback
from app.db.models.user import User, UserRole
from app.db.models.recipe_request import RecipeRequestStatus
from app.core.auth import get_current_active_user
from app.database import get_db
from app.services.recipe_parser import RecipeParserFactory, RecipeUrlValidator
from app.schemas.recipe_request import (
    RecipeRequestCreate,
    RecipeRequestUpdate,
    RecipeRequestResponse
)
from app.schemas.feedback import FeedbackResponse

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
    
    # URLが指定されている場合、自動で解析
    if recipe_request.recipe_url and RecipeUrlValidator.validate(recipe_request.recipe_url):
        try:
            parser = RecipeParserFactory.get_parser(recipe_request.recipe_url)
            recipe_data = await parser.parse(recipe_request.recipe_url)
            
            # タイトルが未設定の場合は、取得した情報から設定
            if recipe_request.title == "レシピリクエスト" or not recipe_request.title:
                recipe_request.title = recipe_data["title"]
            
            # 内容が未設定の場合は、取得した情報から構成
            if not recipe_request.recipe_content:
                content = f"# {recipe_data['title']}\n\n"
                
                if recipe_data.get("cooking_time"):
                    content += f"調理時間: {recipe_data['cooking_time']}\n\n"
                
                content += "## 材料\n"
                for ing in recipe_data.get("ingredients", []):
                    content += f"- {ing['name']}: {ing['quantity']}\n"
                
                content += "\n## 手順\n"
                for step in recipe_data.get("steps", []):
                    content += f"{step['number']}. {step['text']}\n"
                
                content += f"\n\n元のレシピ: {recipe_request.recipe_url}"
                recipe_request.recipe_content = content
        except Exception as e:
            # 解析エラーは無視して続行
            pass
    
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


@router.post("/parse-url", response_model=Dict[str, Any])
async def parse_recipe_url(
    url: str = Body(..., embed=True),
    current_user: User = Depends(get_current_active_user)
):
    """
    レシピサイトのURLを解析し、構造化されたレシピ情報を返します。
    
    現在サポートされているサイト:
    - クックパッド
    - 楽天レシピ
    - エキサイトレシピ
    
    Args:
        url: レシピサイトのURL
    
    Returns:
        構造化されたレシピ情報
    """
    # URLのバリデーション
    if not RecipeUrlValidator.validate(url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効なURLです。正しいレシピサイトのURLを入力してください。"
        )
    
    try:
        # 適切なパーサーの取得と解析実行
        parser = RecipeParserFactory.get_parser(url)
        recipe_data = await parser.parse(url)
        
        return recipe_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"レシピの解析中にエラーが発生しました: {str(e)}"
        )


@router.post("/from-url", response_model=RecipeRequestResponse)
async def create_recipe_request_from_url(
    url: str = Body(...),
    scheduled_date: Optional[date] = Body(None),
    user_id: Optional[int] = Body(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    レシピURLから直接料理リクエストを作成します。
    URLを解析し、レシピ情報を自動的に抽出してリクエストを作成します。
    
    Args:
        url: レシピサイトのURL
        scheduled_date: 予定日（オプション）
        user_id: リクエスト対象のユーザーID（管理者のみ指定可能、未指定時は自分自身）
    
    Returns:
        作成された料理リクエスト
    """
    # URLのバリデーション
    if not RecipeUrlValidator.validate(url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効なURLです。正しいレシピサイトのURLを入力してください。"
        )
    
    # ユーザーIDの設定（管理者は他ユーザーも指定可能）
    target_user_id = current_user.id
    if user_id is not None:
        if current_user.role == UserRole.ADMIN:
            target_user = await crud_user.get(db, id=user_id)
            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="指定されたユーザーが見つかりません。"
                )
            target_user_id = user_id
        elif user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="他のユーザーのリクエストは作成できません。"
            )
    
    try:
        # レシピ情報の解析
        parser = RecipeParserFactory.get_parser(url)
        recipe_data = await parser.parse(url)
        
        # 料理リクエスト作成データの構成
        content = f"# {recipe_data['title']}\n\n"
        
        if recipe_data.get("cooking_time"):
            content += f"調理時間: {recipe_data['cooking_time']}\n\n"
        
        content += "## 材料\n"
        for ing in recipe_data.get("ingredients", []):
            content += f"- {ing['name']}: {ing['quantity']}\n"
        
        content += "\n## 手順\n"
        for step in recipe_data.get("steps", []):
            content += f"{step['number']}. {step['text']}\n"
        
        content += f"\n\n元のレシピ: {url}"
        
        # リクエストオブジェクト作成
        recipe_request = RecipeRequestCreate(
            user_id=target_user_id,
            title=recipe_data["title"],
            description=f"「{recipe_data['title']}」の調理リクエスト",
            recipe_url=url,
            recipe_content=content,
            scheduled_date=scheduled_date,
            status=RecipeRequestStatus.PENDING
        )
        
        # DBに保存
        db_recipe_request = await crud_recipe_request.create(db, obj_in=recipe_request)
        return db_recipe_request
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"レシピの解析と保存中にエラーが発生しました: {str(e)}"
        )


@router.get("/{request_id}/feedback", response_model=List[FeedbackResponse])
async def read_recipe_request_feedback(
    request_id: int = Path(..., title="料理リクエストID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    特定の料理リクエストに関連するフィードバック一覧を取得します。
    一般ユーザーは自分のリクエストに関連するフィードバックのみ閲覧可能です。
    ヘルパーは担当ユーザーのフィードバックを閲覧可能です。
    管理者はすべてのフィードバックを閲覧可能です。
    """
    # リクエストの存在確認
    recipe_request = await crud_recipe_request.get(db, id=request_id)
    if not recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された料理リクエストが見つかりません。"
        )
    
    # 管理者は全てのフィードバックにアクセス可能
    if current_user.role == UserRole.ADMIN:
        return await crud_feedback.get_by_recipe_request(db, recipe_request_id=request_id)
    
    # ヘルパーは担当ユーザーのフィードバックにアクセス可能
    # TODO: ヘルパーの担当ユーザー確認処理
    
    # 一般ユーザーは自分のリクエストに関連するフィードバックのみアクセス可能
    if recipe_request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このリクエストに関連するフィードバックにアクセスする権限がありません。"
        )
    
    return await crud_feedback.get_by_recipe_request(db, recipe_request_id=request_id)
