# Backend TTGS2 - Hệ thống đăng ký thăm gặp

Backend FastAPI + SQLModel (async) cho hệ thống đăng ký thăm gặp thân nhân –
Trại tạm giam số 2 (Kon Tum).

## Yêu cầu

- Python 3.14+ (đã kiểm thử)
- `uv` (hoặc pip)

## Cài đặt

```bash
cd backend
uv venv .venv
uv pip install -e .
copy example.env .env   # Windows
# cp example.env .env    # Linux/macOS
```

Mặc định dùng SQLite (`sqlite+aiosqlite:///./database.db`). Muốn dùng MariaDB/MySQL
thì sửa `DATABASE_URL=mysql+asyncmy://user:password@host:3306/dbname` trong `.env`.

## Tạo tài khoản quản trị

```bash
.venv\Scripts\python -m src.seed create admin 123456
```

Các lệnh quản trị:

```bash
.venv\Scripts\python -m src.seed list
.venv\Scripts\python -m src.seed change-password admin mat-khau-moi
.venv\Scripts\python -m src.seed delete admin
```

## Chạy

```bash
.venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Tài liệu API: <http://localhost:8000/docs>
- Bảng dữ liệu tự động tạo khi khởi động lần đầu.

## API chính

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/registrations` | Danh sách hồ sơ (bộ lọc `status`, `visit_date`, `relative_id_number`, `relative_full_name`, `prisoner_full_name`; phân trang `limit`, `offset`) |
| `POST` | `/api/registrations` | Tạo hồ sơ đăng ký mới (công khai) |
| `GET` | `/api/registrations/{id}` | Chi tiết hồ sơ |
| `PUT` | `/api/registrations/{id}` | Cập nhật toàn bộ (cần đăng nhập admin) |
| `PATCH` | `/api/registrations/{id}` | Cập nhật một phần, đổi trạng thái (cần đăng nhập admin) |
| `DELETE` | `/api/registrations/{id}` | Xóa hồ sơ (cần đăng nhập admin) |
| `GET` | `/api/queue/{visit_date}/{visit_session}` | Bảng số gọi công cộng |
| `POST` | `/api/queue/{visit_date}/{visit_session}/call-next` | Gọi tiếp số kế (cần admin) |
| `POST` | `/api/queue/{visit_date}/{visit_session}/reset` | Đặt lại bảng số gọi (cần admin) |
| `POST` | `/api/auth/login` | Đăng nhập admin |
| `POST` | `/api/auth/logout` | Đăng xuất |
| `GET` | `/api/auth/me` | Thông tin admin đang đăng nhập |

Quy tắc số gọi: hồ sơ được xác nhận (`confirmed`) sẽ tự động được cấp số gọi
tăng dần theo `visit_date` + `visit_session`; khi hồ sơ rời trạng thái đã xác nhận,
số gọi được xóa.
