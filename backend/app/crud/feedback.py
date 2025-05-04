"""
フィードバックのCRUD操作
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.crud.base import CRUDBase
from app.db.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate

class CRUDFeedback(CRUDBase[Feedback, FeedbackCreate, FeedbackUpdate]):
    """フィードバック用CRUD操作クラス"""

    async def get_by_recipe_request(
        self, db: AsyncSession, *, recipe_request_id: int
    ) -> List[Feedback]:
        """
        料理リクエストIDによるフィードバック一覧取得
        
        Args:
            db: データベースセッション
            recipe_request_id: 料理リクエストID
            
        Returns:
            フィードバックのリスト
        """
        result = await db.execute(
            select(Feedback)
            .filter(Feedback.recipe_request_id == recipe_request_id)
            .order_by(desc(Feedback.created_at))
        )
        return result.scalars().all()

    async def get_by_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Feedback]:
        """
        ユーザーIDによるフィードバック一覧取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            フィードバックのリスト
        """
        result = await db.execute(
            select(Feedback)
            .filter(Feedback.user_id == user_id)
            .order_by(desc(Feedback.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def get_latest_by_recipe_request(
        self, db: AsyncSession, *, recipe_request_id: int
    ) -> Optional[Feedback]:
        """
        料理リクエストIDによる最新フィードバック取得
        
        Args:
            db: データベースセッション
            recipe_request_id: 料理リクエストID
            
        Returns:
            最新のフィードバックまたはNone
        """
        result = await db.execute(
            select(Feedback)
            .filter(Feedback.recipe_request_id == recipe_request_id)
            .order_by(desc(Feedback.created_at))
            .limit(1)
        )
        return result.scalars().first()

feedback = CRUDFeedback(Feedback)
