"""
QRコード生成ユーティリティ

このモジュールでは、URLからQRコードを生成し、
画像として保存または Base64 エンコード文字列として返す機能を提供します。
"""
import qrcode
from io import BytesIO
import base64
from datetime import datetime, timedelta
import os
from typing import Optional, Tuple
from pathlib import Path
import uuid

from app.config import settings


def generate_qrcode(
    url: str,
    size: int = 200,
    file_path: Optional[str] = None
) -> Tuple[str, Optional[str]]:
    """
    URLからQRコードを生成
    
    Args:
        url: QRコード化するURL
        size: QRコードのサイズ（ピクセル）
        file_path: 保存先パス（指定がなければBase64エンコード文字列を返す）
        
    Returns:
        Tuple[str, Optional[str]]: 
            - QRコードのBase64エンコード文字列
            - 保存された場合はファイルパス、それ以外はNone
    """
    # QRコードの生成
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Base64エンコード文字列の生成
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    base64_image = f"data:image/png;base64,{img_str}"
    
    # ファイルに保存する場合
    if file_path:
        # ディレクトリが存在しない場合は作成
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        img.save(file_path)
        return base64_image, file_path
    
    # Base64エンコード文字列のみ返す場合
    return base64_image, None


def get_qrcode_storage_path(qrcode_id: int) -> str:
    """
    QRコード画像の保存パスを取得
    
    Args:
        qrcode_id: QRコードのID
        
    Returns:
        QRコード画像の保存パス
    """
    # ストレージディレクトリのパスを生成
    storage_dir = Path(settings.MEDIA_ROOT) / "qrcodes"
    
    # ディレクトリが存在しない場合は作成
    storage_dir.mkdir(parents=True, exist_ok=True)
    
    # 年月日ベースでサブディレクトリを作成
    now = datetime.now()
    year_month = now.strftime("%Y-%m")
    sub_dir = storage_dir / year_month
    sub_dir.mkdir(exist_ok=True)
    
    # ファイル名を生成: qrcode_{id}_{uuid}.png
    filename = f"qrcode_{qrcode_id}_{uuid.uuid4().hex[:8]}.png"
    return str(sub_dir / filename)
