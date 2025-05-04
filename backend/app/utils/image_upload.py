"""
画像アップロード機能のユーティリティ
"""
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status

from app.config import settings


async def save_uploaded_image(
    upload_file: UploadFile,
    base_dir: Optional[str] = None
) -> Tuple[str, str]:
    """
    アップロードされた画像ファイルを保存する
    
    Args:
        upload_file: アップロードされたファイル
        base_dir: 基本保存ディレクトリ（指定がない場合はconfig.MEDIA_DIRを使用）
        
    Returns:
        保存されたファイルパスとURLパスのタプル
    """
    # MIME TypeとExtensionの検証
    allowed_mime_types = ["image/jpeg", "image/png", "image/gif"]
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif"]
    
    # Content-Typeのチェック
    content_type = upload_file.content_type
    if content_type not in allowed_mime_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"サポートされていない画像形式です: {content_type}。JPG、PNG、GIF形式のみ対応しています。"
        )
    
    # ファイル名と拡張子のチェック
    original_filename = upload_file.filename or ""
    file_ext = os.path.splitext(original_filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"サポートされていないファイル拡張子です: {file_ext}。JPG、PNG、GIF形式のみ対応しています。"
        )
    
    # 保存先ディレクトリの設定
    now = datetime.now()
    year_month = now.strftime("%Y/%m")
    
    if base_dir:
        upload_dir = Path(base_dir) / "feedback" / year_month
    else:
        upload_dir = Path(settings.MEDIA_DIR) / "feedback" / year_month
    
    # ディレクトリが存在しない場合は作成
    os.makedirs(upload_dir, exist_ok=True)
    
    # 一意のファイル名を生成
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = upload_dir / unique_filename
    
    # ファイルの保存
    try:
        contents = await upload_file.read()
        
        # ファイルサイズのチェック (10MB制限)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(contents) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"ファイルサイズが大きすぎます。10MB以下にしてください。"
            )
        
        # ファイル書き込み
        with open(file_path, "wb") as f:
            f.write(contents)
    
        # 相対URLパスを作成 (/media/feedback/2023/05/xxxxxx.jpg)
        url_path = f"/media/feedback/{year_month}/{unique_filename}"
        
        return str(file_path), url_path
        
    except Exception as e:
        # エラーハンドリング
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"画像のアップロード中にエラーが発生しました: {str(e)}"
        )


async def delete_uploaded_image(image_url: str) -> None:
    """
    アップロードされた画像を削除する
    
    Args:
        image_url: 画像のURLパス
    """
    # URLパスからファイルパスを復元
    if not image_url or not image_url.startswith("/media/"):
        return
    
    relative_path = image_url.replace("/media/", "", 1)
    file_path = Path(settings.MEDIA_DIR) / relative_path
    
    # ファイルが存在する場合のみ削除
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception:
            # 削除に失敗しても処理は続ける
            pass
