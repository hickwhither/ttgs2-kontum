from dotenv import load_dotenv
load_dotenv()
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app():
    app_name = "TTGS2_Backend"
    app = FastAPI(
        title=app_name,
        description="Hệ thống đăng ký thăm gặp thân nhân - Trại tạm giam số 2 (Kon Tum)",
        lifespan=lifespan,
    )

    allow_origins = os.getenv("ALLOWED_ORIGINS", "").split() + [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Mini app chạy trong webview của Zalo nên có origin thuộc hạ tầng Zalo.
    # Các origin này không nằm trong ALLOWED_ORIGINS nên dùng regex để cho phép.
    allow_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX") or (
        r"^(https://[a-z0-9-]*\.zalo\.me|https://[a-z0-9-]*\.zdn\.vn"
        r"|zbrowswer://.*|http://localhost:\d+)$"
    )
    print("ALLOWED ORIGINS:", allow_origins)
    print("ALLOWED ORIGIN REGEX:", allow_origin_regex)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        SessionMiddleware,
        secret_key=os.getenv("SECRET_KEY", "default-secret-key"),
        session_cookie="session",
        max_age=60 * 60 * 24 * 7,  # 7 days
        same_site=os.getenv("SESSION_SAME_SITE", "none"),
        https_only=os.getenv("SESSION_HTTPS_ONLY", "false").lower() == "true",
    )

    from .routers import router
    app.include_router(router)

    return app
