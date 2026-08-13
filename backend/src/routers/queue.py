from datetime import date

from fastapi import APIRouter, HTTPException, Request

from src import queue
from src.database import SessionDep
from src.models import VisitSession
from src.schemas import QueueBoard
from src.security import get_current_admin

router = APIRouter(prefix="/api/queue", tags=["queue"])


def _validate_session(visit_session: str) -> str:
    if visit_session not in (VisitSession.MORNING, VisitSession.AFTERNOON):
        raise HTTPException(422, "queue.invalid_session")
    return visit_session


@router.get("/{visit_date}/{visit_session}", response_model=QueueBoard)
async def queue_board(visit_date: date, visit_session: str, session: SessionDep):
    visit_session = _validate_session(visit_session)
    return await queue.build_queue_board(session, visit_date, visit_session)


@router.post("/{visit_date}/{visit_session}/call-next", response_model=QueueBoard)
async def call_next(visit_date: date, visit_session: str, request: Request, session: SessionDep):
    visit_session = _validate_session(visit_session)
    await get_current_admin(request, session)
    return await queue.call_next(session, visit_date, visit_session)


@router.post("/{visit_date}/{visit_session}/reset", response_model=QueueBoard)
async def reset(visit_date: date, visit_session: str, request: Request, session: SessionDep):
    visit_session = _validate_session(visit_session)
    await get_current_admin(request, session)
    return await queue.reset_queue(session, visit_date, visit_session)
