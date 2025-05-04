"""
QRコードのCRUD操作
"""
from typing import List, Optional
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc, func

from app.crud.base import CRUDBase
from app.db.models.qrcode import QRCode, QRCodeTargetType
from app.schemas.qrcode import QRCodeCreate, QRCodeUpdate

class CRUDQRCode(CRUDBase[QRCode, QRCodeCreate, QRCodeUpdate]):
    """QRコード用CRUD操作クラス"""

    async def get_by_target(
        self, db: AsyncSession, *, target_type: QRCodeTargetType, target_id: int
    ) -> List[QRCode]:
        """
        対象タイプと対象IDによるQRコード一覧取得
        
        Args:
            db: データベースセッション
            target_type: 対象タイプ
            target_id: 対象ID
            
        Returns:
            QRコードのリスト
        """
        result = await db.execute(
            select(QRCode)
            .filter(
                and_(
                    QRCode.target_type == target_type,
                    QRCode.target_id == target_id
                )
            )
            .order_by(desc(QRCode.created_at))
        )
        return result.scalars().all()

    async def get_by_creator(
        self, db: AsyncSession, *, created_by: int, skip: int = 0, limit: int = 100
    ) -> List[QRCode]:
        """
        作成者IDによるQRコード一覧取得
        
        Args:
            db: データベースセッション
            created_by: 作成者ID
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            QRコードのリスト
        """
        result = await db.execute(
            select(QRCode)
            .filter(QRCode.created_by == created_by)
            .order_by(desc(QRCode.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def get_valid(
        self, db: AsyncSession, *, now: Optional[datetime] = None, skip: int = 0, limit: int = 100
    ) -> List[QRCode]:
        """
        有効期限内のQRコード一覧取得
        
        Args:
            db: データベースセッション
            now: 現在時刻（指定しない場合は現在時刻を使用）
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            QRコードのリスト
        """
        if now is None:
            now = datetime.now()
            
        result = await db.execute(
            select(QRCode)
            .filter(
                or_(
                    QRCode.expire_at.is_(None),
                    QRCode.expire_at > now
                )
            )
            .order_by(desc(QRCode.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def increment_access_count(
        self, db: AsyncSession, *, qrcode_id: int
    ) -> Optional[QRCode]:
        """
        QRコードのアクセス数をインクリメント
        
        Args:
            db: データベースセッション
            qrcode_id: QRコードID
            
        Returns:
            更新されたQRコードまたはNone
        """
        result = await db.execute(select(QRCode).filter(QRCode.id == qrcode_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.access_count += 1
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

qrcode = CRUDQRCode(QRCode)
