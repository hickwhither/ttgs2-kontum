from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SessionLiteral = Literal["morning", "afternoon"]
StatusLiteral = Literal["incomplete", "processing", "confirmed", "rejected"]


class RegistrationBase(BaseModel):
    relative_full_name: str = Field(min_length=1)
    relative_date_of_birth: date
    relative_registered_residence: str = Field(min_length=1)
    relative_id_number: str = Field(min_length=1)
    relative_relationship: str = Field(min_length=1)
    prisoner_full_name: str = Field(min_length=1)
    prisoner_date_of_birth: date
    prisoner_registered_residence: str = Field(min_length=1)
    prisoner_offense: str = Field(min_length=1)
    prisoner_arrest_date: date
    visit_date: date
    visit_session: SessionLiteral


class RegistrationCreate(RegistrationBase):
    pass


class RegistrationUpdate(RegistrationBase):
    pass


class RegistrationPatch(BaseModel):
    relative_full_name: str | None = Field(default=None, min_length=1)
    relative_date_of_birth: date | None = None
    relative_registered_residence: str | None = Field(default=None, min_length=1)
    relative_id_number: str | None = Field(default=None, min_length=1)
    relative_relationship: str | None = Field(default=None, min_length=1)
    prisoner_full_name: str | None = Field(default=None, min_length=1)
    prisoner_date_of_birth: date | None = None
    prisoner_registered_residence: str | None = Field(default=None, min_length=1)
    prisoner_offense: str | None = Field(default=None, min_length=1)
    prisoner_arrest_date: date | None = None
    visit_date: date | None = None
    visit_session: SessionLiteral | None = None
    status: StatusLiteral | None = None


class RegistrationRead(RegistrationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: StatusLiteral
    call_number: int | None = None


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AdminRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class QueueEntry(BaseModel):
    call_number: int
    full_name: str


class QueueBoard(BaseModel):
    visit_date: date
    visit_session: SessionLiteral
    session_label: str
    now_serving: int
    currently_called: QueueEntry | None = None
    waiting: list[QueueEntry]
    waiting_count: int
