"""
ユーザー関連のCRUD操作
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, desc

from app.crud.base import CRUDBase
from app.db.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """ユーザー用CRUD操作クラス"""

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        """
        ユーザー名でユーザーを取得
        
        Args:
            db: データベースセッション
            username: ユーザー名
            
        Returns:
            ユーザーまたはNone
        """
        result = await db.execute(select(User).filter(User.username == username))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """
        メールアドレスでユーザーを取得
        
        Args:
            db: データベースセッション
            email: メールアドレス
            
        Returns:
            ユーザーまたはNone
        """
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def create_with_password(
        self, db: AsyncSession, *, obj_in: UserCreate, password_hash: str
    ) -> User:
        """
        パスワードハッシュ付きで新規ユーザーを作成
        
        Args:
            db: データベースセッション
            obj_in: ユーザー作成情報
            password_hash: ハッシュ化済みパスワード
            
        Returns:
            作成されたユーザー
        """
        db_obj = User(
            username=obj_in.username,
            email=obj_in.email,
            password_hash=password_hash,
            role=obj_in.role if hasattr(obj_in, "role") else UserRole.USER,
            is_active=obj_in.is_active if hasattr(obj_in, "is_active") else True
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_password(
        self, db: AsyncSession, *, user_id: int, new_password_hash: str
    ) -> Optional[User]:
        """
        ユーザーのパスワードを更新
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            new_password_hash: 新しいハッシュ化済みパスワード
            
        Returns:
            更新されたユーザーまたはNone
        """
        result = await db.execute(select(User).filter(User.id == user_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.password_hash = new_password_hash
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def activate(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        """
        ユーザーを有効化
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            
        Returns:
            更新されたユーザーまたはNone
        """
        result = await db.execute(select(User).filter(User.id == user_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.is_active = True
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def deactivate(self, db: AsyncSession, *, user_id: int) -> Optional[User]:
        """
        ユーザーを無効化
        
        Args:
            db: データベースセッション
            user_id: ユーザーID
            
        Returns:
            更新されたユーザーまたはNone
        """
        result = await db.execute(select(User).filter(User.id == user_id))
        db_obj = result.scalars().first()
        if db_obj:
            db_obj.is_active = False
            await db.commit()
            await db.refresh(db_obj)
        return db_obj

    async def get_helpers(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """
        ヘルパーロールを持つユーザーを取得
        
        Args:
            db: データベースセッション
            skip: スキップする件数
            limit: 取得する最大件数
            
        Returns:
            ヘルパーユーザーのリスト
        """
        result = await db.execute(
            select(User)
            .filter(User.role == UserRole.HELPER)
            .order_by(User.username)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

# 後方互換性のための関数
async def get_user_by_username(db: AsyncSession, username: str):
    """
    ユーザー名でユーザーを取得
    :param db: DBセッション
    :param username: ユーザー名
    :return: User or None
    """
    return await user.get_by_username(db, username)

async def get_user_by_email(db: AsyncSession, email: str):
    """
    メールアドレスでユーザーを取得
    :param db: DBセッション
    :param email: メールアドレス
    :return: User or None
    """
    return await user.get_by_email(db, email)

async def create_user(db: AsyncSession, username: str, email: str, password_hash: str):
    """
    新規ユーザー作成
    :param db: DBセッション
    :param username: ユーザー名
    :param email: メールアドレス
    :param password_hash: ハッシュ化済みパスワード
    :return: 作成ユーザー
    """
    user_in = UserCreate(username=username, email=email)
    return await user.create_with_password(db, obj_in=user_in, password_hash=password_hash)

async def update_user_password(db: AsyncSession, user_id: int, new_password_hash: str):
    """
    ユーザーのパスワードを更新
    :param db: DBセッション
    :param user_id: ユーザーID
    :param new_password_hash: 新しいハッシュ化済みパスワード
    :return: 更新されたユーザー
    """
    return await user.update_password(db, user_id=user_id, new_password_hash=new_password_hash)

# CRUDUserインスタンスを作成
user = CRUDUser(User)
