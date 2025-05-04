"""
ヘルパー返信のCRUD操作
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.crud.base import CRUDBase
from app.db.models.helper_response import HelperResponse
from app.schemas.helper_response import HelperResponseCreate, HelperResponseUpdate

class CRUDHelperResponse(CRUDBase[HelperResponse, HelperResponseCreate, HelperResponseUpdate]):
    """ヘルパー返信用CRUD操作クラス"""

    async def get_by_feedback(
        self, db: AsyncSession, *, feedback_id: int
    ) -> List[HelperResponse]:
        """
        フィードバックIDによるヘルパー返信一覧取得
        
        Args:
            db: データベースセッション
            feedback_id: フィードバックID
            
        Returns:
            ヘルパー返信のリスト
        """
        result = await db.execute(
            select(HelperResponse)
            .filter(HelperResponse.feedback_id == feedback_id)
            .order_by(desc(HelperResponse.created_at))
        )
        return result.scalars().all()

    async def get_by_helper(
        self, db: AsyncSession, *, helper_id: int, skip: int = 0, limit: int = 100
    ) -> List[HelperResponse]:
        """
        ヘルパーIDによるヘルパー返信一覧取得
        
        Args:
            db: データベースセッション
            helper_id: ヘルパーID
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            ヘルパー返信のリスト
        """
        result = await db.execute(
            select(HelperResponse)
            .filter(HelperResponse.helper_id == helper_id)
            .order_by(desc(HelperResponse.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
        
    async def get_latest_by_feedback(
        self, db: AsyncSession, *, feedback_id: int
    ) -> Optional[HelperResponse]:
        """
        フィードバックIDによる最新のヘルパー返信取得
        
        Args:
            db: データベースセッション
            feedback_id: フィードバックID
            
        Returns:
            最新のヘルパー返信またはNone
        """
        result = await db.execute(
            select(HelperResponse)
            .filter(HelperResponse.feedback_id == feedback_id)
            .order_by(desc(HelperResponse.created_at))
            .limit(1)
        )
        return result.scalars().first()

helper_response = CRUDHelperResponse(HelperResponse)
