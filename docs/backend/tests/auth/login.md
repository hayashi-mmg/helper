# ログインエンドポイント テストシナリオ

## エンドポイント情報
- **URL**: `/api/v1/auth/login`
- **メソッド**: POST
- **認証**: 不要

## テストシナリオ

### 1. 正常系: 有効な認証情報でのログイン
**準備**:
- 有効なユーザーがデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "username": "validuser",
    "password": "validpassword"
}
```

**期待される結果**:
- ステータスコード: 200
- レスポンスボディにアクセストークン、リフレッシュトークン、ユーザー情報が含まれる
- トークンが適切な形式である
- ユーザー情報が正確である

### 2. 異常系: 存在しないユーザー名
**リクエスト**:
```json
{
    "username": "nonexistentuser",
    "password": "anypassword"
}
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "ユーザー名またはパスワードが正しくありません"

### 3. 異常系: 間違ったパスワード
**準備**:
- 有効なユーザーがデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "username": "validuser",
    "password": "wrongpassword"
}
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "ユーザー名またはパスワードが正しくありません"

### 4. 異常系: 無効なユーザー（アカウント停止中）
**準備**:
- is_active = False のユーザーがデータベースに存在する状態を作成

**リクエスト**:
```json
{
    "username": "inactiveuser",
    "password": "validpassword"
}
```

**期待される結果**:
- ステータスコード: 400
- エラーメッセージ: "無効なユーザー"

### 5. 異常系: 空のリクエスト
**リクエスト**:
```json
{}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

### 6. 異常系: パスワードのみが欠けている
**リクエスト**:
```json
{
    "username": "validuser"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

### 7. 異常系: ユーザー名のみが欠けている
**リクエスト**:
```json
{
    "password": "validpassword"
}
```

**期待される結果**:
- ステータスコード: 422
- バリデーションエラーメッセージ

## テスト実装コード例

```python
import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    # 有効なユーザーでログイン
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user["username"], 
            "password": "testpassword"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert "refresh_token" in data
    assert "user" in data
    assert data["user"]["username"] == test_user["username"]

@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    # 間違ったパスワードでログイン
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user["username"], 
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

## 注意点
- パスワードのハッシュ化が正しく行われているか確認
- トークンが適切な有効期限で生成されているか確認
- ユーザーの状態（アクティブ/非アクティブ）が適切に検証されているか確認
- ログイン試行が監査ログに記録されているか確認
