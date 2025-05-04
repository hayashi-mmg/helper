"""
フィードバックテスト用ユーティリティ
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.feedback import Feedback


async def create_test_feedback(
    db: AsyncSession,
    *,
    recipe_request_id: int,
    user_id: int,
    taste_rating: int = 4,
    texture_rating: int = 4,
    quantity_rating: int = 4,
    overall_rating: int = 4,
    comments: str = "テストフィードバックコメント",
    request_for_next: str = "次回への要望テスト"
) -> Feedback:
    """
    テスト用フィードバックを作成する
    
    Args:
        db: DB接続セッション
        recipe_request_id: レシピリクエストID
        user_id: ユーザーID
        
    Returns:
        作成されたフィードバックオブジェクト
    """
    feedback = Feedback(
        recipe_request_id=recipe_request_id,
        user_id=user_id,
        taste_rating=taste_rating,
        texture_rating=texture_rating,
        quantity_rating=quantity_rating,
        overall_rating=overall_rating,
        comments=comments,
        request_for_next=request_for_next
    )
    
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    
    return feedback
