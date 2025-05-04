"""
QRコード管理のAPIエンドポイント
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
from datetime import datetime
from urllib.parse import urljoin

from app.core.auth import get_current_active_user
from app.database import get_db
from app.db.models.user import User, UserRole
from app.db.models.qrcode import QRCode, QRCodeTargetType
from app.schemas.qrcode import (
    QRCodeResponse,
    QRCodeRequestCreate,
    QRCodeBatchCreate
)
from app.crud.qrcode import qrcode as crud_qrcode
from app.utils.qrcode_generator import generate_qrcode, get_qrcode_storage_path
from app.config import settings

router = APIRouter(prefix="/qrcodes", tags=["qrcodes"])


@router.post("/", response_model=QRCodeResponse)
async def create_qrcode(
    qrcode_data: QRCodeRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    新しいQRコードを生成

    Parameters:
    - target_type: 対象タイプ（RECIPE, TASK, FEEDBACK_FORM など）
    - target_id: 対象ID
    - title: QRコードのタイトル
    - expire_in: 有効期限（秒）（オプション）

    Returns:
    - 生成されたQRコード情報
    """
    # 対象URLの生成
    base_url = settings.base_url
    
    if qrcode_data.target_type == QRCodeTargetType.RECIPE:
        target_url = f"{base_url}/api/v1/recipe-requests/{qrcode_data.target_id}"
    elif qrcode_data.target_type == QRCodeTargetType.TASK:
        target_url = f"{base_url}/api/v1/tasks/{qrcode_data.target_id}"
    elif qrcode_data.target_type == QRCodeTargetType.FEEDBACK_FORM:
        target_url = f"{base_url}/api/v1/feedback/form/{qrcode_data.target_id}"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="サポートされていない対象タイプです"
        )
    
    # QRコードの作成
    qrcode_create = qrcode_data.to_qrcode_create(target_url, current_user.id)
    db_qrcode = await crud_qrcode.create(db, obj_in=qrcode_create)
    
    # QRコード画像の生成と保存
    file_path = get_qrcode_storage_path(db_qrcode.id)
    base64_image, saved_path = generate_qrcode(target_url, 300, file_path)
    
    # 画像パスの更新
    db_qrcode.image_path = saved_path
    await db.commit()
    await db.refresh(db_qrcode)
    
    # レスポンス用に画像URLを設定
    response = QRCodeResponse.model_validate(db_qrcode)
    response.image_url = f"{base_url}/api/v1/qrcodes/{db_qrcode.id}/image"
    
    return response


@router.get("/", response_model=List[QRCodeResponse])
async def get_qrcodes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    QRコード一覧を取得
    
    管理者は全てのQRコードを取得できます。
    一般ユーザーは自分が作成したQRコードのみ取得できます。
    """
    if current_user.role == UserRole.ADMIN:
        # 管理者は全てのQRコードを取得
        qrcodes = await crud_qrcode.get_multi(db, skip=skip, limit=limit)
    else:
        # 一般ユーザーは自分のQRコードのみ取得
        qrcodes = await crud_qrcode.get_by_creator(
            db, created_by=current_user.id, skip=skip, limit=limit
        )
    
    # 各QRコードにimageURLを追加
    base_url = settings.base_url
    for qrcode in qrcodes:
        qrcode.image_url = f"{base_url}/api/v1/qrcodes/{qrcode.id}/image"
    
    return qrcodes


@router.get("/{qrcode_id}", response_model=QRCodeResponse)
async def get_qrcode(
    qrcode_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したIDのQRコードを取得
    
    管理者は全てのQRコードを取得できます。
    一般ユーザーは自分が作成したQRコードのみ取得できます。
    """
    qrcode = await crud_qrcode.get(db, id=qrcode_id)
    if not qrcode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたQRコードが見つかりません"
        )
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and qrcode.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このQRコードにアクセスする権限がありません"
        )
    
    # レスポンス用に画像URLを設定
    qrcode.image_url = f"{settings.base_url}/api/v1/qrcodes/{qrcode.id}/image"
    
    return qrcode


@router.get("/{qrcode_id}/image")
async def get_qrcode_image(
    qrcode_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    指定したIDのQRコード画像を取得
    
    これは認証なしでアクセス可能なエンドポイントです。
    QRコードを広く利用可能にするため、認証チェックはありません。
    ただし、有効期限のチェックは行います。
    """
    qrcode = await crud_qrcode.get(db, id=qrcode_id)
    if not qrcode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたQRコードが見つかりません"
        )
    
    # 有効期限チェック
    if qrcode.expire_at and qrcode.expire_at < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="このQRコードは有効期限が切れています"
        )
    
    # 画像パスが存在するか確認
    if not qrcode.image_path or not os.path.exists(qrcode.image_path):
        # もし画像がなければ、再生成を試みる
        file_path = get_qrcode_storage_path(qrcode_id)
        base64_image, saved_path = generate_qrcode(qrcode.url, 300, file_path)
        
        if not saved_path or not os.path.exists(saved_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QRコード画像が見つかりません"
            )
        
        # パスを更新
        qrcode.image_path = saved_path
        await db.commit()
    
    # アクセスカウンターのインクリメント
    await crud_qrcode.increment_access_count(db, qrcode_id=qrcode_id)
    
    return FileResponse(qrcode.image_path)


@router.delete("/{qrcode_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_qrcode(
    qrcode_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    指定したIDのQRコードを削除
    
    管理者は全てのQRコードを削除できます。
    一般ユーザーは自分が作成したQRコードのみ削除できます。
    """
    qrcode = await crud_qrcode.get(db, id=qrcode_id)
    if not qrcode:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定されたQRコードが見つかりません"
        )
    
    # 権限チェック
    if current_user.role != UserRole.ADMIN and qrcode.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このQRコードを削除する権限がありません"
        )
    
    # QRコード画像の削除
    if qrcode.image_path and os.path.exists(qrcode.image_path):
        try:
            os.remove(qrcode.image_path)
        except OSError:
            # ファイル削除に失敗した場合も続行
            pass
    
    # データベースからQRコードを削除
    await crud_qrcode.remove(db, id=qrcode_id)
    
    return None


@router.post("/batch", response_model=List[QRCodeResponse])
async def create_qrcodes_batch(
    qrcodes_data: QRCodeBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    複数のQRコードを一度に生成
    
    Parameters:
    - qrcodes: QRコード作成データのリスト
    
    Returns:
    - 生成されたQRコード情報のリスト
    """
    results = []
    base_url = settings.base_url
    
    for qrcode_item in qrcodes_data.qrcodes:
        # 対象URLの生成
        if qrcode_item.target_type == QRCodeTargetType.RECIPE:
            target_url = f"{base_url}/api/v1/recipe-requests/{qrcode_item.target_id}"
        elif qrcode_item.target_type == QRCodeTargetType.TASK:
            target_url = f"{base_url}/api/v1/tasks/{qrcode_item.target_id}"
        elif qrcode_item.target_type == QRCodeTargetType.FEEDBACK_FORM:
            target_url = f"{base_url}/api/v1/feedback/form/{qrcode_item.target_id}"
        else:
            continue  # サポートされていないタイプはスキップ
        
        # QRコードの作成
        qrcode_create = qrcode_item.to_qrcode_create(target_url, current_user.id)
        db_qrcode = await crud_qrcode.create(db, obj_in=qrcode_create)
        
        # QRコード画像の生成と保存
        file_path = get_qrcode_storage_path(db_qrcode.id)
        base64_image, saved_path = generate_qrcode(target_url, 300, file_path)
        
        # 画像パスの更新
        db_qrcode.image_path = saved_path
        await db.commit()
        await db.refresh(db_qrcode)
        
        # レスポンス用に画像URLを設定
        response = QRCodeResponse.model_validate(db_qrcode)
        response.image_url = f"{base_url}/api/v1/qrcodes/{db_qrcode.id}/image"
        results.append(response)
    
    return results
