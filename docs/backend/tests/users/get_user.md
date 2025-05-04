# 特定ユーザー情報取得エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/users/{user_id}`
- **メソッド**: GET
- **認証**: 管理者または担当ヘルパー

## テストシナリオ

### 1. 正常系: 管理者による特定ユーザー情報取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 取得対象の一般ユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/users/123
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したユーザーの詳細情報が返される
- パスワードハッシュはレスポンスに含まれない

### 2. 正常系: 担当ヘルパーによる担当ユーザー情報取得
**準備**:
- ヘルパーユーザーと認証トークンを用意
- 取得対象のユーザーをデータベースに追加
- ヘルパーと対象ユーザーの担当関係を設定

**リクエスト**:
```
GET /api/v1/users/123
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したユーザーの情報が返される
- パスワードハッシュはレスポンスに含まれない

### 3. 異常系: 担当関係にないヘルパーによるアクセス
**準備**:
- ヘルパーユーザーと認証トークンを用意
- 取得対象の一般ユーザーをデータベースに追加
- ヘルパーと対象ユーザーの間に担当関係がない状態を確認

**リクエスト**:
```
GET /api/v1/users/123
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "このユーザー情報にアクセスする権限がありません"

### 4. 異常系: 一般ユーザーによる他ユーザー情報アクセス
**準備**:
- 一般ユーザーと認証トークンを用意
- 取得対象の他の一般ユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/users/123
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "権限がありません"

### 5. 異常系: 存在しないユーザーID
**準備**:
- 管理者ユーザーと認証トークンを用意
- 存在しないユーザーIDを用意

**リクエスト**:
```
GET /api/v1/users/999
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 404
- エラーメッセージ: "ユーザーが見つかりません"

### 6. 異常系: 無効なユーザーID形式
**リクエスト**:
```
GET /api/v1/users/invalid
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
async def test_get_user_by_admin(client, admin_token, test_user):
    # 管理者として特定ユーザーの情報を取得
    response = client.get(
        f"/api/v1/users/{test_user['id']}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user["id"]
    assert data["username"] == test_user["username"]
    assert data["email"] == test_user["email"]
    assert "password" not in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_get_user_by_assigned_helper(client, helper_token, test_user, test_db):
    # 事前に担当関係を設定
    from app.db.models.user_helper_assignment import UserHelperAssignment
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    # ヘルパー情報を取得
    result = await test_db.execute(
        select(Helper).join(Helper.user).filter(Helper.user.has(username="testhelper"))
    )
    helper = result.scalar_one()
    
    # 担当関係を作成
    assignment = UserHelperAssignment(
        user_id=test_user["id"],
        helper_id=helper.id,
        is_primary=True
    )
    test_db.add(assignment)
    await test_db.commit()
    
    # 担当ヘルパーとしてユーザー情報を取得
    response = client.get(
        f"/api/v1/users/{test_user['id']}",
        headers={"Authorization": f"Bearer {helper_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user["id"]
    assert data["username"] == test_user["username"]

@pytest.mark.asyncio
async def test_get_user_by_unassigned_helper(client, helper_token, test_user):
    # 担当関係にないヘルパーとしてユーザー情報を取得
    response = client.get(
        f"/api/v1/users/{test_user['id']}",
        headers={"Authorization": f"Bearer {helper_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "このユーザー情報にアクセスする権限がありません" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_nonexistent_user(client, admin_token):
    # 存在しないユーザーIDでアクセス
    response = client.get(
        "/api/v1/users/999",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "ユーザーが見つかりません" in response.json()["detail"]
```

## 注意点
- 管理者権限の検証が適切に行われているか確認
- ヘルパーユーザーの担当関係の検証が適切に行われているか確認
- 存在しないユーザーIDに対する適切なエラー処理を確認
- パスワード関連の情報がレスポンスに含まれていないことを確認
- ユーザー情報取得が監査ログに記録されているか確認
