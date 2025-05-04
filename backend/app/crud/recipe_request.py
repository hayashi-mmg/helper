"""
料理リクエストのCRUD操作
"""
from typing import List, Optional, Dict, Any
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc, func

from app.crud.base import CRUDBase
from app.db.models.recipe_request import RecipeRequest, RecipeRequestStatus
from app.schemas.recipe_request import RecipeRequestCreate, RecipeRequestUpdate

class CRUDRecipeRequest(CRUDBase[RecipeRequest, RecipeRequestCreate, RecipeRequestUpdate]):
    """料理リクエスト用CRUD操作クラス"""

    async def get_by_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[RecipeRequest]:
        """
        ユーザーIDによる料理リクエスト一覧取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            料理リクエストのリスト
        """
        result = await db.execute(
            select(RecipeRequest)
            .filter(RecipeRequest.user_id == user_id)
            .order_by(desc(RecipeRequest.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def search(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int] = None,
        status: Optional[RecipeRequestStatus] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        search_term: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[RecipeRequest]:
        """
        料理リクエストを検索
        
        Args:
            db: データベースセッション
            user_id: ユーザーIDでフィルタ（オプション）
            status: ステータスでフィルタ（オプション）
            start_date: 開始日でフィルタ（オプション）
            end_date: 終了日でフィルタ（オプション）
            search_term: タイトルまたは説明の検索語（オプション）
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            料理リクエストのリスト
        """
        query = select(RecipeRequest)
        filters = []
        
        if user_id is not None:
            filters.append(RecipeRequest.user_id == user_id)
            
        if status is not None:
            filters.append(RecipeRequest.status == status)
            
        if start_date is not None:
            filters.append(RecipeRequest.scheduled_date >= start_date)
            
        if end_date is not None:
            filters.append(RecipeRequest.scheduled_date <= end_date)
            
        if search_term is not None:
            filters.append(
                or_(
                    RecipeRequest.title.ilike(f"%{search_term}%"),
                    RecipeRequest.description.ilike(f"%{search_term}%")
                )
            )
            
        if filters:
            query = query.filter(and_(*filters))
            
        query = query.order_by(desc(RecipeRequest.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def update_status(
        self, db: AsyncSession, *, request_id: int, new_status: RecipeRequestStatus
    ) -> Optional[RecipeRequest]:
        """
        料理リクエストのステータスを更新
        
        Args:
            db: データベースセッション
            request_id: 料理リクエストID
            new_status: 新しいステータス
            
        Returns:
            更新された料理リクエストまたはNone
        """
        result = await db.execute(select(RecipeRequest).filter(RecipeRequest.id == request_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.status = new_status
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

recipe_request = CRUDRecipeRequest(RecipeRequest)
