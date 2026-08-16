# Hệ thống đăng ký thăm gặp

- **Backend**: FastAPI + SQLModel/SQLAlchemy (async), quản trị trong frontend
- **Database**: MariaDB (sản xuất), SQLite (phát triển)
- **Frontend**: React + TypeScript + Vite + Bulma + ESLint
- **Ngôn ngữ giao diện**: Tiếng Việt (có dấu đầy đủ)

## Cấu trúc

```
backend/          # API FastAPI (models, schemas, security, queue, routers, seed)
frontend/         # React + TS + Bulma SPA (Trang chủ, Đăng ký, Tra cứu, Bảng số gọi, Quản trị)
```

## Quy trình đăng ký & bảng số gọi

1. **Thân nhân** đăng ký trực tuyến tại `/dang-ky` (thông tin thân nhân + phạm nhân + ngày/buổi thăm gặp). Hồ sơ mới có trạng thái **Đang xử lý**.
2. **Cán bộ trại** đăng nhập tại `/admin/login` và quản lý hồ sơ tại `/admin/registrations`:
   - Hồ sơ hợp lệ → hệ thống đổi trạng thái thành **Đã xác nhận** và tự cấp **số gọi**. Số gọi tăng dần theo `ngày + buổi`.
   - Hồ sơ bị từ chối → trạng thái **Đã từ chối**. Hồ sơ thiếu thông tin → trạng thái **Thiếu thông tin**.
3. **Tra cứu**: thân nhân kiểm tra trạng thái/số gọi tại `/tra-cuu` theo số CCCD/CMND hoặc họ tên.
4. **Bảng số gọi công cộng** tại `/bang-so` (và `/admin/ban-so` cho cán bộ):
   - Cán bộ bấm **Gọi tiếp** để tăng `now_serving` cho từng buổi.
   - Bảng hiển thị **số đang gọi**, họ tên ẩn (ví dụ `N***** A`) và danh sách chờ.
   - Trang công cộng tự làm mới mỗi 10 giây.

## API

| Phương thức | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/api/registrations` | Danh sách hồ sơ (bộ lọc `status`, `visit_date`, `relative_id_number`, `relative_full_name`, `prisoner_full_name`, phân trang `limit`, `offset`) |
| `POST` | `/api/registrations` | Tạo hồ sơ đăng ký mới (công khai) |
| `GET` | `/api/registrations/{id}` | Chi tiết hồ sơ |
| `PUT` | `/api/registrations/{id}` | Cập nhật toàn bộ (cần admin) |
| `PATCH` | `/api/registrations/{id}` | Cập nhật một phần / đổi trạng thái (cần admin) |
| `DELETE` | `/api/registrations/{id}` | Xóa hồ sơ (cần admin) |
| `GET` | `/api/queue/{visit_date}/{visit_session}` | Bảng số gọi công cộng (`morning`/`afternoon`) |
| `POST` | `/api/queue/{visit_date}/{visit_session}/call-next` | Gọi tiếp (cần admin) |
| `POST` | `/api/queue/{visit_date}/{visit_session}/reset` | Đặt lại bảng số gọi (cần admin) |
| `POST` | `/api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | Đăng nhập/đăng xuất/kiểm tra phiên admin |

## Ghi chú deployment

- Thay đổi `SECRET_KEY` trong môi trường (dùng cho session đăng nhập admin).
- Hệ thống tự động tạo bảng khi khởi động. Nếu bạn thay đổi schema trên database cũ đang chạy, xử lý schema thủ công trước khi khởi động.
- Đối với sản xuất, chạy `uvicorn main:app --workers 4 --host 0.0.0.0 --port 8000` phía sau nginx. Phục vụ `frontend/dist/`, hoặc chạy SPA riêng.

## Triển khai bằng Docker + Cloudflare Tunnel

Toàn bộ hệ thống chạy được bằng 1 lệnh `docker compose`, **không cần tạo file `.env`**.

### 1. Cấu hình

Mở file `docker-compose.yml`. Thay đổi **2 giá trị duy nhất**:

```yaml
x-origin: &origin https://thamtgap.example.com   # tên miền sẽ truy cập
x-tunnel-token: &tunnel_token ""                  # token tunnel Cloudflare (xem bước 2)
```

> Nếu bạn để trống `TUNNEL_TOKEN`, hệ thống tự mở quick tunnel (URL ngẫu nhiên, phù hợp để test nhanh).

### 2. Tạo Cloudflare Tunnel (lần đầu)

Tạo 1 tunnel mới theo domain trên cloudflare, và lấy token.
Copy token vào `TUNNEL_TOKEN` trong `docker-compose.yml`.
Sau đó thêm hostname đã chọn trên Dashboard Cloudflare (Zero Trust → Networks → Tunnels → tunnel `ttgs2` → Public Hostname).
Trỏ hostname đến dịch vụ `http://frontend:80`.

### 3. Khởi động

```bash
docker compose up -d --build     # hoặc: make up
```

- Ứng dụng chạy tại `https://<tên-miền>` (qua tunnel), và `http://localhost:8080` (trực tiếp).
- MariaDB tự động tạo bảng dữ liệu khi khởi động lần đầu.

### 4. Lệnh nhanh (Makefile — máy chủ Linux)

```bash
make up                    # khởi động
make logs                  # xem log
make admin-create USERNAME=admin PASSWORD=123456   # tạo tài khoản admin
make admin-list            # danh sách admin
make admin-chpass USERNAME=admin PASSWORD=mat-khau-moi
make admin-delete USERNAME=admin
make backup                # backup DB → backups/backup-<ngày>.sql
make restore FILE=backups/backup-20260101-120000.sql
```

### 5. Lệnh nhanh (PowerShell — Windows)

```powershell
.\admin.ps1 list
.\admin.ps1 create admin 123456
.\admin.ps1 change-password admin 123456
.\admin.ps1 delete admin
.\backup.ps1                              # backup DB → backups\
.\restore.ps1 backups\backup-20260101-120000.sql
```

> Lưu ý: file backup trong `backups/` phải được copy ra ngoài máy chủ để giữ an toàn.
