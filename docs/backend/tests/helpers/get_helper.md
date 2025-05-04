# 特定ヘルパー情報取得エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/helpers/{helper_id}`
- **メソッド**: GET
- **認証**: 管理者または担当ユーザー権限必須

## テストシナリオ

### 1. 正常系: 管理者による特定ヘルパー情報取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 取得対象のヘルパーをデータベースに追加

**リクエスト**:
```
GET /api/v1/helpers/123
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したヘルパーの詳細情報が返される
- 関連するユーザー情報も含まれる
- 稼働曜日、専門分野、資格情報などの全情報が含まれる

### 2. 正常系: 担当ユーザーによるヘルパー情報取得
**準備**:
- 一般ユーザーと認証トークンを用意
- 取得対象のヘルパーをデータベースに追加
- ヘルパーと対象ユーザーの担当関係を設定

**リクエスト**:
```
GET /api/v1/helpers/123
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したヘルパーの情報が返される
- ユーザーに必要な情報が適切に表示される

### 3. 異常系: 担当関係にないユーザーによるアクセス
**準備**:
- 一般ユーザーと認証トークンを用意
- 取得対象のヘルパーをデータベースに追加
- ヘルパーと対象ユーザーの間に担当関係がない状態を確認

**リクエスト**:
```
GET /api/v1/helpers/123
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "このヘルパー情報にアクセスする権限がありません"

### 4. 異常系: 存在しないヘルパーID
**準備**:
- 管理者ユーザーと認証トークンを用意
- 存在しないヘルパーIDを用意

**リクエスト**:
```
GET /api/v1/helpers/999
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 404
- エラーメッセージ: "ヘルパーが見つかりません"

### 5. 異常系: 無効なヘルパーID形式
**リクエスト**:
```
GET /api/v1/helpers/invalid
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_helper_by_admin(client, admin_token, create_test_helpers):
    # ヘルパー情報を取得
    helper_id = 1  # テスト用ヘルパーのID（テストデータで存在することを前提）
    
    response = client.get(
        f"/api/v1/helpers/{helper_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == helper_id
    assert "certification" in data
    assert "specialties" in data
    assert "introduction" in data
    assert "working_days" in data
    assert "user" in data
    assert data["user"]["username"] is not None

@pytest.mark.asyncio
async def test_get_helper_by_assigned_user(client, user_token, test_user, test_db):
    # 事前に担当関係を設定
    from app.db.models.user_helper_assignment import UserHelperAssignment
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    # ヘルパー情報を取得
    result = await test_db.execute(select(Helper).limit(1))
    helper = result.scalar_one()
    
    # 担当関係を作成
    assignment = UserHelperAssignment(
        user_id=test_user["id"],
        helper_id=helper.id,
        is_primary=True
    )
    test_db.add(assignment)
    await test_db.commit()
    
    # 担当ユーザーとしてヘルパー情報を取得
    response = client.get(
        f"/api/v1/helpers/{helper.id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == helper.id
    assert "certification" in data
    assert "specialties" in data

@pytest.mark.asyncio
async def test_get_helper_by_unassigned_user(client, user_token, test_db):
    # ヘルパー情報を取得
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    result = await test_db.execute(select(Helper).limit(1))
    helper = result.scalar_one()
    
    # 担当関係にないユーザーとしてヘルパー情報を取得
    response = client.get(
        f"/api/v1/helpers/{helper.id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "このヘルパー情報にアクセスする権限がありません" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_nonexistent_helper(client, admin_token):
    # 存在しないヘルパーIDでアクセス
    response = client.get(
        "/api/v1/helpers/999",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "ヘルパーが見つかりません" in response.json()["detail"]
```

## 注意点
- 管理者権限の検証が適切に行われているか確認
- ユーザーとヘルパーの担当関係の検証が適切に行われているか確認
- 存在しないヘルパーIDに対する適切なエラー処理を確認
- ユーザーの権限に応じて適切な情報が返されるか確認
- ヘルパー情報取得が監査ログに記録されているか確認
