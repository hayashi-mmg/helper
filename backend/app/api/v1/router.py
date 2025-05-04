"""
API v1 ルーター集約。
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .endpoints.logs import router as logs_router
from .endpoints.users import router as users_router
from .endpoints.helpers import router as helpers_router
from .endpoints.relationships import router as relationships_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(logs_router)
router.include_router(users_router)
router.include_router(helpers_router)
router.include_router(relationships_router)
