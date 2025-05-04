"""
CRUD操作の基本クラス。すべてのモデル用CRUDクラスはこれを継承する。
"""
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    CRUD操作の基本クラス。
    
    モデルごとに共通のCRUD操作（Create, Read, Update, Delete）を提供する。
    
    属性:
        model: 操作対象のSQLAlchemyモデル
    """

    def __init__(self, model: Type[ModelType]):
        """
        初期化
        
        Args:
            model: 操作対象のSQLAlchemyモデル
        """
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """
        IDによるオブジェクト取得
        
        Args:
            db: データベースセッション
            id: 取得するオブジェクトのID
            
        Returns:
            取得したオブジェクト、存在しない場合はNone
        """
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        複数オブジェクト取得（ページネーション対応）
        
        Args:
            db: データベースセッション
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            取得したオブジェクトのリスト
        """
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        """
        新規オブジェクトの作成
        
        Args:
            db: データベースセッション
            obj_in: 作成するオブジェクトのデータ
            
        Returns:
            作成されたオブジェクト
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        オブジェクトの更新
        
        Args:
            db: データベースセッション
            db_obj: 更新対象のオブジェクト
            obj_in: 更新するデータ（Pydanticモデルまたは辞書）
            
        Returns:
            更新されたオブジェクト
        """
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: int) -> Optional[ModelType]:
        """
        オブジェクトの削除
        
        Args:
            db: データベースセッション
            id: 削除するオブジェクトのID
            
        Returns:
            削除されたオブジェクト、存在しない場合はNone
        """
        result = await db.execute(select(self.model).filter(self.model.id == id))
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj
