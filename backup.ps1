# Backup cơ sở dữ liệu MariaDB (Windows)
# Kết quả lưu vào thư mục backups\backup-<ngày-giờ>.sql

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$dir = Join-Path $PSScriptRoot "backups"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path $dir "backup-$stamp.sql"

Write-Host "Đang backup..." -ForegroundColor Cyan
$lines = & docker compose exec -T db sh -c 'mariadb-dump --single-transaction --routines --triggers -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' 2>&1
if ($LASTEXITCODE -ne 0) { throw "Backup thất bại." }
[System.IO.File]::WriteAllLines($out, $lines, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Backup xong: $out" -ForegroundColor Green
