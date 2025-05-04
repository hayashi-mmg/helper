"""
アクセス制御ミドルウェア
"""
from enum import Enum
from typing import Callable, Dict, List, Optional
from fastapi import Request, HTTPException, Depends
from starlette.status import HTTP_403_FORBIDDEN
from app.dependencies import get_current_user
from app.db.models.users import User

class Role(str, Enum):
    """ユーザーロール定義"""
    ADMIN = "admin"
    HELPER = "helper"
    USER = "user"

class Permission(str, Enum):
    """アクセス権限定義"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"

# リソースごとの権限マトリックス
PERMISSION_MATRIX: Dict[str, Dict[Role, List[Permission]]] = {
    "users": {
        Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
        Role.HELPER: [Permission.READ],
        Role.USER: [Permission.READ]
    },
    "helpers": {
        Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
        Role.HELPER: [Permission.READ, Permission.WRITE],
        Role.USER: [Permission.READ]
    },
    "recipe_requests": {
        Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
        Role.HELPER: [Permission.READ, Permission.WRITE],
        Role.USER: [Permission.READ, Permission.WRITE]
    },
    "tasks": {
        Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
        Role.HELPER: [Permission.READ, Permission.WRITE],
        Role.USER: [Permission.READ, Permission.WRITE]
    },
    "feedback": {
        Role.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
        Role.HELPER: [Permission.READ],
        Role.USER: [Permission.READ, Permission.WRITE]
    },
}

def has_permission(
    resource: str,
    permission: Permission,
    owner_id_field: str = None
) -> Callable:
    """
    指定されたリソースに対する権限があるかチェックする依存関数
    
    Args:
        resource: リソース名（users, helpers, recipe_requestsなど）
        permission: 必要な権限（READ, WRITE, DELETE, ADMIN）
        owner_id_field: リソースの所有者IDをどのパラメータ名で受け取るか
    
    Returns:
        Callable: FastAPI依存関数
    """
    async def check_permission(
        request: Request,
        current_user: User = Depends(get_current_user)
    ) -> bool:
        # 管理者は全てのリソースにアクセス可能
        if current_user.role == Role.ADMIN:
            return True
        
        # リソースの権限マトリックスが存在しない場合
        if resource not in PERMISSION_MATRIX:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, 
                detail=f"リソース '{resource}' の権限定義がありません"
            )
        
        # リソースに対するユーザーロールの権限が定義されていない場合
        user_role = Role(current_user.role)
        if user_role not in PERMISSION_MATRIX[resource]:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, 
                detail="このリソースにアクセスする権限がありません"
            )
        
        # ユーザーがリソースに対する指定された権限を持っているか
        if permission not in PERMISSION_MATRIX[resource][user_role]:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN, 
                detail=f"この操作を実行する権限がありません"
            )
        
        # 所有者チェック（必要な場合）
        if owner_id_field and owner_id_field in request.path_params:
            owner_id = int(request.path_params[owner_id_field])
            
            # 自分以外のリソースに書き込み/削除しようとしている場合
            if permission in [Permission.WRITE, Permission.DELETE] and owner_id != current_user.id:
                # ヘルパーでもあり、ユーザーに関連付けられている場合は許可
                if (user_role == Role.HELPER and 
                    resource in ["recipe_requests", "tasks"] and 
                    # ヘルパーとユーザーの関連付けは実際の実装に合わせて調整が必要
                    await is_helper_assigned_to_user(current_user.id, owner_id)):
                    return True
                
                raise HTTPException(
                    status_code=HTTP_403_FORBIDDEN,
                    detail="自分以外のリソースを変更する権限がありません"
                )
        
        return True
    
    return check_permission

async def is_helper_assigned_to_user(helper_id: int, user_id: int) -> bool:
    """
    ヘルパーがユーザーに割り当てられているかチェック
    
    Note:
        実装は実際のデータモデルとCRUDに合わせて調整が必要
    """
    # ここで実際のデータベースチェックを実装
    # 例: return await user_helper_assignment_crud.exists(helper_id=helper_id, user_id=user_id)
    return True  # 仮の実装
