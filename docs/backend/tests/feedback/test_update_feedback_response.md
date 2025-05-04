# PUT /api/v1/feedback/{feedback_id}/response - ヘルパー返信更新テスト

## テスト概要

このテストでは、フィードバックに対するヘルパーの返信を更新するエンドポイント (`PUT /api/v1/feedback/{feedback_id}/response`) の機能を検証します。
ヘルパーが自分の返信を正しく更新できることを確認します。

## テストシナリオ

### 1. 有効なデータでヘルパー返信を更新

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する
- そのフィードバックに対するヘルパーの返信が既に存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントに以下のデータを送信:
   ```json
   {
     "response": "更新されたフィードバックへの返信です。",
     "next_note": "更新された次回調理時のメモです。"
   }
   ```
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 更新されたヘルパー返信情報が含まれる

**検証項目:**
- 返信内容が正しく更新されていること
- 次回調理時のメモが正しく更新されていること
- 更新日時が現在時刻に近いこと
- feedback_idとhelper_idが変更されていないこと

### 2. 部分的な更新を行う

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する
- そのフィードバックに対するヘルパーの返信が既に存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントに一部のフィールドのみを含むデータを送信:
   ```json
   {
     "next_note": "次回調理時のメモのみ更新します"
   }
   ```
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 部分的に更新されたヘルパー返信情報が含まれる

**検証項目:**
- 指定したフィールド（この場合はnext_note）のみが更新されていること
- 他のフィールド（response）は元の値が維持されていること

### 3. 他のヘルパーの返信を更新しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 他のヘルパーが作成した返信が存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントに他のヘルパーの返信を持つフィードバックIDを指定してデータを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 4. 一般ユーザーがヘルパー返信を更新しようとした場合

**前提条件:**
- 認証済みの一般ユーザーがログインしている
- フィードバックとそれに対するヘルパー返信が存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
2. 一般ユーザーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 403 Forbidden
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- 権限がないことが明示されること

### 5. 管理者が任意のヘルパー返信を更新

**前提条件:**
- 認証済みの管理者ユーザーがログインしている
- フィードバックとそれに対するヘルパー返信が存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
2. 管理者の認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 200 OK
- レスポンスボディ: 更新されたヘルパー返信情報が含まれる

**検証項目:**
- 管理者が任意のヘルパー返信を更新できることを確認
- 返信内容が正しく更新されていること

### 6. ヘルパー返信が存在しないフィードバックで更新しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する
- そのフィードバックにはまだヘルパー返信が作成されていない

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- ヘルパー返信が存在しないことが明示されること

### 7. 存在しないフィードバックIDで更新しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている

**テストステップ:**
1. `PUT /api/v1/feedback/9999/response` のように存在しないIDでリクエストを送信
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 404 Not Found
- エラーメッセージが含まれる

**検証項目:**
- 適切なエラーメッセージが返されること
- リソースが見つからないことが明示されること

### 8. バリデーションエラーのあるデータで更新しようとした場合

**前提条件:**
- 認証済みのヘルパーユーザーがログインしている
- 担当ユーザーのフィードバックが存在する
- そのフィードバックに対するヘルパーの返信が既に存在する

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントに無効なデータを送信:
   ```json
   {
     "response": ""  // 空文字列（バリデーションエラー）
ｇ   }
   ```
2. ヘルパーの認証トークンをヘッダーに含める

**期待結果:**
- ステータスコード: 422 Unprocessable Entity
- バリデーションエラーメッセージが含まれる

**検証項目:**
- 適切なバリデーションエラーメッセージが返されること
- 無効なフィールドが明示されること

### 9. 未認証で返信を更新しようとした場合

**前提条件:**
- ユーザーが認証されていない

**テストステップ:**
1. `PUT /api/v1/feedback/{feedback_id}/response` エンドポイントにデータを送信
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
async def test_update_helper_response_success(
    client, helper_token, create_test_helper, create_helper_response
):
    """ヘルパーが自分の返信を正常に更新できることをテスト"""
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    update_data = {
        "response": "更新されたフィードバックへの返信です。",
        "next_note": "更新された次回調理時のメモです。"
    }
    
    response = client.put(
        f"/api/v1/feedback/{create_helper_response.feedback_id}/response", 
        json=update_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["feedback_id"] == create_helper_response.feedback_id
    assert data["helper_id"] == create_test_helper.id
    assert data["response"] == update_data["response"]
    assert data["next_note"] == update_data["next_note"]
    assert "updated_at" in data

@pytest.mark.asyncio
async def test_partial_update_helper_response(
    client, helper_token, create_helper_response
):
    """ヘルパー返信の部分的な更新ができることをテスト"""
    headers = {"Authorization": f"Bearer {helper_token}"}
    
    # オリジナルの返信内容を記録
    original_response = create_helper_response.response
    
    update_data = {
        "next_note": "次回調理時のメモのみ更新します"
    }
    
    response = client.put(
        f"/api/v1/feedback/{create_helper_response.feedback_id}/response", 
        json=update_data, 
        headers=headers
    )
    
    assert response.status_code == status.HTTP_200_OK
    
    data = response.json()
    assert data["next_note"] == update_data["next_note"]
    assert data["response"] == original_response  # 変更されていないことを確認
```
