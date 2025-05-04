# ユーザー一覧取得エンドポイント テストシナリオ（管理者用）

## エンドポイント情報
- **URL**: `/api/v1/users`
- **メソッド**: GET
- **認証**: 管理者権限必須

## テストシナリオ

### 1. 正常系: 管理者によるユーザー一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 複数のユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/users
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 全ユーザーのリストが返される
- パスワードハッシュはレスポンスに含まれない
- ユーザーごとに基本情報（ID、ユーザー名、メール、ロールなど）が含まれる

### 2. 正常系: ページネーションを利用したユーザー一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 多数のユーザー（20人以上）をデータベースに追加

**リクエスト**:
```
GET /api/v1/users?skip=5&limit=10
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したオフセットと制限に基づいたユーザーリストが返される
- 返されるユーザー数が10以下である

### 3. 正常系: 検索条件を指定したユーザー一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 様々な属性を持つユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/users?search=test&role=user
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 検索条件に一致するユーザーのみが返される
- 返されるユーザーはすべて "test" を含む名前またはメールアドレスを持ち、ロールが "user" である

### 4. 異常系: 一般ユーザーによるアクセス
**準備**:
- 一般ユーザー（管理者でない）と認証トークンを用意

**リクエスト**:
```
GET /api/v1/users
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "権限がありません"

### 5. 異常系: 認証なしでのアクセス
**リクエスト**:
```
GET /api/v1/users
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "認証されていません"

### 6. 正常系: 空のユーザーリスト
**準備**:
- 管理者ユーザーと認証トークンを用意
- データベースからユーザーを削除（管理者ユーザー以外）

**リクエスト**:
```
GET /api/v1/users
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 空のユーザーリストまたは管理者ユーザーのみを含むリストが返される

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_users_admin(client, admin_token, create_test_users):
    # 管理者としてユーザー一覧を取得
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5  # テストユーザーが少なくとも5人いることを前提
    
    # 返されるユーザー情報の検証
    for user in data:
        assert "id" in user
        assert "username" in user
        assert "email" in user
        assert "role" in user
        assert "password" not in user
        assert "hashed_password" not in user

@pytest.mark.asyncio
async def test_get_users_pagination(client, admin_token, create_test_users):
    # ページネーションを使用してユーザー一覧を取得
    response = client.get(
        "/api/v1/users?skip=2&limit=3",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3  # limit=3なので最大3ユーザー

@pytest.mark.asyncio
async def test_get_users_forbidden(client, user_token):
    # 一般ユーザーとしてアクセス（禁止）
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "権限がありません" in response.json()["detail"]
```

## 注意点
- 管理者権限の検証が適切に行われているか確認
- ページネーションが正しく機能しているか確認
- 検索フィルターが正しく適用されているか確認
- パスワード関連の情報がレスポンスに含まれていないことを確認
- 大量のユーザーデータがある場合のパフォーマンスを確認
- アクセスが監査ログに記録されているか確認
