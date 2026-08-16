# Quản trị tài khoản admin (Windows) - chạy trong thư mục dự án
#
# Cách dùng:
#   .\admin.ps1 list
#   .\admin.ps1 create admin 123456
#   .\admin.ps1 change-password admin 123456
#   .\admin.ps1 delete admin
#
# Yêu cầu: docker-compose up đang chạy.

param(
    [Parameter(Position = 0)]
    [ValidateSet("create", "list", "change-password", "delete", "help")]
    [string]$Command = "help",

    [Parameter(Position = 1)]
    [string]$Username = "admin",

    [Parameter(Position = 2)]
    [string]$Password = ""
)

function Invoke-Seed {
    param([string[]]$ArgsList)
    & docker compose exec -T backend python -m src.seed @ArgsList
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

switch ($Command) {
    "create"          { Invoke-Seed @("create", $Username, $Password) }
    "list"            { Invoke-Seed @("list") }
    "change-password" { Invoke-Seed @("change-password", $Username, $Password) }
    "delete"          { Invoke-Seed @("delete", $Username) }
    default {
        Write-Host @"

Quản trị tài khoản admin TTGS2 (Docker)

  .\admin.ps1 list
  .\admin.ps1 create <username> <password>
  .\admin.ps1 change-password <username|id> <password>
  .\admin.ps1 delete <username|id>

"@
    }
}
