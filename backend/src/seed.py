import asyncio
import sys

import typer
from sqlmodel import select

from src.database import async_session_maker, init_db
from src.models import AdminUser
from src.security import hash_password

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

app = typer.Typer(help="Quản lý tài khoản quản trị TTGS2")


async def _ensure_tables():
    await init_db()


async def _create_admin(username: str, password: str):
    await _ensure_tables()
    async with async_session_maker() as session:
        existing = (await session.exec(select(AdminUser).where(AdminUser.username == username))).first()
        if existing:
            raise typer.BadParameter(f"Tài khoản '{username}' đã tồn tại")
        admin = AdminUser(username=username, password_hash=hash_password(password))
        session.add(admin)
        await session.commit()
        typer.echo(f"Đã tạo tài khoản quản trị: {username}")


async def _find_admin(identifier: str):
    async with async_session_maker() as session:
        admin = None
        if identifier.isdigit():
            admin = await session.get(AdminUser, int(identifier))
        if admin is None:
            admin = (await session.exec(select(AdminUser).where(AdminUser.username == identifier))).first()
        return session, admin


async def _list_admins():
    await _ensure_tables()
    async with async_session_maker() as session:
        admins = (await session.exec(select(AdminUser).order_by(AdminUser.id.asc()))).all()
        if not admins:
            typer.echo("Chưa có tài khoản quản trị nào.")
            return
        for admin in admins:
            typer.echo(f"- id={admin.id}, username={admin.username}")


async def _change_password(identifier: str, new_password: str):
    await _ensure_tables()
    session, admin = await _find_admin(identifier)
    async with session:
        if admin is None:
            raise typer.BadParameter(f"Không tìm thấy tài khoản quản trị: {identifier}")
        admin.password_hash = hash_password(new_password)
        session.add(admin)
        await session.commit()
        typer.echo(f"Đã đổi mật khẩu cho tài khoản: {admin.username}")


async def _delete_admin(identifier: str):
    await _ensure_tables()
    session, admin = await _find_admin(identifier)
    async with session:
        if admin is None:
            raise typer.BadParameter(f"Không tìm thấy tài khoản quản trị: {identifier}")
        await session.delete(admin)
        await session.commit()
        typer.echo(f"Đã xóa tài khoản quản trị: {admin.username}")


@app.command("create")
def create(username: str = typer.Argument(..., help="Tên đăng nhập"),
           password: str = typer.Argument(..., help="Mật khẩu")):
    """Tạo tài khoản quản trị."""
    if not username.strip() or not password:
        raise typer.BadParameter("Username/password không được để trống")
    asyncio.run(_create_admin(username.strip(), password))


@app.command("list")
def list_admins():
    """Liệt kê tài khoản quản trị."""
    asyncio.run(_list_admins())


@app.command("change-password")
def change_password(identifier: str = typer.Argument(..., help="Username hoặc id"),
                    new_password: str = typer.Argument(..., help="Mật khẩu mới")):
    """Đổi mật khẩu tài khoản quản trị."""
    if not new_password:
        raise typer.BadParameter("Mật khẩu không được để trống")
    asyncio.run(_change_password(identifier, new_password))


@app.command("delete")
def delete(identifier: str = typer.Argument(..., help="Username hoặc id")):
    """Xóa tài khoản quản trị."""
    asyncio.run(_delete_admin(identifier))


if __name__ == "__main__":
    app()
