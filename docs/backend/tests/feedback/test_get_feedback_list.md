# GET /api/v1/feedback - フィードバック一覧取得テスト

## テスト概要

このテストでは、フィードバック一覧を取得するエンドポイント (`GET /api/v1/feedback`) の機能を検証します。
ユーザー種別（一般ユーザー、ヘルパー、管理者）ごとに適切な結果が返されることを確認します。

## テストシナリオ

### 1. 認証済みユーザーとしてフィードバック一覧を取得

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- ユーザーが複数のフィードバックを登録済み
- 他のユーザーも複数のフィードバックを登録済み

**テストステップ:**
1. `GET /api/v1/feedback` エンドポイントにリクエストを送信
2. 適切な認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 自分のフィードバック一覧のみが含まれる
- ページネーション情報が正しい

**検証項目:**
- 返されるフィードバックが自分のものだけであることを確認
- フィードバックデータの構造が正しいことを確認
- 各フィードバックに必要な属性（id, recipe_request_id, user_id, 評価項目など）が含まれていることを確認

### 2. ヘルパーとしてフィードバック一覧を取得

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- ヘルパーが担当するユーザーが複数のフィードバックを登録済み
- ヘルパーが担当していないユーザーも複数のフィードバックを登録済み

**テストステップ:**
1. `GET /api/v1/feedback` エンドポイントにリクエストを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 担当ユーザーのフィードバック一覧が含まれる
- ページネーション情報が正しい

**検証項目:**
- 返されるフィードバックが担当ユーザーのものだけであることを確認
- 担当外ユーザーのフィードバックが含まれていないことを確認

### 3. 管理者としてフィードバック一覧を取得

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- システム内に複数のフィードバックが登録済み

**テストステップ:**
1. `GET /api/v1/feedback` エンドポイントにリクエストを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 全てのフィードバック一覧が含まれる
- ページネーション情報が正しい

**検証項目:**
- システム内の全フィードバックにアクセスできることを確認
- 正しいページネーション処理ができていることを確認

### 4. フィルター付きでフィードバック一覧を取得

**前提条件:**
- 認証済みユーザーがログインしている
- システム内に様々な条件のフィードバックが登録済み

**テストステップ:**
1. `GET /api/v1/feedback?user_id=1&min_rating=4` のようにクエリパラメータを付けてリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: フィルター条件に一致するフィードバック一覧のみが含まれる

**検証項目:**
- ユーザーIDによるフィルタリングが正しく機能すること
- 評価値（最小/最大）によるフィルタリングが正しく機能すること
- 日付範囲によるフィルタリングが正しく機能すること

### 5. ページネーションを使用してフィードバック一覧を取得

**前提条件:**
- 認証済みユーザーがログインしている
- システム内に多数のフィードバックが登録済み

**テストステップ:**
1. `GET /api/v1/feedback?skip=10&limit=5` のようにページネーションパラメータを付けてリクエストを送信
2. 認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 指定されたオフセットと制限に従ったフィードバック一覧が含まれる

**検証項目:**
- 正しい数のフィードバックが返されること
- 正しいオフセットから開始されていること
- 次ページ/前ページの情報が適切に含まれていること

### 6. 未認証でフィードバック一覧を取得しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `GET /api/v1/feedback` エンドポイントにリクエストを送信
2. 認証トークンを含めない

**期待結果:**
- ステータスコード: 401 Unauthorized
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 認証が必要であることが明示されること

## 実装例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_feedback_list_as_user(client, user_token, create_test_user, create_test_feedbacks):
    """一般ユーザーとしてフィードバック一覧を取得するテスト"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    response = client.get("/api/v1/feedback", headers=headers)
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert "items" in data
    assert "total" in data
    
    # 自分のフィードバックのみが含まれていることを確認
    for feedback in data["items"]:
        assert feedback["user_id"] == create_test_user.id
        assert "taste_rating" in feedback
        assert "texture_rating" in feedback
        assert "amount_rating" in feedback
```
