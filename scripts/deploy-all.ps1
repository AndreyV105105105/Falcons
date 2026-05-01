# ============================================================================
# Полный деплой: функция + API Gateway + бакет
# ============================================================================
# Запуск: .\scripts\deploy-all.ps1
# ============================================================================

. "$PSScriptRoot\_common.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     FULL DEPLOYMENT STARTED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Деплой функции
& "$PSScriptRoot\deploy-function.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

# Деплой API Gateway
& "$PSScriptRoot\deploy-gateway.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

# Синхронизация бакета
& "$PSScriptRoot\sync-bucket.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     DEPLOYMENT COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""