"""
フィードバック関連のAPIエンドポイント
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, Path, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.feedback import feedback as crud_feedback
from app.crud.helper_response import helper_response as crud_helper_response
from app.crud.recipe_request import crud_recipe_request
from app.crud.users import crud_user
from app.db.models.user import User, UserRole
from app.core.auth import get_current_active_user
from app.database import get_db
from app.utils.image_upload import save_uploaded_image, delete_uploaded_image
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackUpdate,
    FeedbackResponse
)
from app.schemas.helper_response import (
    HelperResponseCreate,
    HelperResponseUpdate,
    HelperResponseResponse
)

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackResponse)
async def create_feedback(
    feedback_data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    新しいフィードバックを作成します。
    一般ユーザーは自分のフィードバックのみ作成可能です。
    管理者は任意のユーザーのフィードバックを作成可能です。
    """
    # リクエストの存在確認
    recipe_request = await crud_recipe_request.get(db, id=feedback_data.recipe_request_id)
    if not recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された料理リクエストが見つかりません。"
        )
    
    # 権限チェック：一般ユーザーは自分のフィードバックのみ作成可能
    if current_user.role != UserRole.ADMIN and current_user.id != feedback_data.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="他のユーザーのフィードバックは作成できません。"
        )
    
    # 既存のフィードバックがあるか確認
    existing_feedback = await crud_feedback.get_latest_by_recipe_request(
        db, recipe_request_id=feedback_data.recipe_request_id
    )
    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="この料理リクエストに対するフィードバックは既に存在します。更新する場合はPUTメソッドを使用してください。"
        )
    
    # フィードバック作成
    new_feedback = await crud_feedback.create(db, obj_in=feedback_data)
    return new_feedback


@router.get("/", response_model=List[FeedbackResponse])
async def read_feedbacks(
    recipe_request_id: Optional[int] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    フィードバック一覧を取得します。
    クエリパラメータでレシピリクエストIDまたはユーザーIDでフィルタリング可能です。
    一般ユーザーは自分のフィードバックのみ閲覧可能です。
    ヘルパーは担当ユーザーのフィードバックを閲覧可能です。
    管理者はすべてのフィードバックを閲覧可能です。
    """
    # 管理者ユーザーの場合、全ての情報が見える
    if current_user.role == UserRole.ADMIN:
        if recipe_request_id:
            return await crud_feedback.get_by_recipe_request(db, recipe_request_id=recipe_request_id)
        elif user_id:
            return await crud_feedback.get_by_user(db, user_id=user_id, skip=skip, limit=limit)
        else:
            return await crud_feedback.get_multi(db, skip=skip, limit=limit)
    
    # ヘルパーユーザーの場合、担当ユーザーの情報が見える
    # TODO: ヘルパーの担当ユーザー確認処理
    
    # 一般ユーザーの場合、自分の情報のみ
    if user_id and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="他のユーザーのフィードバック一覧は閲覧できません。"
        )
    
    return await crud_feedback.get_by_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def read_feedback(
    feedback_id: int = Path(..., title="フィードバックID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    特定のフィードバックを取得します。
    一般ユーザーは自分のフィードバックのみ閲覧可能です。
    ヘルパーは担当ユーザーのフィードバックを閲覧可能です。
    管理者はすべてのフィードバックを閲覧可能です。
    """
    feedback = await crud_feedback.get(db, id=feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="フィードバックが見つかりません。"
        )
    
    # 管理者は全てのフィードバックにアクセス可能
    if current_user.role == UserRole.ADMIN:
        return feedback
    
    # ヘルパーは担当ユーザーのフィードバックにアクセス可能
    # TODO: ヘルパーの担当ユーザー確認処理
    
    # 一般ユーザーは自分のフィードバックのみアクセス可能
    if feedback.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このフィードバックにアクセスする権限がありません。"
        )
    
    return feedback


@router.put("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_data: FeedbackUpdate,
    feedback_id: int = Path(..., title="フィードバックID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    特定のフィードバックを更新します。
    一般ユーザーは自分のフィードバックのみ更新可能です。
    管理者はすべてのフィードバックを更新可能です。
    """
    feedback = await crud_feedback.get(db, id=feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="フィードバックが見つかりません。"
        )
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and feedback.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このフィードバックを更新する権限がありません。"
        )
    
    updated_feedback = await crud_feedback.update(db, db_obj=feedback, obj_in=feedback_data)
    return updated_feedback


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: int = Path(..., title="フィードバックID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    特定のフィードバックを削除します。
    一般ユーザーは自分のフィードバックのみ削除可能です。
    管理者はすべてのフィードバックを削除可能です。
    """
    feedback = await crud_feedback.get(db, id=feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="フィードバックが見つかりません。"
        )
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and feedback.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このフィードバックを削除する権限がありません。"
        )
    
    await crud_feedback.delete(db, id=feedback_id)
    return None


@router.post("/{feedback_id}/response", response_model=HelperResponseResponse)
async def create_helper_response(
    response_data: HelperResponseCreate,
    feedback_id: int = Path(..., title="フィードバックID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    フィードバックに対するヘルパーの返信を作成します。
    ヘルパーまたは管理者のみ実行可能です。
    """
    # フィードバックの存在確認
    feedback = await crud_feedback.get(db, id=feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたフィードバックが見つかりません。"
        )
    
    # 権限チェック
    if current_user.role not in [UserRole.ADMIN, UserRole.HELPER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ヘルパーまたは管理者のみがこの操作を実行できます。"
        )
    
    # 既存の返信があるか確認
    existing_responses = await crud_helper_response.get_by_feedback(db, feedback_id=feedback_id)
    if existing_responses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="このフィードバックに対する返信は既に存在します。更新する場合はPUTメソッドを使用してください。"
        )
    
    # レスポンスデータの整合性確認
    if response_data.feedback_id != feedback_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="リクエストデータのフィードバックIDがパスパラメータと一致しません。"
        )
    
    # ヘルパーIDの設定（現在のユーザーID）
    response_data.helper_id = current_user.id
    
    # 返信作成
    new_response = await crud_helper_response.create(db, obj_in=response_data)
    return new_response


@router.put("/{feedback_id}/response", response_model=HelperResponseResponse)
async def update_helper_response(
    response_data: HelperResponseUpdate,
    feedback_id: int = Path(..., title="フィードバックID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    フィードバックに対するヘルパーの返信を更新します。
    返信を作成したヘルパーまたは管理者のみ実行可能です。
    """
    # 返信の存在確認
    existing_responses = await crud_helper_response.get_by_feedback(db, feedback_id=feedback_id)
    if not existing_responses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="このフィードバックに対する返信が見つかりません。"
        )
    
    response = existing_responses[0]  # 最初の返信を取得
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and response.helper_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この返信を更新する権限がありません。"
        )
    
    # 返信更新
    updated_response = await crud_helper_response.update(db, db_obj=response, obj_in=response_data)
    return updated_response


@router.post("/{feedback_id}/upload-image", response_model=FeedbackResponse)
async def upload_feedback_image(
    feedback_id: int = Path(..., title="フィードバックID"),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    フィードバックに画像をアップロードします。
    一般ユーザーは自分のフィードバックのみにアップロード可能です。
    管理者はすべてのフィードバックに画像をアップロード可能です。
    """
    # フィードバックの存在確認
    feedback = await crud_feedback.get(db, id=feedback_id)
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="フィードバックが見つかりません。"
        )
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and feedback.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このフィードバックに画像をアップロードする権限がありません。"
        )
    
    # 既存の画像があれば削除
    if feedback.photo_url:
        await delete_uploaded_image(feedback.photo_url)
    
    # 画像のアップロード
    _, image_url = await save_uploaded_image(image)
    
    # フィードバックの更新
    update_data = FeedbackUpdate(photo_url=image_url)
    updated_feedback = await crud_feedback.update(db, db_obj=feedback, obj_in=update_data)
    
    return updated_feedback
