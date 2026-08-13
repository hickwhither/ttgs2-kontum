<img src="/frontend/public/banner.jpg" alt="Alt Text" width="auto" height="300">

Tài liệu được generate bởi AI, sẽ được update sau...

# Hệ thống đăng ký thăm gặp - Trại tạm giam số 2 (Kon Tum)

Hệ thống đăng ký thăm gặp thân nhân/phạm nhân trực tuyến cho Trại tạm giam số 2 –
Công an tỉnh Kon Tum.

## Công nghệ

- **Backend**: FastAPI + SQLModel
- **Database**: MariaDB (sản xuất), SQLite (phát triển/kiểm thử)
- **Frontend**: React + Vite + Bulma
- **Ngôn ngữ giao diện**: Tiếng Việt (có dấu đầy đủ)

## Cấu trúc

```
backend/          # API FastAPI + admin + alembic migrations
  app/            # models, schemas, crud, queue, security, admin, seed
  templates/      # Giao diện sqladmin tiếng Việt (dashboard, bảng số gọi, …)
  tests/          # pytest
frontend/         # React + Bulma SPA (Trang chủ, Đăng ký, Tra cứu, Bảng số gọi)
```

## Cài đặt & chạy

### 1. Backend

Yêu cầu: Python 3.11+ (đã kiểm thử trên 3.14).

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # chỉnh DATABASE_URL nếu cần
```

Mặc định backend dùng MariaDB:
`mysql+pymysql://visit_app:visit_app@localhost:3306/visit_registrations`

Có thể dùng SQLite để chạy nhanh khi phát triển:

```
DATABASE_URL=sqlite:///./visit.db
```

Tạo tài khoản quản trị:

```bash
python -m app.seed create admin --password "123456"   # đổi mật khẩu thật
```

Khởi động API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Trang quản trị: <http://localhost:8000/admin>
- Tài liệu API: <http://localhost:8000/docs>

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # dev server tại http://localhost:5173 (proxy /api về :8000)
```

Bản build cho sản xuất được FastAPI phục vụ trực tiếp (single server):

```bash
npm run build
# → backend tự phục vụ frontend tại http://localhost:8000
```

## Quy trình đăng ký & bảng số gọi

1. **Thân nhân** đăng ký trực tuyến tại `/dang-ky` (thông tin thân nhân + phạm nhân + ngày/buổi thăm gặp). Hồ sơ mới có trạng thái **Đang xử lý**.
2. **Cán bộ trại** xem hồ sơ tại trang quản trị `/admin/visit-registration/list`:
   - Xác nhận hợp lệ → đổi trạng thái **Đã xác nhận** → hệ thống tự cấp **số gọi** (tăng dần theo `ngày + buổi`).
   - Từ chối → **Đã từ chối**; thiếu thông tin → **Thiếu thông tin** (liên hệ người đăng ký bổ sung).
3. **Tra cứu**: thân nhân kiểm tra trạng thái/số gọi tại `/tra-cuu` theo số CCCD/CMND hoặc họ tên.
4. **Bảng số gọi công cộng** tại `/bang-so` (và `/admin/ban-so` cho cán bộ):
   - Cán bộ bấm **Gọi tiếp** để tăng `now_serving` cho từng buổi.
   - Bảng hiển thị **số đang gọi**, họ tên ẩn (ví dụ `N***** A`) và danh sách chờ.
   - Trang công cộng tự làm mới mỗi 10 giây.

## API chính

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/registrations` | Danh sách hồ sơ (bộ lọc `status`, `visit_date`, `relative_id_number`, `relative_full_name`, `prisoner_full_name`) |
| `POST` | `/api/registrations` | Tạo hồ sơ đăng ký |
| `GET` | `/api/registrations/{id}` | Chi tiết hồ sơ |
| `PUT` | `/api/registrations/{id}` | Cập nhật toàn bộ |
| `PATCH` | `/api/registrations/{id}` | Cập nhật một phần (vd đổi trạng thái) |
| `DELETE` | `/api/registrations/{id}` | Xóa hồ sơ |
| `GET` | `/api/queue/{visit_date}/{visit_session}` | Bảng số gọi: `morning`/`afternoon` |

Đáp ứng của `/api/queue/{ngày}/{buổi}`:

```json
{
  "visit_date": "2026-08-10",
  "visit_session": "morning",
  "session_label": "Buổi sáng",
  "now_serving": 3,
  "currently_called": {"call_number": 3, "full_name": "N***** A"},
  "waiting": [{"call_number": 4, "full_name": "L***** C"}],
  "waiting_count": 1
}
```

## Ghi chú deployment

- Đổi `SECRET_KEY` trong môi trường (dùng cho session đăng nhập admin).
- Bảng được tự động tạo khi khởi động. Với database có dữ liệu cũ cần nâng cấp schema: chạy `alembic upgrade head` trước khi khởi động lần đầu (tự động tạo chỉ tạo bảng *thiếu*, không đổi bảng đã có).
- Nếu `DATABASE_URL` không kết nối được lúc khởi động, server vẫn chạy và ghi log cảnh báo; lỗi rõ sẽ hiện khi có yêu cầu.
- Khởi động production gợi ý: `uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000` (phía sau nginx).
