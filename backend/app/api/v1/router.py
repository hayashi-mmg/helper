"""
API v1 ルーター集約。
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .endpoints.logs import router as logs_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(logs_router)
