from datetime import date

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import CallQueue, VisitRegistration, VisitSession, VisitStatus


def mask_full_name(name: str) -> str:
    """Che giấu tên để hiển thị trên bảng số gọi công cộng.

    "Nguyễn Văn An" -> "N***** A"
    """
    parts = (name or "").strip().split()
    if not parts:
        return ""
    first_initial = parts[0][0].upper()
    last_initial = parts[-1][0].upper()
    return f"{first_initial}***** {last_initial}"


async def assign_call_number(session: AsyncSession, registration: VisitRegistration) -> int:
    """Cấp số gọi kế tiếp theo (ngày, buổi). Không commit, để router commit."""
    statement = (
        select(VisitRegistration.call_number)
        .where(
            VisitRegistration.visit_date == registration.visit_date,
            VisitRegistration.visit_session == registration.visit_session,
        )
        .order_by(VisitRegistration.call_number.desc())
        .limit(1)
    )
    result = await session.exec(statement)
    last_number = result.first()
    return (last_number or 0) + 1


async def get_or_create_call_queue(session: AsyncSession, visit_date: date, visit_session: str) -> CallQueue:
    statement = select(CallQueue).where(
        CallQueue.visit_date == visit_date,
        CallQueue.visit_session == visit_session,
    )
    queue = (await session.exec(statement)).first()
    if queue is None:
        queue = CallQueue(visit_date=visit_date, visit_session=visit_session, now_serving=0)
        session.add(queue)
        await session.commit()
        await session.refresh(queue)
    return queue


async def build_queue_board(session: AsyncSession, visit_date: date, visit_session: str):
    from src.schemas import QueueBoard, QueueEntry

    queue = await get_or_create_call_queue(session, visit_date, visit_session)

    statement = (
        select(VisitRegistration)
        .where(
            VisitRegistration.visit_date == visit_date,
            VisitRegistration.visit_session == visit_session,
            VisitRegistration.status == VisitStatus.CONFIRMED,
            VisitRegistration.call_number.is_not(None),
        )
        .order_by(VisitRegistration.call_number.asc())
    )
    confirmed = (await session.exec(statement)).all()

    now_serving = queue.now_serving
    currently_called = next((reg for reg in confirmed if reg.call_number == now_serving), None)
    waiting = [reg for reg in confirmed if reg.call_number > now_serving]

    def to_entry(reg: VisitRegistration) -> QueueEntry:
        return QueueEntry(call_number=reg.call_number or 0, full_name=mask_full_name(reg.prisoner_full_name))

    return QueueBoard(
        visit_date=visit_date,
        visit_session=visit_session,
        session_label=VisitSession.LABELS.get(visit_session, visit_session),
        now_serving=now_serving,
        currently_called=to_entry(currently_called) if currently_called else None,
        waiting=[to_entry(reg) for reg in waiting],
        waiting_count=len(waiting),
    )


async def call_next(session: AsyncSession, visit_date: date, visit_session: str):
    queue = await get_or_create_call_queue(session, visit_date, visit_session)
    queue.now_serving += 1
    session.add(queue)
    await session.commit()
    return await build_queue_board(session, visit_date, visit_session)


async def reset_queue(session: AsyncSession, visit_date: date, visit_session: str):
    queue = await get_or_create_call_queue(session, visit_date, visit_session)
    queue.now_serving = 0
    session.add(queue)
    await session.commit()
    return await build_queue_board(session, visit_date, visit_session)
