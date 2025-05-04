"""
タグのCRUD操作
"""
from typing import List, Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc, func

from app.crud.base import CRUDBase
from app.db.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate

class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    """タグ用CRUD操作クラス"""

    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Tag]:
        """
        名前によるタグ取得
        
        Args:
            db: データベースセッション
            name: タグ名
            
        Returns:
            タグまたはNone
        """
        result = await db.execute(select(Tag).filter(func.lower(Tag.name) == func.lower(name)))
        return result.scalars().first()

    async def search_by_name(
        self, db: AsyncSession, *, name_pattern: str, skip: int = 0, limit: int = 100
    ) -> List[Tag]:
        """
        名前パターンによるタグ検索
        
        Args:
            db: データベースセッション
            name_pattern: 検索パターン
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            タグのリスト
        """
        result = await db.execute(
            select(Tag)
            .filter(Tag.name.ilike(f"%{name_pattern}%"))
            .order_by(Tag.name)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create_if_not_exists(self, db: AsyncSession, *, tag_in: TagCreate) -> Tag:
        """
        タグを作成（既存する場合は取得）
        
        Args:
            db: データベースセッション
            tag_in: 作成するタグ情報
            
        Returns:
            作成または取得されたタグ
        """
        existing_tag = await self.get_by_name(db, name=tag_in.name)
        if existing_tag:
            return existing_tag
        return await self.create(db, obj_in=tag_in)

    async def get_or_create_multi(
        self, db: AsyncSession, *, tag_names: List[str]
    ) -> List[Tag]:
        """
        複数のタグ名から、タグを取得または作成
        
        Args:
            db: データベースセッション
            tag_names: タグ名リスト
            
        Returns:
            タグリスト
        """
        tags = []
        for name in tag_names:
            tag = await self.get_by_name(db, name=name)
            if not tag:
                tag = await self.create(db, obj_in=TagCreate(name=name))
            tags.append(tag)
        return tags

tag = CRUDTag(Tag)
