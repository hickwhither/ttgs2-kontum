from datetime import date

from sqlalchemy import Date, UniqueConstraint
from sqlmodel import Field, SQLModel


class VisitStatus:
    INCOMPLETE = "incomplete"
    PROCESSING = "processing"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

    LABELS = {
        INCOMPLETE: "Thiếu thông tin",
        PROCESSING: "Đang xử lý",
        CONFIRMED: "Đã xác nhận",
        REJECTED: "Đã từ chối",
    }


class VisitSession:
    MORNING = "morning"
    AFTERNOON = "afternoon"

    LABELS = {
        MORNING: "Buổi sáng",
        AFTERNOON: "Buổi chiều",
    }


class VisitRegistration(SQLModel, table=True):
    __tablename__ = "visit_registrations"

    id: int | None = Field(default=None, primary_key=True)

    # Thân nhân can phạm nhân
    relative_full_name: str = Field(min_length=1)
    relative_date_of_birth: date = Field(sa_type=Date)
    relative_registered_residence: str = Field(min_length=1)
    relative_id_number: str = Field(index=True, min_length=1)
    relative_relationship: str = Field(min_length=1)

    # Can phạm nhân
    prisoner_full_name: str = Field(min_length=1)
    prisoner_date_of_birth: date = Field(sa_type=Date)
    prisoner_registered_residence: str = Field(min_length=1)
    prisoner_offense: str = Field(min_length=1)
    prisoner_arrest_date: date = Field(sa_type=Date)

    # Thời gian đăng ký thăm gặp
    visit_date: date = Field(index=True, sa_type=Date)
    visit_session: str = Field(index=True)  # morning / afternoon

    status: str = Field(default=VisitStatus.PROCESSING, index=True)
    call_number: int | None = Field(default=None, index=True)


class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_users"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=1)
    password_hash: str


class CallQueue(SQLModel, table=True):
    __tablename__ = "call_queues"
    __table_args__ = (UniqueConstraint("visit_date", "visit_session", name="uq_call_queue_date_session"),)

    id: int | None = Field(default=None, primary_key=True)
    visit_date: date = Field(index=True, sa_type=Date)
    visit_session: str = Field(index=True)
    now_serving: int = Field(default=0)
