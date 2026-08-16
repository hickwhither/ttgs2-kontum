# ============================================================
#  TTGS2 Kontum - Lệnh nhanh Docker
#
#  Lệnh thường dùng:
#    make up                      khởi động toàn bộ hệ thống
#    make logs                    xem log
#    make admin-create            tạo tài khoản admin
#    make backup                  backup cơ sở dữ liệu
#    make restore FILE=xx.sql     khôi phục cơ sở dữ liệu
# ============================================================

COMPOSE := docker compose
PY      := $(COMPOSE) exec -T backend python -m src.seed
DB      := $(COMPOSE) exec -T db sh -c

# ---------------- Vòng đời ----------------
up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

# ---------------- Quản trị tài khoản (admin) ----------------
USERNAME ?= admin
PASSWORD ?=

admin-create:
	@$(PY) create "$(USERNAME)" "$(PASSWORD)"

admin-list:
	@$(PY) list

admin-chpass:
	@$(PY) change-password "$(USERNAME)" "$(PASSWORD)"

admin-delete:
	@$(PY) delete "$(USERNAME)"

# ---------------- Backup / Restore ----------------
BACKUP_DIR := backups

backup:
	@mkdir -p $(BACKUP_DIR)
	@$(DB) 'mariadb-dump --single-transaction --routines --triggers -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"' > $(BACKUP_DIR)/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "Backup xong: $(BACKUP_DIR)/$$(ls -t $(BACKUP_DIR) | head -1)"

restore:
	@test -n "$(FILE)" || (echo "Cách dùng: make restore FILE=duong-dan-file.sql" && exit 1)
	@test -f "$(FILE)" || (echo "Không tìm thấy file: $(FILE)" && exit 1)
	@$(DB) 'mariadb -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"' < "$(FILE)"
	@echo "Đã restore từ: $(FILE)"
