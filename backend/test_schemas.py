import sys
import os
sys.path.append("/app")

# app/ ディレクトリをPythonパスに追加
from app.schemas.feedback import FeedbackBase
from app.schemas.validators import validate_comments, validate_task_description

def test_validators():
    # コメントのバリデーション
    valid_comment = "このサービスは素晴らしいです！"
    assert validate_comments(valid_comment) == valid_comment
    
    # タスク説明のバリデーション
    valid_task = "プログラミング課題を完了する"
    assert validate_task_description(valid_task) == valid_task
    
    print("All validation tests passed!")
    
if __name__ == "__main__":
    test_validators()
    
    # FeedbackBaseクラスのオブジェクトを作成してテスト
    feedback = FeedbackBase(
        recipe_request_id=1,
        user_id=1,
        taste_rating=5,
        texture_rating=4,
        quantity_rating=4,
        overall_rating=5,
        comments="とても美味しかったです！",
        request_for_next="次回はもう少し辛めの味付けにしてください",
        photo_url="https://example.com/image.jpg"
    )
    
    print("FeedbackBase object created successfully!")
    print(f"Comments: {feedback.comments}")
    print(f"Overall rating: {feedback.overall_rating}")
    print("All tests passed!")
