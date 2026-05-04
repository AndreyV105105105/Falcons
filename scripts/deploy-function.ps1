# ============================================================================
# Деплой Cloud Function auth-handler
# ============================================================================
# Запуск: .\scripts\deploy-function.ps1
# ============================================================================

. "$PSScriptRoot\_common.ps1"

$FUNCTION_NAME = "auth-handler"

# Папка, где лежат transport + core + requirements.txt
$BACKEND_PATH = Join-Path $Script:RepoRoot "backend"

Write-Step "Deploying function $FUNCTION_NAME"

if (-not (Test-Path $BACKEND_PATH)) {
    Write-Error-Custom "Folder $BACKEND_PATH not found"
}

# Создаём ZIP-архив из папки backend
Push-Location $BACKEND_PATH
$zipFile = Join-Path $Script:RepoRoot "auth-handler.zip"
if (Test-Path $zipFile) { Remove-Item $zipFile }

# Создаем временную папку для правильной сборки
$TEMP_DIR = "temp_build"
New-Item -ItemType Directory -Force -Path $TEMP_DIR | Out-Null

# Копируем туда только нужные папки и файлы (структура сохранится)
Copy-Item -Path "transport" -Destination $TEMP_DIR -Recurse
Copy-Item -Path "core" -Destination $TEMP_DIR -Recurse
Copy-Item -Path "requirements.txt" -Destination $TEMP_DIR

# Упаковываем Содержимое временной папки
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $zipFile -Force
Write-Success "ZIP archive created ($zipFile)"

# Убираем за собой мусор
Remove-Item -Path $TEMP_DIR -Recurse -Force
Pop-Location

# Создаём функцию (если не существует)
$ErrorActionPreference = "SilentlyContinue"
yc serverless function create --name $FUNCTION_NAME --description "Auth handler for password generator" 2>$null
$ErrorActionPreference = "Stop"

# Деплоим новую версию
yc serverless function version create `
  --function-name $FUNCTION_NAME `
  --runtime python312 `
  --entrypoint transport.cloud_function.handler `
  --memory 256m `
  --execution-timeout 15s `
  --service-account-id $env:SERVICE_ACCOUNT_ID `
  --source-path $zipFile `
  --environment YDB_ENDPOINT="$env:YDB_ENDPOINT",YDB_DATABASE="$env:YDB_DATABASE",YDB_USE_SSL="$env:YDB_USE_SSL",JWT_SECRET="$env:JWT_SECRET"

if ($LASTEXITCODE -eq 0) {
    Write-Success "Function $FUNCTION_NAME deployed"
} else {
    Write-Error-Custom "Deployment failed"
}

# Удаляем временный ZIP
Remove-Item $zipFile -ErrorAction SilentlyContinue