"""
リクエスト関連モデルのユニットテスト
"""
import pytest
from datetime import date
from sqlalchemy import select
from app.db.models import (
    User, 
    UserRole, 
    RecipeRequest, 
    RecipeRequestStatus, 
    Task,
    TaskStatus,
    Tag
)

@pytest.mark.asyncio
async def test_recipe_request_creation(db_session):
    """料理リクエストモデルの作成テスト"""
    # ユーザー作成
    user = User(
        username="recipeuser",
        email="recipe@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER
    )
    
    db_session.add(user)
    await db_session.flush()
    
    # 料理リクエスト作成
    recipe_request = RecipeRequest(
        user_id=user.id,
        title="カルボナーラの作り方",
        description="クリーミーなカルボナーラを作ってほしいです",
        recipe_url="https://example.com/recipes/carbonara",
        recipe_content="材料: パスタ、ベーコン、卵、チーズ...",
        scheduled_date=date(2025, 5, 10),
        status=RecipeRequestStatus.PENDING
    )
    
    db_session.add(recipe_request)
    await db_session.commit()
    
    # 検証
    result = await db_session.execute(select(RecipeRequest).where(RecipeRequest.user_id == user.id))
    db_request = result.scalars().first()
    
    assert db_request is not None
    assert db_request.title == "カルボナーラの作り方"
    assert db_request.description == "クリーミーなカルボナーラを作ってほしいです"
    assert db_request.scheduled_date == date(2025, 5, 10)
    assert db_request.status == RecipeRequestStatus.PENDING

@pytest.mark.asyncio
async def test_task_creation(db_session):
    """お願いごとモデルの作成テスト"""
    # ユーザー作成
    user = User(
        username="taskuser",
        email="task@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER
    )
    
    db_session.add(user)
    await db_session.flush()
    
    # お願いごと作成
    task = Task(
        user_id=user.id,
        title="食材の買い出し",
        description="近くのスーパーで週末の食材を買ってきてください",
        priority=2,  # 高い優先度
        scheduled_date=date(2025, 5, 5),
        status=TaskStatus.PENDING
    )
    
    db_session.add(task)
    await db_session.commit()
    
    # 検証
    result = await db_session.execute(select(Task).where(Task.user_id == user.id))
    db_task = result.scalars().first()
    
    assert db_task is not None
    assert db_task.title == "食材の買い出し"
    assert db_task.description == "近くのスーパーで週末の食材を買ってきてください"
    assert db_task.priority == 2
    assert db_task.scheduled_date == date(2025, 5, 5)
    assert db_task.status == TaskStatus.PENDING

@pytest.mark.asyncio
async def test_tag_and_relationships(db_session):
    """タグとリレーションシップのテスト"""
    # ユーザー作成
    user = User(
        username="taguser",
        email="tag@example.com",
        password_hash="hashedpassword",
        role=UserRole.USER
    )
    
    db_session.add(user)
    await db_session.flush()
    
    # タグ作成
    tag1 = Tag(name="イタリアン", color="#FF0000")
    tag2 = Tag(name="緊急", color="#0000FF")
    
    db_session.add_all([tag1, tag2])
    await db_session.flush()
    
    # リクエスト作成
    recipe = RecipeRequest(
        user_id=user.id,
        title="ピザの作り方",
        description="家庭でできるピザレシピ",
        status=RecipeRequestStatus.PENDING
    )
    
    task = Task(
        user_id=user.id,
        title="緊急の買い物",
        description="急ぎの買い物をお願いします",
        priority=1,
        status=TaskStatus.PENDING
    )
    
    # タグの関連付け
    recipe.tags.append(tag1)  # イタリアン料理
    task.tags.append(tag2)    # 緊急タスク
    
    db_session.add_all([recipe, task])
    await db_session.commit()
    
    # タグ関連を検証
    result = await db_session.execute(select(RecipeRequest).where(RecipeRequest.title == "ピザの作り方"))
    db_recipe = result.scalars().first()
    
    # リレーションシップのロード
    await db_session.refresh(db_recipe, ["tags"])
    
    assert len(db_recipe.tags) == 1
    assert db_recipe.tags[0].name == "イタリアン"
    
    result = await db_session.execute(select(Task).where(Task.title == "緊急の買い物"))
    db_task = result.scalars().first()
    
    # リレーションシップのロード
    await db_session.refresh(db_task, ["tags"])
    
    assert len(db_task.tags) == 1
    assert db_task.tags[0].name == "緊急"
    
    # タグから逆引きも検証
    result = await db_session.execute(select(Tag).where(Tag.name == "イタリアン"))
    tag = result.scalars().first()
    
    # リレーションシップのロード
    await db_session.refresh(tag, ["recipe_requests"])
    
    assert len(tag.recipe_requests) == 1
    assert tag.recipe_requests[0].title == "ピザの作り方"
