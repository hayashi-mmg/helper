"""
ユーザー関連モデルのユニットテスト
"""
import pytest
import pytest_asyncio
from sqlalchemy import select
from app.db.models import User, UserRole, UserProfile, HelperProfile

@pytest.mark.asyncio
async def test_user_creation(db_session):
    """ユーザーモデルの作成テスト"""
    # ユーザーオブジェクト作成
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER,
        is_active=True
    )
    
    # DBに追加
    db_session.add(user)
    await db_session.commit()
    
    # DBから取得して検証
    result = await db_session.execute(select(User).where(User.username == "testuser"))
    db_user = result.scalars().first()
    
    assert db_user is not None
    assert db_user.username == "testuser"
    assert db_user.email == "test@example.com"
    assert db_user.password_hash == "hashedpassword"
    assert db_user.role == UserRole.USER
    assert db_user.is_active is True

@pytest.mark.asyncio
async def test_user_profile_creation(db_session):
    """ユーザープロファイルモデルの作成テスト"""
    # ユーザーオブジェクト作成
    user = User(
        username="profileuser",
        email="profile@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER,
        is_active=True
    )
    
    # DBに追加
    db_session.add(user)
    await db_session.flush()
    
    # ユーザープロファイル作成
    profile = UserProfile(
        user_id=user.id,
        full_name="Test User",
        phone_number="123-456-7890",
        address="Test Address",
        preferences={"allergies": ["nuts"], "favorite": "pasta"}
    )
    
    # DBに追加
    db_session.add(profile)
    await db_session.commit()
    
    # DBから取得して検証
    result = await db_session.execute(select(UserProfile).where(UserProfile.user_id == user.id))
    db_profile = result.scalars().first()
    
    assert db_profile is not None
    assert db_profile.full_name == "Test User"
    assert db_profile.phone_number == "123-456-7890"
    assert db_profile.preferences["allergies"] == ["nuts"]
    assert db_profile.preferences["favorite"] == "pasta"
    
    # リレーションシップのテスト
    result = await db_session.execute(select(User).where(User.id == user.id))
    db_user = result.scalars().first()
    
    # SQLAlchemyは遅延ロードを使用するため、.profileアクセス時に別のクエリが発行される
    await db_session.refresh(db_user, ["profile"])
    
    assert db_user.profile is not None
    assert db_user.profile.full_name == "Test User"

@pytest.mark.asyncio
async def test_helper_profile_creation(db_session):
    """ヘルパープロファイルモデルの作成テスト"""
    # ヘルパーユーザーオブジェクト作成
    user = User(
        username="helperuser",
        email="helper@example.com",
        password_hash="hashedpassword",
        role=UserRole.HELPER,
        is_active=True
    )
    
    # DBに追加
    db_session.add(user)
    await db_session.flush()
    
    # ヘルパープロファイル作成
    helper_profile = HelperProfile(
        user_id=user.id,
        qualification="栄養士",
        specialties={"cuisines": ["日本料理", "イタリアン"], "skills": ["お菓子作り"]},
        availability={"weekdays": ["月", "水", "金"], "hours": "10:00-16:00"}
    )
    
    # DBに追加
    db_session.add(helper_profile)
    await db_session.commit()
    
    # DBから取得して検証
    result = await db_session.execute(select(HelperProfile).where(HelperProfile.user_id == user.id))
    db_profile = result.scalars().first()
    
    assert db_profile is not None
    assert db_profile.qualification == "栄養士"
    assert "日本料理" in db_profile.specialties["cuisines"]
    assert "お菓子作り" in db_profile.specialties["skills"]
    assert "月" in db_profile.availability["weekdays"]
