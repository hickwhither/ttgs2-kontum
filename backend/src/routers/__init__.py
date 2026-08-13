from fastapi import APIRouter

router = APIRouter()

from .auth import router as auth_router
router.include_router(auth_router)

from .registrations import router as registrations_router
router.include_router(registrations_router)

from .queue import router as queue_router
router.include_router(queue_router)
