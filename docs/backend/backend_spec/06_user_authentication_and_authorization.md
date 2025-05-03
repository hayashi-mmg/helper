## 6. ユーザー認証と認可

### 6.1 JWT認証の実装

```python
# app/core/auth.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.crud.users import get_user_by_username
from app.db.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """アクセストークンを作成"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """リフレッシュトークンを作成"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """現在のユーザーを取得"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無効な認証情報",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    
    user = await get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="無効なユーザー")
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """アクティブなユーザーを取得"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="無効なユーザー")
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """管理者ユーザーを取得"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )
    return current_user

async def get_current_helper_user(current_user: User = Depends(get_current_user)) -> User:
    """ヘルパーユーザーを取得"""
    if current_user.role != "helper" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )
    return current_user
```

### 6.2 認可ミドルウェア

```python
# app/api/v1/dependencies.py
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.auth import get_current_user
from app.db.models.user import User
from app.crud.helpers import get_user_helpers
from app.crud.recipe_requests import get_recipe_request
from app.db.models.recipe_request import RecipeRequest

async def check_recipe_request_access(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> RecipeRequest:
    """
    ユーザーがレシピリクエストにアクセスする権限があるか確認
    - ユーザー自身のリクエスト
    - 担当ヘルパーのリクエスト
    - 管理者
    """
    recipe_request = await get_recipe_request(db, request_id)
    if not recipe_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="レシピリクエストが見つかりません"
        )
    
    # 自分のリクエストか管理者の場合はアクセス許可
    if recipe_request.user_id == current_user.id or current_user.role == "admin":
        return recipe_request
    
    # ヘルパーの場合は、担当ユーザーのリクエストかチェック
    if current_user.role == "helper":
        assigned_users = await get_assigned_users_for_helper(db, current_user.id)
        if recipe_request.user_id in [user.id for user in assigned_users]:
            return recipe_request
    
    # それ以外はアクセス拒否
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="このリクエストにアクセスする権限がありません"
    )
```

