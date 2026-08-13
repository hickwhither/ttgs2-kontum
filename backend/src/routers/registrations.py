from datetime import date

from fastapi import APIRouter, HTTPException, Request
from sqlmodel import or_, select

from src import queue
from src.database import SessionDep
from src.models import VisitRegistration, VisitStatus
from src.schemas import RegistrationCreate, RegistrationPatch, RegistrationRead, RegistrationUpdate, StatusLiteral
from src.security import get_current_admin

router = APIRouter(prefix="/api/registrations", tags=["registrations"])


async def _reconcile_call_number(session, registration: VisitRegistration) -> None:
    """Đồng bộ số gọi khi trạng thái thay đổi.

    - Xác nhận -> cấp số gọi kế tiếp (nếu chưa có).
    - Rời trạng thái đã xác nhận -> xóa số gọi.
    """
    if registration.status == VisitStatus.CONFIRMED:
        if registration.call_number is None:
            registration.call_number = await queue.assign_call_number(session, registration)
    else:
        registration.call_number = None


def _apply_patch(registration: VisitRegistration, data: dict) -> None:
    for key, value in data.items():
        if key == "status":
            continue
        setattr(registration, key, value)


@router.get("", response_model=list[RegistrationRead])
async def list_registrations(
    session: SessionDep,
    status: StatusLiteral | None = None,
    visit_date: date | None = None,
    relative_id_number: str | None = None,
    relative_full_name: str | None = None,
    prisoner_full_name: str | None = None,
    limit: int = 100,
    offset: int = 0,
):
    limit = max(1, min(limit, 500))
    offset = max(0, offset)

    statement = select(VisitRegistration)
    if status:
        statement = statement.where(VisitRegistration.status == status)
    if visit_date:
        statement = statement.where(VisitRegistration.visit_date == visit_date)
    if relative_id_number:
        statement = statement.where(VisitRegistration.relative_id_number == relative_id_number)
    if relative_full_name:
        pattern = f"%{relative_full_name.strip()}%"
        statement = statement.where(
            or_(
                VisitRegistration.relative_full_name.ilike(pattern),
                VisitRegistration.prisoner_full_name.ilike(pattern),
            )
        )
    if prisoner_full_name:
        statement = statement.where(VisitRegistration.prisoner_full_name.ilike(f"%{prisoner_full_name.strip()}%"))

    statement = statement.order_by(
        VisitRegistration.visit_date.desc(),
        VisitRegistration.id.desc(),
    ).offset(offset).limit(limit)

    results = (await session.exec(statement)).all()
    return results


@router.post("", response_model=RegistrationRead, status_code=201)
async def create_registration(payload: RegistrationCreate, session: SessionDep):
    registration = VisitRegistration(
        **payload.model_dump(),
        status=VisitStatus.PROCESSING,
        call_number=None,
    )
    session.add(registration)
    await session.commit()
    await session.refresh(registration)
    return registration


@router.get("/{registration_id}", response_model=RegistrationRead)
async def get_registration(registration_id: int, session: SessionDep):
    registration = await session.get(VisitRegistration, registration_id)
    if not registration:
        raise HTTPException(404, "registration.not_found")
    return registration


@router.put("/{registration_id}", response_model=RegistrationRead)
async def update_registration(registration_id: int, payload: RegistrationUpdate, request: Request, session: SessionDep):
    await get_current_admin(request, session)
    registration = await session.get(VisitRegistration, registration_id)
    if not registration:
        raise HTTPException(404, "registration.not_found")

    data = payload.model_dump()
    for key, value in data.items():
        setattr(registration, key, value)
    await _reconcile_call_number(session, registration)

    session.add(registration)
    await session.commit()
    await session.refresh(registration)
    return registration


@router.patch("/{registration_id}", response_model=RegistrationRead)
async def patch_registration(registration_id: int, payload: RegistrationPatch, request: Request, session: SessionDep):
    await get_current_admin(request, session)
    registration = await session.get(VisitRegistration, registration_id)
    if not registration:
        raise HTTPException(404, "registration.not_found")

    data = payload.model_dump(exclude_unset=True)
    _apply_patch(registration, data)
    if "status" in data:
        registration.status = data["status"]
    await _reconcile_call_number(session, registration)

    session.add(registration)
    await session.commit()
    await session.refresh(registration)
    return registration


@router.delete("/{registration_id}", status_code=204)
async def delete_registration(registration_id: int, request: Request, session: SessionDep):
    await get_current_admin(request, session)
    registration = await session.get(VisitRegistration, registration_id)
    if not registration:
        raise HTTPException(404, "registration.not_found")
    await session.delete(registration)
    await session.commit()
