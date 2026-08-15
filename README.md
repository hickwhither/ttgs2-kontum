# Hệ thống đăng ký thăm gặp - Trại tạm giam số 2 (Kon Tum)

Hệ thống đăng ký thăm gặp thân nhân/phạm nhân trực tuyến cho Trại tạm giam số 2 –
Công an tỉnh Kon Tum.

> Migrated từ dự án Flask cũ (`traitamgiamso2-dangkythamgap/`) sang kiến trúc mới:
> backend FastAPI + frontend React. Dự án Flask cũ được giữ lại chỉ để tham khảo.

## Công nghệ

- **Backend**: FastAPI + SQLModel/SQLAlchemy (async), quản trị trong frontend
- **Database**: MariaDB (sản xuất), SQLite (phát triển)
- **Frontend**: React + TypeScript + Vite + Bulma + ESLint
- **Ngôn ngữ giao diện**: Tiếng Việt (có dấu đầy đủ)

## Cấu trúc

```
backend/          # API FastAPI (models, schemas, security, queue, routers, seed)
frontend/         # React + TS + Bulma SPA (Trang chủ, Đăng ký, Tra cứu, Bảng số gọi, Quản trị)
```

## Cài đặt & chạy

### 1. Backend

Yêu cầu: Python 3.14+ và `uv`.

```bash
cd backend
uv venv .venv
uv pip install -e .
copy example.env .env        # Windows (hoặc cp .env.example trên Linux/macOS)
```

Mặc định dùng SQLite: `DATABASE_URL=sqlite+aiosqlite:///./database.db`.
Dùng MariaDB/MySQL trong sản xuất:

```
DATABASE_URL=mysql+asyncmy://visit_app:visit_app@localhost:3306/visit_registrations
```

Bảng dữ liệu **tự động tạo** khi khởi động lần đầu (không cần migration thủ công).

Tạo tài khoản quản trị:

```bash
.venv\Scripts\python -m src.seed create admin 123456   # đổi mật khẩu thật
```

Khởi động API:

```bash
.venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Tài liệu API: <http://localhost:8000/docs>

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # dev server tại http://localhost:5173 (proxy /api về :8000)
```

Bản build cho sản xuất:

```bash
npm run build      # typecheck + lint + vite build → dist/
```

## Quy trình đăng ký & bảng số gọi

1. **Thân nhân** đăng ký trực tuyến tại `/dang-ky` (thông tin thân nhân + phạm nhân + ngày/buổi thăm gặp). Hồ sơ mới có trạng thái **Đang xử lý**.
2. **Cán bộ trại** đăng nhập tại `/admin/login` và quản lý hồ sơ tại `/admin/registrations`:
   - Xác nhận hợp lệ → đổi trạng thái **Đã xác nhận** → hệ thống tự cấp **số gọi** (tăng dần theo `ngày + buổi`).
   - Từ chối → **Đã từ chối**; thiếu thông tin → **Thiếu thông tin**.
3. **Tra cứu**: thân nhân kiểm tra trạng thái/số gọi tại `/tra-cuu` theo số CCCD/CMND hoặc họ tên.
4. **Bảng số gọi công cộng** tại `/bang-so` (và `/admin/ban-so` cho cán bộ):
   - Cán bộ bấm **Gọi tiếp** để tăng `now_serving` cho từng buổi.
   - Bảng hiển thị **số đang gọi**, họ tên ẩn (ví dụ `N***** A`) và danh sách chờ.
   - Trang công cộng tự làm mới mỗi 10 giây.

## API chính

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/registrations` | Danh sách hồ sơ (bộ lọc `status`, `visit_date`, `relative_id_number`, `relative_full_name`, `prisoner_full_name`; phân trang `limit`, `offset`) |
| `POST` | `/api/registrations` | Tạo hồ sơ đăng ký mới (công khai) |
| `GET` | `/api/registrations/{id}` | Chi tiết hồ sơ |
| `PUT` | `/api/registrations/{id}` | Cập nhật toàn bộ (cần admin) |
| `PATCH` | `/api/registrations/{id}` | Cập nhật một phần / đổi trạng thái (cần admin) |
| `DELETE` | `/api/registrations/{id}` | Xóa hồ sơ (cần admin) |
| `GET` | `/api/queue/{visit_date}/{visit_session}` | Bảng số gọi công cộng (`morning`/`afternoon`) |
| `POST` | `/api/queue/{visit_date}/{visit_session}/call-next` | Gọi tiếp (cần admin) |
| `POST` | `/api/queue/{visit_date}/{visit_session}/reset` | Đặt lại bảng số gọi (cần admin) |
| `POST` | `/api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | Đăng nhập/đăng xuất/kiểm tra phiên admin |

## Quản trị tài khoản (CLI)

```bash
.venv\Scripts\python -m src.seed create <username> <password>   # tạo tài khoản
.venv\Scripts\python -m src.seed list                            # danh sách
.venv\Scripts\python -m src.seed change-password <user|id> <pw>  # đổi mật khẩu
.venv\Scripts\python -m src.seed delete <user|id>                # xóa tài khoản
```

## Ghi chú deployment

- Đổi `SECRET_KEY` trong môi trường (dùng cho session đăng nhập admin).
- Bảng được tự động tạo khi khởi động. Nếu đổi schema trên database cũ đang chạy, cần xử lý schema thủ công trước khi khởi động.
- Production gợi ý: `uvicorn main:app --workers 4 --host 0.0.0.0 --port 8000` phía sau nginx, và phục vụ `frontend/dist/` (hoặc chạy SPA riêng).
