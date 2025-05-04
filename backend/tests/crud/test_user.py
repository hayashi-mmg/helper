"""
ユーザーCRUDのテスト
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.crud.users import user as crud_user

@pytest.mark.asyncio
async def test_create_user(db_session: AsyncSession):
    """ユーザー作成のテスト"""
    user_in = UserCreate(
        username="testuser",
        email="test@example.com",
        role=UserRole.USER,
        is_active=True
    )
    password_hash = "hashed_password"
    
    user = await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash=password_hash
    )
    
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.password_hash == "hashed_password"
    assert user.role == UserRole.USER
    assert user.is_active == True
    assert user.id is not None

@pytest.mark.asyncio
async def test_get_user(db_session: AsyncSession):
    """ユーザー取得のテスト"""
    # ユーザーの作成
    user_in = UserCreate(
        username="testuser2",
        email="test2@example.com",
        role=UserRole.USER,
        is_active=True
    )
    password_hash = "hashed_password"
    created_user = await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash=password_hash
    )
    
    # IDによる取得
    user = await crud_user.get(db=db_session, id=created_user.id)
    assert user.id == created_user.id
    assert user.username == "testuser2"
    
    # ユーザー名による取得
    user = await crud_user.get_by_username(db=db_session, username="testuser2")
    assert user.id == created_user.id
    
    # メールアドレスによる取得
    user = await crud_user.get_by_email(db=db_session, email="test2@example.com")
    assert user.id == created_user.id

@pytest.mark.asyncio
async def test_update_user(db_session: AsyncSession):
    """ユーザー更新のテスト"""
    # ユーザーの作成
    user_in = UserCreate(
        username="updateuser",
        email="update@example.com",
        role=UserRole.USER,
        is_active=True
    )
    password_hash = "hashed_password"
    created_user = await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash=password_hash
    )
    
    # 更新データ
    user_update = UserUpdate(
        email="updated@example.com"
    )
    
    # 更新実行
    updated_user = await crud_user.update(
        db=db_session,
        db_obj=created_user,
        obj_in=user_update
    )
    
    assert updated_user.id == created_user.id
    assert updated_user.username == "updateuser"  # 変更なし
    assert updated_user.email == "updated@example.com"  # 変更あり
    
@pytest.mark.asyncio
async def test_update_user_password(db_session: AsyncSession):
    """ユーザーパスワード更新のテスト"""
    # ユーザーの作成
    user_in = UserCreate(
        username="pwduser",
        email="pwd@example.com",
        role=UserRole.USER,
        is_active=True
    )
    password_hash = "old_password_hash"
    created_user = await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash=password_hash
    )
    
    # パスワード更新
    new_password_hash = "new_password_hash"
    updated_user = await crud_user.update_password(
        db=db_session,
        user_id=created_user.id,
        new_password_hash=new_password_hash
    )
    
    assert updated_user.password_hash == new_password_hash
    
@pytest.mark.asyncio
async def test_deactivate_and_activate_user(db_session: AsyncSession):
    """ユーザーの有効化・無効化テスト"""
    # ユーザーの作成
    user_in = UserCreate(
        username="activeuser",
        email="active@example.com",
        role=UserRole.USER,
        is_active=True
    )
    password_hash = "hashed_password"
    created_user = await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash=password_hash
    )
    
    # ユーザーの無効化
    deactivated_user = await crud_user.deactivate(db=db_session, user_id=created_user.id)
    assert deactivated_user.is_active == False
    
    # ユーザーの有効化
    activated_user = await crud_user.activate(db=db_session, user_id=created_user.id)
    assert activated_user.is_active == True
    
@pytest.mark.asyncio
async def test_get_helpers(db_session: AsyncSession):
    """ヘルパー一覧取得のテスト"""
    # 通常ユーザーの作成
    user_in = UserCreate(
        username="normaluser",
        email="normal@example.com",
        role=UserRole.USER,
        is_active=True
    )
    await crud_user.create_with_password(
        db=db_session,
        obj_in=user_in,
        password_hash="hashed_password"
    )
    
    # ヘルパーの作成
    helper_in = UserCreate(
        username="helperuser",
        email="helper@example.com",
        role=UserRole.HELPER,
        is_active=True
    )
    await crud_user.create_with_password(
        db=db_session,
        obj_in=helper_in,
        password_hash="hashed_password"
    )
    
    # ヘルパー一覧の取得
    helpers = await crud_user.get_helpers(db=db_session)
    
    # 少なくとも1人のヘルパーがいることを確認
    assert len(helpers) > 0
    # すべてのユーザーがヘルパーロールであることを確認
    for helper in helpers:
        assert helper.role == UserRole.HELPER
