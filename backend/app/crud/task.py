"""
お願いごとのCRUD操作
"""
from typing import List, Optional, Dict, Any
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc, func

from app.crud.base import CRUDBase
from app.db.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    """お願いごと用CRUD操作クラス"""

    async def get_by_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """
        ユーザーIDによるお願いごと一覧取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            お願いごとのリスト
        """
        result = await db.execute(
            select(Task)
            .filter(Task.user_id == user_id)
            .order_by(Task.priority, desc(Task.created_at))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def search(
        self,
        db: AsyncSession,
        *,
        user_id: Optional[int] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        search_term: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Task]:
        """
        お願いごとを検索
        
        Args:
            db: データベースセッション
            user_id: ユーザーIDでフィルタ（オプション）
            status: ステータスでフィルタ（オプション）
            priority: 優先度でフィルタ（オプション）
            start_date: 開始日でフィルタ（オプション）
            end_date: 終了日でフィルタ（オプション）
            search_term: タイトルまたは説明の検索語（オプション）
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            お願いごとのリスト
        """
        query = select(Task)
        filters = []
        
        if user_id is not None:
            filters.append(Task.user_id == user_id)
            
        if status is not None:
            filters.append(Task.status == status)
            
        if priority is not None:
            filters.append(Task.priority == priority)
            
        if start_date is not None:
            filters.append(Task.scheduled_date >= start_date)
            
        if end_date is not None:
            filters.append(Task.scheduled_date <= end_date)
            
        if search_term is not None:
            filters.append(
                or_(
                    Task.title.ilike(f"%{search_term}%"),
                    Task.description.ilike(f"%{search_term}%")
                )
            )
            
        if filters:
            query = query.filter(and_(*filters))
            
        query = query.order_by(Task.priority, desc(Task.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def update_status(
        self, db: AsyncSession, *, task_id: int, new_status: TaskStatus
    ) -> Optional[Task]:
        """
        お願いごとのステータスを更新
        
        Args:
            db: データベースセッション
            task_id: お願いごとID
            new_status: 新しいステータス
            
        Returns:
            更新されたお願いごとまたはNone
        """
        result = await db.execute(select(Task).filter(Task.id == task_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.status = new_status
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def update_priority(
        self, db: AsyncSession, *, task_id: int, new_priority: int
    ) -> Optional[Task]:
        """
        お願いごとの優先度を更新
        
        Args:
            db: データベースセッション
            task_id: お願いごとID
            new_priority: 新しい優先度
            
        Returns:
            更新されたお願いごとまたはNone
        """
        result = await db.execute(select(Task).filter(Task.id == task_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.priority = new_priority
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

task = CRUDTask(Task)
