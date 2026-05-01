# ============================================================================
# Синхронизация фронтенда с бакетом Yandex Cloud Object Storage
# ============================================================================
# Запуск: .\scripts\sync-bucket.ps1
# Но перед запуском проверьте фронтенд, он должен быть собран (папка dist должна существовать)
# Перейдите в папку frontend и сделайте npm run build
# ============================================================================

. "$PSScriptRoot\_common.ps1"

$BUCKET_NAME = "falcons-generator-ui"
$DIST_PATH = Join-Path $Script:RepoRoot "frontend\dist"

Write-Step "Syncing frontend to bucket $BUCKET_NAME"

# Проверяем, существует ли папка dist (собранный фронтенд)
if (-not (Test-Path $DIST_PATH)) {
    Write-Host "   Папка $DIST_PATH не найдена!" -ForegroundColor Red
    Write-Host "   Сначала собери фронтенд: cd frontend; npm run build" -ForegroundColor Yellow
    exit 1
}

# Синхронизируем файлы с бакетом через yc storage
Get-ChildItem -Path $DIST_PATH -File | ForEach-Object {
    Write-Host "Uploading: $($_.Name)"
    yc storage object upload --bucket-name $BUCKET_NAME --source $_.FullName --name $_.Name 2>$null
}

Write-Success "Бакет синхронизирован: https://$BUCKET_NAME.website.yandexcloud.net"node --version
