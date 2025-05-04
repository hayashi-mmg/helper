# ヘルパー自身の情報取得・更新エンドポイント テストシナリオ

## エンドポイント情報

### ヘルパー自身の情報取得
- **URL**: `/api/v1/helpers/me`
- **メソッド**: GET
- **認証**: ヘルパー権限必須

### ヘルパー自身の情報更新
- **URL**: `/api/v1/helpers/me`
- **メソッド**: PUT
- **認証**: ヘルパー権限必須

## テストシナリオ（GET）

### 1. 正常系: ヘルパーユーザーによる自身の情報取得
**準備**:
- ヘルパーユーザーと認証トークンを用意

**リクエスト**:
```
GET /api/v1/helpers/me
Authorization: Bearer {helper_token}
```

**期待される結果**:
- ステータスコード: 200
- ヘルパーの詳細情報が返される
- 関連するユーザー情報も含まれる
- 稼働曜日、専門分野、資格情報などが含まれる

### 2. 異常系: 一般ユーザー（ヘルパーでない）によるアクセス
**準備**:
- 一般ユーザー（ヘルパーでない）と認証トークンを用意

**リクエスト**:
```
GET /api/v1/helpers/me
Authorization: Bearer {user_token}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "権限がありません"

### 3. 異常系: 認証なしでのアクセス
**リクエスト**:
```
GET /api/v1/helpers/me
```

**期待される結果**:
- ステータスコード: 401
- エラーメッセージ: "認証されていません"

## テストシナリオ（PUT）

### 1. 正常系: ヘルパーの基本情報更新
**準備**:
- ヘルパーユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "certification": "介護福祉士・調理師",
    "specialties": ["和食", "イタリアン", "介護食"],
    "introduction": "新しい自己紹介文です。"
}
```

**期待される結果**:
- ステータスコード: 200
- 更新されたヘルパー情報が返される
- 指定したフィールドが更新されている

### 2. 正常系: 稼働曜日情報の更新
**準備**:
- ヘルパーユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "working_days": {
        "monday": {"available": true, "hours": "9:00-17:00"},
        "tuesday": {"available": true, "hours": "9:00-17:00"},
        "wednesday": {"available": false, "hours": ""},
        "thursday": {"available": true, "hours": "9:00-17:00"},
        "friday": {"available": true, "hours": "9:00-17:00"},
        "saturday": {"available": false, "hours": ""},
        "sunday": {"available": false, "hours": ""}
    }
}
```

**期待される結果**:
- ステータスコード: 200
- 更新された稼働曜日情報が返される

### 3. 正常系: 複数フィールドの同時更新
**準備**:
- ヘルパーユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "certification": "更新された資格情報",
    "specialties": ["和食", "中華", "フレンチ"],
    "introduction": "更新された自己紹介",
    "working_days": {
        "monday": {"available": true, "hours": "10:00-18:00"}
    }
}
```

**期待される結果**:
- ステータスコード: 200
- すべての指定フィールドが更新されている

### 4. 異常系: 一般ユーザー（ヘルパーでない）による更新
**準備**:
- 一般ユーザー（ヘルパーでない）と認証トークンを用意

**リクエスト**:
```json
{
    "certification": "介護福祉士",
    "specialties": ["和食"]
}
```

**期待される結果**:
- ステータスコード: 403
- エラーメッセージ: "権限がありません"

### 5. 異常系: 無効なデータ形式
**準備**:
- ヘルパーユーザーと認証トークンを用意

**リクエスト**:
```json
{
    "working_days": "月曜から金曜"  // オブジェクト形式ではない
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
async def test_get_helper_me(client, helper_token, helper_user):
    # ヘルパーとして自分の情報を取得
    response = client.get(
        "/api/v1/helpers/me",
        headers={"Authorization": f"Bearer {helper_token}"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["user_id"] == helper_user["id"]
    assert "certification" in data
    assert "specialties" in data
    assert "introduction" in data
    assert "working_days" in data
    assert "user" in data
    assert data["user"]["username"] == helper_user["username"]

@pytest.mark.asyncio
async def test_get_helper_me_not_helper(client, user_token):
    # 一般ユーザー（ヘルパーでない）として自分のヘルパー情報を取得しようとする
    response = client.get(
        "/api/v1/helpers/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "権限がありません" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_helper_information(client, helper_token, helper_user, test_db):
    # ヘルパー情報を更新
    update_data = {
        "certification": "介護福祉士・調理師",
        "specialties": ["和食", "イタリアン", "介護食"],
        "introduction": "新しい自己紹介文です。"
    }
    
    response = client.put(
        "/api/v1/helpers/me",
        headers={"Authorization": f"Bearer {helper_token}"},
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["certification"] == update_data["certification"]
    assert data["specialties"] == update_data["specialties"]
    assert data["introduction"] == update_data["introduction"]
    
    # データベースで更新を確認
    from app.db.models.helper import Helper
    from sqlalchemy.future import select
    
    result = await test_db.execute(select(Helper).filter(Helper.user_id == helper_user["id"]))
    helper = result.scalar_one()
    
    assert helper.certification == update_data["certification"]
    assert helper.specialties == update_data["specialties"]
    assert helper.introduction == update_data["introduction"]

@pytest.mark.asyncio
async def test_update_working_days(client, helper_token, helper_user):
    # 稼働曜日情報を更新
    update_data = {
        "working_days": {
            "monday": {"available": True, "hours": "9:00-17:00"},
            "tuesday": {"available": True, "hours": "9:00-17:00"},
            "wednesday": {"available": False, "hours": ""},
            "thursday": {"available": True, "hours": "9:00-17:00"},
            "friday": {"available": True, "hours": "9:00-17:00"},
            "saturday": {"available": False, "hours": ""},
            "sunday": {"available": False, "hours": ""}
        }
    }
    
    response = client.put(
        "/api/v1/helpers/me",
        headers={"Authorization": f"Bearer {helper_token}"},
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["working_days"] == update_data["working_days"]
```

## 注意点
- ヘルパー権限の検証が適切に行われているか確認
- 更新操作が適切にデータベースに反映されるか確認
- JSONフィールド（working_days など）の更新が正しく処理されるか確認
- バリデーションが適切に機能しているか確認
- 情報取得・更新操作が監査ログに記録されているか確認
