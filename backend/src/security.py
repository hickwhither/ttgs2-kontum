import hashlib
import hmac
import os

from fastapi import HTTPException, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from src.database import SessionDep
from src.models import AdminUser

_PBKDF2_ROUNDS = 100_000
_ALGORITHM = "pbkdf2_sha256"


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ROUNDS)
    return f"{_ALGORITHM}:{_PBKDF2_ROUNDS}:{salt.hex()}:{digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, rounds, salt_hex, digest_hex = password_hash.split(":")
        if algorithm != _ALGORITHM:
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(rounds)
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def create_admin_session(request: Request, user: AdminUser) -> None:
    request.session["admin_id"] = user.id


def destroy_admin_session(request: Request) -> None:
    request.session.pop("admin_id", None)


async def get_current_admin(request: Request, session: SessionDep) -> AdminUser:
    admin_id = request.session.get("admin_id")
    if not admin_id:
        raise HTTPException(401, "user.not_authenticated")
    admin = await session.get(AdminUser, admin_id)
    if not admin:
        raise HTTPException(401, "user.not_authenticated")
    return admin
