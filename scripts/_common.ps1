# ============================================================================
# Общие функции и переменные для скриптов развертывания
# ============================================================================

# Загружаем переменные из .env файла
function Load-Env {
    $envFile = Join-Path $PSScriptRoot "..\.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
            }
        }
        Write-Host "Loaded .env file" -ForegroundColor Green
    } else {
        Write-Host ".env file not found, using environment variables" -ForegroundColor Yellow
    }
}

# Вывод шага
function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host ">>> $Message <<<" -ForegroundColor Cyan
    Write-Host ""
}

# Вывод успеха
function Write-Success {
    param([string]$Message)
    Write-Host "$Message" -ForegroundColor Green
}

# Вывод ошибки
function Write-Error-Custom {
    param([string]$Message)
    Write-Host "$Message" -ForegroundColor Red
    throw $Message
}

# Загружаем переменные
Load-Env

# Основные переменные
$Script:RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")