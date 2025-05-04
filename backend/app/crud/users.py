"""
ユーザー関連のCRUD操作
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models.user import User

async def get_user_by_username(db: AsyncSession, username: str):
    """
    ユーザー名でユーザーを取得
    :param db: DBセッション
    :param username: ユーザー名
    :return: User or None
    """
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    """
    メールアドレスでユーザーを取得
    :param db: DBセッション
    :param email: メールアドレス
    :return: User or None
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, username: str, email: str, password_hash: str):
    """
    新規ユーザー作成
    :param db: DBセッション
    :param username: ユーザー名
    :param email: メールアドレス
    :param password_hash: ハッシュ化済みパスワード
    :return: 作成ユーザー
    """
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_password(db: AsyncSession, user_id: int, new_password_hash: str):
    """
    ユーザーのパスワードを更新
    :param db: DBセッション
    :param user_id: ユーザーID
    :param new_password_hash: 新しいハッシュ化済みパスワード
    :return: 更新されたユーザー
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user:
        user.password_hash = new_password_hash
        await db.commit()
        await db.refresh(user)
    return user
