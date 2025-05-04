# パフォーマンス最適化とセキュリティ強化の追加提案

## 1. キャッシュ自動無効化機能

キャッシュの自動無効化は、データの一貫性を維持するために重要な機能です。以下に実装の提案を示します。

### 1.1 データ変更イベント駆動のキャッシュ無効化

```python
# app/core/cache_invalidation.py
from typing import List, Optional, Any, Type
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeMeta
from app.core.cache import delete_pattern, delete_cache

async def invalidate_cache_for_model(
    model_name: str,
    instance_id: Optional[int] = None,
    related_models: Optional[List[str]] = None
) -> None:
    """
    モデル関連のキャッシュを無効化
    
    Args:
        model_name: モデル名（例：'user', 'recipe_request'）
        instance_id: 特定のインスタンスID（指定がなければモデル全体）
        related_models: 関連して無効化すべきモデル名のリスト
    """
    # モデル全体のキャッシュを無効化
    model_pattern = f"{model_name}:*"
    await delete_pattern(model_pattern)
    
    # 特定インスタンスに関するキャッシュを無効化
    if instance_id:
        instance_pattern = f"*:{model_name}:{instance_id}:*"
        await delete_pattern(instance_pattern)
    
    # 関連モデルのキャッシュも無効化
    if related_models:
        for related_model in related_models:
            await delete_pattern(f"{related_model}:*")

class CacheInvalidationManager:
    """キャッシュ無効化を管理するクラス"""
    
    # モデル間の依存関係マップ
    MODEL_DEPENDENCIES = {
        "user": ["helper", "recipe_request", "task", "feedback"],
        "helper": ["user"],
        "recipe_request": ["feedback"],
        "feedback": ["helper_response"],
        "tag": ["recipe_request"],
    }
    
    @classmethod
    async def invalidate_on_create(cls, model_name: str, instance_id: int) -> None:
        """
        作成イベント時のキャッシュ無効化
        
        Args:
            model_name: モデル名
            instance_id: 作成されたインスタンスのID
        """
        related_models = cls.MODEL_DEPENDENCIES.get(model_name, [])
        await invalidate_cache_for_model(model_name, instance_id, related_models)
    
    @classmethod
    async def invalidate_on_update(cls, model_name: str, instance_id: int) -> None:
        """
        更新イベント時のキャッシュ無効化
        
        Args:
            model_name: モデル名
            instance_id: 更新されたインスタンスのID
        """
        related_models = cls.MODEL_DEPENDENCIES.get(model_name, [])
        await invalidate_cache_for_model(model_name, instance_id, related_models)
    
    @classmethod
    async def invalidate_on_delete(cls, model_name: str, instance_id: int) -> None:
        """
        削除イベント時のキャッシュ無効化
        
        Args:
            model_name: モデル名
            instance_id: 削除されたインスタンスのID
        """
        related_models = cls.MODEL_DEPENDENCIES.get(model_name, [])
        await invalidate_cache_for_model(model_name, instance_id, related_models)
```

### 1.2 SQLAlchemyイベントリスナーとの統合

```python
# app/db/events.py
from sqlalchemy import event
from sqlalchemy.orm import Session
from app.core.cache_invalidation import CacheInvalidationManager
import asyncio

def setup_event_listeners():
    """SQLAlchemyイベントリスナーを設定"""
    from app.db.models.user import User
    from app.db.models.helper import Helper
    from app.db.models.recipe_request import RecipeRequest
    from app.db.models.feedback import Feedback
    
    # モデルとモデル名のマッピング
    model_mapping = {
        User: "user",
        Helper: "helper",
        RecipeRequest: "recipe_request",
        Feedback: "feedback",
    }
    
    # 各モデルに対してイベントリスナーを設定
    for model, model_name in model_mapping.items():
        # 作成後
        @event.listens_for(model, "after_insert")
        def after_insert(mapper, connection, target):
            asyncio.create_task(
                CacheInvalidationManager.invalidate_on_create(model_name, target.id)
            )
        
        # 更新後
        @event.listens_for(model, "after_update")
        def after_update(mapper, connection, target):
            asyncio.create_task(
                CacheInvalidationManager.invalidate_on_update(model_name, target.id)
            )
        
        # 削除後
        @event.listens_for(model, "after_delete")
        def after_delete(mapper, connection, target):
            asyncio.create_task(
                CacheInvalidationManager.invalidate_on_delete(model_name, target.id)
            )
```

### 1.3 CRUDレイヤーでの明示的なキャッシュ無効化

```python
# app/crud/recipe_requests.py (例)
from app.core.cache_invalidation import CacheInvalidationManager

async def update_recipe_request(
    db: AsyncSession, 
    db_obj: RecipeRequest,
    obj_in: RecipeRequestUpdate
) -> RecipeRequest:
    """料理リクエストを更新"""
    # 既存の更新ロジック...
    
    # データベースの更新
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # キャッシュの明示的な無効化
    await CacheInvalidationManager.invalidate_on_update("recipe_request", db_obj.id)
    
    return db_obj
```

## 2. 入力バリデーション強化

Pydanticスキーマを拡張し、より堅牢な入力バリデーションを実現します。

### 2.1 カスタムバリデータの導入

```python
# app/schemas/validators.py
import re
from datetime import date
from typing import Any, Dict, Optional
from pydantic import validator, root_validator

# URLのバリデーション
def validate_url(url: str) -> str:
    """安全なURLかどうかを検証"""
    allowed_schemes = ['http', 'https']
    url_pattern = re.compile(
        r'^(?:' + '|'.join(allowed_schemes) + r')://'  # スキーム
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # ドメイン
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IPアドレス
        r'(?::\d+)?'  # ポート
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        raise ValueError("無効なURL形式です")
    
    return url

# 日付のバリデーション
def validate_future_date(scheduled_date: Optional[date]) -> Optional[date]:
    """日付が未来の日付かどうかを検証"""
    if scheduled_date and scheduled_date < date.today():
        raise ValueError("日付は今日以降の日付である必要があります")
    
    return scheduled_date

# JSON構造の検証
def validate_recipe_content(recipe_content: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """レシピ内容の構造を検証"""
    if not recipe_content:
        return recipe_content
    
    required_keys = ["title", "ingredients", "steps"]
    for key in required_keys:
        if key not in recipe_content:
            raise ValueError(f"レシピ内容に必須キー '{key}' がありません")
    
    # 材料のフォーマット検証
    ingredients = recipe_content.get("ingredients", [])
    if not isinstance(ingredients, list):
        raise ValueError("材料は配列形式である必要があります")
    
    for ingredient in ingredients:
        if not isinstance(ingredient, dict) or "name" not in ingredient:
            raise ValueError("各材料には少なくとも 'name' フィールドが必要です")
    
    # 手順のフォーマット検証
    steps = recipe_content.get("steps", [])
    if not isinstance(steps, list):
        raise ValueError("手順は配列形式である必要があります")
    
    if len(steps) < 1:
        raise ValueError("少なくとも1つの手順が必要です")
    
    return recipe_content
```

### 2.2 スキーマへの適用

```python
# app/schemas/recipe_request.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date
from app.schemas.validators import validate_url, validate_future_date, validate_recipe_content

class RecipeRequestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="リクエストのタイトル")
    description: str = Field(..., min_length=1, description="リクエストの説明")
    recipe_url: Optional[str] = Field(None, description="レシピのURL（クックパッド等）")
    notes: Optional[str] = Field(None, description="特記事項（アレルギー対応等）")
    priority: int = Field(0, ge=0, le=5, description="優先度（0-5）")
    scheduled_date: Optional[date] = Field(None, description="予定日")
    
    # URLバリデーション
    _validate_url = validator('recipe_url', allow_reuse=True)(validate_url)
    
    # 日付バリデーション
    _validate_date = validator('scheduled_date', allow_reuse=True)(validate_future_date)

class RecipeRequestCreate(RecipeRequestBase):
    tags: List[str] = Field([], description="タグのリスト")

class RecipeRequestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    recipe_url: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = Field(None, ge=0, le=5)
    scheduled_date: Optional[date] = None
    recipe_content: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    
    # URLバリデーション
    _validate_url = validator('recipe_url', allow_reuse=True)(validate_url)
    
    # 日付バリデーション
    _validate_date = validator('scheduled_date', allow_reuse=True)(validate_future_date)
    
    # レシピ内容のバリデーション
    _validate_recipe_content = validator('recipe_content', allow_reuse=True)(validate_recipe_content)
    
    class Config:
        validate_assignment = True
```

### 2.3 APIエンドポイントでのバリデーション強化

```python
# app/api/v1/endpoints/recipe_requests.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.schemas.recipe_request import RecipeRequestCreate, RecipeRequestResponse
from app.services.recipe_service import create_recipe_request, get_recipe_requests

router = APIRouter()

@router.get("/", response_model=List[RecipeRequestResponse])
async def get_recipe_requests_endpoint(
    skip: int = Query(0, ge=0, description="スキップする結果数"),
    limit: int = Query(100, ge=1, le=100, description="取得する結果の最大数"),
    status: Optional[str] = Query(
        None, 
        description="ステータスでフィルタリング",
        regex="^(requested|in_progress|completed|cancelled)$"
    ),
    priority: Optional[int] = Query(None, ge=0, le=5, description="優先度でフィルタリング"),
    scheduled_from: Optional[date] = Query(None, description="この日付以降の予定"),
    scheduled_to: Optional[date] = Query(None, description="この日付以前の予定"),
    search: Optional[str] = Query(None, min_length=2, description="タイトルと説明で検索"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    料理リクエスト一覧を取得
    """
    # 日付の整合性チェック
    if scheduled_from and scheduled_to and scheduled_from > scheduled_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="開始日は終了日より前の日付にしてください"
        )
    
    results = await get_recipe_requests(
        db, 
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        scheduled_from=scheduled_from,
        scheduled_to=scheduled_to,
        search=search
    )
    
    return results
```

## 3. パスワードポリシーの実装

セキュリティを強化するためのパスワードポリシーを実装します。

### 3.1 パスワードポリシー定義

```python
# app/core/security.py
import re
from typing import Dict, Any
from pydantic import BaseModel, validator

class PasswordPolicy:
    """パスワードポリシーを定義するクラス"""
    
    # 最小長
    MIN_LENGTH = 8
    
    # 最大長
    MAX_LENGTH = 64
    
    # 必要な文字種類の数
    MIN_CHAR_TYPES = 3
    
    # 共通パスワードリスト（実際の実装ではより大きなリストが必要）
    COMMON_PASSWORDS = ["password", "123456", "qwerty", "admin", "welcome"]
    
    @classmethod
    def validate(cls, password: str) -> Dict[str, Any]:
        """
        パスワードを検証し、結果を返す
        
        Args:
            password: 検証するパスワード
            
        Returns:
            Dict[str, Any]: 検証結果
                {
                    "valid": bool,  # 有効かどうか
                    "errors": List[str]  # エラーメッセージのリスト
                }
        """
        errors = []
        
        # 長さチェック
        if len(password) < cls.MIN_LENGTH:
            errors.append(f"パスワードは{cls.MIN_LENGTH}文字以上である必要があります")
        
        if len(password) > cls.MAX_LENGTH:
            errors.append(f"パスワードは{cls.MAX_LENGTH}文字以下である必要があります")
        
        # 文字種類のチェック
        char_types = 0
        if re.search(r'[a-z]', password):
            char_types += 1
        if re.search(r'[A-Z]', password):
            char_types += 1
        if re.search(r'\d', password):
            char_types += 1
        if re.search(r'[^a-zA-Z\d]', password):
            char_types += 1
        
        if char_types < cls.MIN_CHAR_TYPES:
            errors.append(
                f"パスワードには少なくとも{cls.MIN_CHAR_TYPES}種類の文字（小文字、大文字、数字、特殊文字）を含める必要があります"
            )
        
        # 共通パスワードチェック
        if password.lower() in cls.COMMON_PASSWORDS:
            errors.append("このパスワードは一般的すぎるため使用できません")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }

class PasswordChangeRequest(BaseModel):
    """パスワード変更リクエスト"""
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        """新しいパスワードをポリシーに基づいて検証"""
        result = PasswordPolicy.validate(v)
        if not result["valid"]:
            raise ValueError("\n".join(result["errors"]))
        return v

class PasswordResetConfirm(BaseModel):
    """パスワードリセット確認"""
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        """新しいパスワードをポリシーに基づいて検証"""
        result = PasswordPolicy.validate(v)
        if not result["valid"]:
            raise ValueError("\n".join(result["errors"]))
        return v
```

### 3.2 パスワードポリシーの適用

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from app.core.security import PasswordPolicy

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        """パスワードポリシーによるバリデーション"""
        result = PasswordPolicy.validate(v)
        if not result["valid"]:
            raise ValueError("\n".join(result["errors"]))
        return v

# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate
from app.services.user_service import create_user, get_user_by_email, get_user_by_username
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """新規ユーザー登録"""
    # メールアドレスの重複チェック
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています"
        )
    
    # ユーザー名の重複チェック
    existing_user = await get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このユーザー名は既に使用されています"
        )
    
    # パスワードポリシーの確認は既にスキーマで検証済み
    
    # ユーザーの作成
    hashed_password = get_password_hash(user_in.password)
    user_data = user_in.dict(exclude={"password"})
    user_data["hashed_password"] = hashed_password
    
    return await create_user(db, user_data)
```

### 3.3 パスワード変更・リセットAPIの実装

```python
# app/api/v1/endpoints/auth.py (続き)
from app.core.security import PasswordChangeRequest, PasswordResetConfirm, verify_password

@router.post("/password-change")
async def change_password(
    password_data: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """パスワード変更"""
    # 現在のパスワードを検証
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="現在のパスワードが正しくありません"
        )
    
    # 新しいパスワードと現在のパスワードが同じでないことを確認
    if verify_password(password_data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="新しいパスワードは現在のパスワードと異なる必要があります"
        )
    
    # パスワードの更新
    hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = hashed_password
    db.add(current_user)
    await db.commit()
    
    return {"message": "パスワードが正常に更新されました"}

@router.post("/password-reset-confirm")
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """パスワードリセットの確認"""
    # トークンの検証
    try:
        payload = jwt.decode(
            reset_data.token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="無効または期限切れのトークンです"
        )
    
    # ユーザーの取得
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )
    
    # パスワードの更新
    hashed_password = get_password_hash(reset_data.new_password)
    user.hashed_password = hashed_password
    db.add(user)
    await db.commit()
    
    return {"message": "パスワードが正常にリセットされました"}
```

## 4. 実装時の推奨事項

### 4.1 キャッシュ自動無効化

1. データモデル間の依存関係マップをプロジェクト初期に定義し、変更時に更新する
2. 頻繁に変更されるデータのキャッシュに対しては短い有効期限を設定する
3. キャッシュ無効化の粒度を適切に設定し、必要以上のキャッシュを無効化しないようにする
4. デバッグログを追加して、キャッシュの無効化が正しく行われていることを確認できるようにする

### 4.2 入力バリデーション

1. ドメイン固有のバリデーションルールを適切に定義する
2. すべてのユーザー入力に対してバリデーションを適用する
3. バリデーションエラーメッセージはユーザーフレンドリーで具体的なものにする
4. カスタムバリデータはユニットテストで徹底的にテストする

### 4.3 パスワードポリシー

1. パスワード強度の要件はユーザーに明示的に表示する
2. 定期的なパスワード変更を強制するか検討する（最近のベストプラクティスでは推奨されないこともある）
3. パスワード履歴を保持して、以前使用されたパスワードの再使用を防止することを検討する
4. 二要素認証（2FA）の導入を検討する

これらの追加機能を実装することで、システムのパフォーマンスとセキュリティが大幅に向上し、より堅牢なアプリケーションとなります。
