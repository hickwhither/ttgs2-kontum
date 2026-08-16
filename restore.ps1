# Khôi phục cơ sở dữ liệu MariaDB từ file backup (Windows)
#
# Cách dùng:
#   .\restore.ps1 backups\backup-20260101-120000.sql

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$File
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Test-Path -LiteralPath $File)) { throw "Không tìm thấy file: $File" }

$sql = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $File), [System.Text.Encoding]::UTF8)
Write-Host "Đang restore từ $File ..." -ForegroundColor Cyan

$sql | & docker compose exec -T db sh -c 'mariadb -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
if ($LASTEXITCODE -ne 0) { throw "Restore thất bại." }

Write-Host "Đã restore xong từ: $File" -ForegroundColor Green
