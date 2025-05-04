"""
ユーザーとヘルパーの関連のCRUD操作
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.db.models.user_helper_assignment import UserHelperAssignment, RelationshipStatus
from app.schemas.user_helper_assignment import UserHelperAssignmentCreate, UserHelperAssignmentUpdate

class CRUDUserHelperAssignment(CRUDBase[UserHelperAssignment, UserHelperAssignmentCreate, UserHelperAssignmentUpdate]):
    """ユーザーとヘルパーの関連用CRUD操作クラス"""

    async def get_by_user_and_helper(
        self, db: AsyncSession, *, user_id: int, helper_id: int
    ) -> Optional[UserHelperAssignment]:
        """
        ユーザーIDとヘルパーIDによる関連取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            helper_id: ヘルパーID
            
        Returns:
            関連またはNone
        """
        result = await db.execute(
            select(UserHelperAssignment).filter(
                and_(
                    UserHelperAssignment.user_id == user_id,
                    UserHelperAssignment.helper_id == helper_id
                )
            )
        )
        return result.scalars().first()

    async def get_helpers_for_user(
        self, db: AsyncSession, *, user_id: int, status: Optional[RelationshipStatus] = None
    ) -> List[UserHelperAssignment]:
        """
        ユーザーに紐付けられたヘルパー一覧を取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            status: 関連ステータスでフィルタ（オプション）
            
        Returns:
            関連のリスト
        """
        query = select(UserHelperAssignment).filter(UserHelperAssignment.user_id == user_id)
        if status:
            query = query.filter(UserHelperAssignment.status == status)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_users_for_helper(
        self, db: AsyncSession, *, helper_id: int, status: Optional[RelationshipStatus] = None
    ) -> List[UserHelperAssignment]:
        """
        ヘルパーに紐付けられたユーザー一覧を取得
        
        Args:
            db: データベースセッション
            helper_id: ヘルパーID
            status: 関連ステータスでフィルタ（オプション）
            
        Returns:
            関連のリスト
        """
        query = select(UserHelperAssignment).filter(UserHelperAssignment.helper_id == helper_id)
        if status:
            query = query.filter(UserHelperAssignment.status == status)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def update_status(
        self, db: AsyncSession, *, user_id: int, helper_id: int, new_status: RelationshipStatus
    ) -> Optional[UserHelperAssignment]:
        """
        関連ステータスを更新
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            helper_id: ヘルパーID
            new_status: 新しいステータス
            
        Returns:
            更新された関連またはNone
        """
        assignment = await self.get_by_user_and_helper(db, user_id=user_id, helper_id=helper_id)
        if assignment:
            assignment.status = new_status
            await db.commit()
            await db.refresh(assignment)
        return assignment

user_helper_assignment = CRUDUserHelperAssignment(UserHelperAssignment)
