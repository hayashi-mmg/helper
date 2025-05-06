"""
テスト用ユーザー作成ヘルパー
"""
from datetime import datetime
from typing import Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User
from app.schemas.user import UserCreate
from app.core.auth import get_password_hash

async def create_test_user(
    db: AsyncSession, 
    username: str = "testuser",
    email: str = "test@example.com", 
    password: str = "Test1234!",
    full_name: Optional[str] = None,
    is_active: bool = True,
    is_superuser: bool = False
) -> User:
    """
    テスト用ユーザーを作成
    
    Args:
        db: データベースセッション
        username: ユーザー名
        email: メールアドレス
        password: パスワード
        full_name: フルネーム
        is_active: アクティブ状態
        is_superuser: 管理者権限
        
    Returns:
        作成されたユーザーモデル
    """
    hashed_password = get_password_hash(password)
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        is_active=is_active,
        is_superuser=is_superuser,
        created_at=datetime.utcnow()
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def create_test_superuser(
    db: AsyncSession, 
    username: str = "admin",
    email: str = "admin@example.com", 
    password: str = "Admin1234!"
) -> User:
    """
    テスト用管理者ユーザーを作成
    
    Args:
        db: データベースセッション
        username: ユーザー名
        email: メールアドレス
        password: パスワード
        
    Returns:
        作成された管理者ユーザーモデル
    """
    return await create_test_user(
        db=db,
        username=username,
        email=email,
        password=password,
        full_name="Admin User",
        is_active=True,
        is_superuser=True
    )
