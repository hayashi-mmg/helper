"""
API v1 ルーター集約。
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .endpoints.logs import router as logs_router
from .endpoints.users import router as users_router
from .endpoints.helpers import router as helpers_router
from .endpoints.relationships import router as relationships_router
from .endpoints.recipe_requests import router as recipe_requests_router
from .endpoints.tasks import router as tasks_router
from .endpoints.qrcodes import router as qrcodes_router
from .endpoints.feedback import router as feedback_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(logs_router)
router.include_router(users_router)
router.include_router(helpers_router)
router.include_router(relationships_router)
router.include_router(recipe_requests_router)
router.include_router(tasks_router)
router.include_router(qrcodes_router)
router.include_router(feedback_router)
