"""
API Router V1 Aggregator.
Consolidates domain-specific endpoints under the /api/v1 namespace.
"""

from fastapi import APIRouter
from .auth import router as auth_router
from .students import router as students_router
from .faculty import router as faculty_router
from .backlogs import router as backlogs_router
from .certificates import router as certificates_router
from .analytics import router as analytics_router
from .reports import router as reports_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(students_router)
api_v1_router.include_router(faculty_router)
api_v1_router.include_router(backlogs_router)
api_v1_router.include_router(certificates_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(reports_router)
