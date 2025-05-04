# ヘルパー一覧取得エンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/helpers`
- **メソッド**: GET
- **認証**: JWT認証必須

## テストシナリオ

### 1. 正常系: 一般ユーザーによるヘルパー一覧取得
**準備**:
- 一般ユーザーと認証トークンを用意
- 複数のヘルパーユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/helpers
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 全ヘルパーのリストが返される
- 各ヘルパーの基本情報（ID、名前、資格、専門分野など）が含まれる
- ヘルパーに関連付けられたユーザー情報も適切に含まれる

### 2. 正常系: 管理者によるヘルパー一覧取得
**準備**:
- 管理者ユーザーと認証トークンを用意
- 複数のヘルパーユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/helpers
Authorization: Bearer {admin_token}
```

**期待される結果**:
- ステータスコード: 200
- 全ヘルパーのリストが返される
- 各ヘルパーの詳細情報が含まれる
- 管理者に表示される追加情報（稼働曜日、連絡先など）が含まれる

### 3. 正常系: ページネーションを利用したヘルパー一覧取得
**準備**:
- 認証済みユーザーと認証トークンを用意
- 多数のヘルパーユーザー（20人以上）をデータベースに追加

**リクエスト**:
```
GET /api/v1/helpers?skip=5&limit=10
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 指定したオフセットと制限に基づいたヘルパーリストが返される
- 返されるヘルパー数が10以下である

### 4. 正常系: 検索条件を指定したヘルパー一覧取得
**準備**:
- 認証済みユーザーと認証トークンを用意
- 様々な属性を持つヘルパーユーザーをデータベースに追加

**リクエスト**:
```
GET /api/v1/helpers?specialty=和食&certification=介護福祉士
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 検索条件に一致するヘルパーのみが返される
- 返されるヘルパーはすべて専門分野に「和食」を含み、「介護福祉士」の資格を持つ

### 5. 異常系: 認証なしでのアクセス
**リクエスト**:
```
GET /api/v1/helpers
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "認証されていません"

### 6. 正常系: ヘルパーが存在しない場合
**準備**:
- 認証済みユーザーと認証トークンを用意
- データベースからすべてのヘルパーを削除

**リクエスト**:
```
GET /api/v1/helpers
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 200
- 空のヘルパーリストが返される

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_get_helpers_user(client, user_token, create_test_helpers):
    # 一般ユーザーとしてヘルパー一覧を取得
    response = client.get(
        "/api/v1/helpers",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3  # テストヘルパーが少なくとも3人いることを前提
    
    # 返されるヘルパー情報の検証
    for helper in data:
        assert "id" in helper
        assert "user_id" in helper
        assert "certification" in helper
        assert "specialties" in helper
        assert "user" in helper
        assert helper["user"]["username"] is not None
        assert "password" not in helper["user"]
        assert "hashed_password" not in helper["user"]

@pytest.mark.asyncio
async def test_get_helpers_admin(client, admin_token, create_test_helpers):
    # 管理者としてヘルパー一覧を取得
    response = client.get(
        "/api/v1/helpers",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # 管理者には追加情報が表示されることを確認
    for helper in data:
        assert "working_days" in helper
        assert "introduction" in helper

@pytest.mark.asyncio
async def test_get_helpers_pagination(client, user_token, create_test_helpers):
    # ページネーションを使用してヘルパー一覧を取得
    response = client.get(
        "/api/v1/helpers?skip=1&limit=2",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 2  # limit=2なので最大2ヘルパー

@pytest.mark.asyncio
async def test_get_helpers_search(client, user_token, create_test_helpers):
    # 検索条件を指定してヘルパー一覧を取得
    response = client.get(
        "/api/v1/helpers?specialty=和食",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # 「和食」を専門とするヘルパーのみが返されることを確認
    for helper in data:
        assert "和食" in helper["specialties"]
```

## 注意点
- 認証の検証が適切に行われているか確認
- ページネーションが正しく機能しているか確認
- 検索フィルターが正しく適用されているか確認
- ユーザーの権限に応じて適切な情報が返されるか確認
- センシティブな情報がレスポンスに含まれていないことを確認
- 多数のヘルパーデータがある場合のパフォーマンスを確認
