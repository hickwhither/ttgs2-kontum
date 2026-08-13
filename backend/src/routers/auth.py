from fastapi import APIRouter, HTTPException, Request
from sqlmodel import select

from src.database import SessionDep
from src.models import AdminUser
from src.schemas import AdminRead, LoginRequest
from src.security import (
    create_admin_session,
    destroy_admin_session,
    get_current_admin,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AdminRead)
async def login(payload: LoginRequest, request: Request, session: SessionDep):
    statement = select(AdminUser).where(AdminUser.username == payload.username)
    admin = (await session.exec(statement)).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(401, "auth.invalid_credentials")

    create_admin_session(request, admin)
    return admin


@router.post("/logout")
async def logout(request: Request):
    destroy_admin_session(request)
    return {"message": "Success"}


@router.get("/me", response_model=AdminRead)
async def me(request: Request, session: SessionDep):
    return await get_current_admin(request, session)
