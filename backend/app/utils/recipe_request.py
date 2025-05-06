# app/tests/utils/recipe_request.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.recipe_request import RecipeRequest
from app.db.models.user import User
from datetime import datetime

async def create_test_recipe_request(
    db: AsyncSession,
    user: User,
    title: str = "テスト料理リクエスト",
    description: str = "これはテスト用の料理リクエストです。",
    recipe_url: str = "https://cookpad.com/recipe/123456",
    notes: str = "辛くしないでください",
    priority: int = 2,
    status: str = "requested"
) -> RecipeRequest:
    """テスト用の料理リクエストを作成"""
    recipe_request = RecipeRequest(
        user_id=user.id,
        title=title,
        description=description,
        recipe_url=recipe_url,
        notes=notes,
        priority=priority,
        status=status,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(recipe_request)
    await db.commit()
    await db.refresh(recipe_request)
    
    return recipe_request