"""
ヘルパープロファイルのCRUD操作
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update

from app.crud.base import CRUDBase
from app.db.models.helper_profile import HelperProfile
from app.schemas.helper import HelperProfileCreate, HelperProfileUpdate

class CRUDHelperProfile(CRUDBase[HelperProfile, HelperProfileCreate, HelperProfileUpdate]):
    """ヘルパープロファイル用CRUD操作クラス"""

    async def get_by_user_id(self, db: AsyncSession, user_id: int) -> Optional[HelperProfile]:
        """
        ユーザーIDによるヘルパープロファイル取得
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            
        Returns:
            ヘルパープロファイルまたはNone
        """
        result = await db.execute(select(HelperProfile).filter(HelperProfile.user_id == user_id))
        return result.scalars().first()

    async def update_availability(
        self, db: AsyncSession, *, helper_id: int, availability: dict
    ) -> Optional[HelperProfile]:
        """
        ヘルパーの予定可能時間を更新
        
        Args:
            db: データベースセッション
            helper_id: ヘルパーのユーザーID
            availability: 新しい予定情報
            
        Returns:
            更新されたヘルパープロファイルまたはNone
        """
        result = await db.execute(select(HelperProfile).filter(HelperProfile.user_id == helper_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.availability = availability
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def update_specialties(
        self, db: AsyncSession, *, helper_id: int, specialties: dict
    ) -> Optional[HelperProfile]:
        """
        ヘルパーの専門分野を更新
        
        Args:
            db: データベースセッション
            helper_id: ヘルパーのユーザーID
            specialties: 新しい専門分野情報
            
        Returns:
            更新されたヘルパープロファイルまたはNone
        """
        result = await db.execute(select(HelperProfile).filter(HelperProfile.user_id == helper_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.specialties = specialties
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

helper_profile = CRUDHelperProfile(HelperProfile)
