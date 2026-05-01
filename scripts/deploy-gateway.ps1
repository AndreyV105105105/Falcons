# ============================================================================
# Деплой API Gateway
# ============================================================================
# Запуск: .\scripts\deploy-gateway.ps1
# ============================================================================

. "$PSScriptRoot\_common.ps1"

$GATEWAY_NAME = "backend-gateway"
$SPEC_FILE = Join-Path $Script:RepoRoot "api-gateway.yaml"

Write-Step "Updating API Gateway $GATEWAY_NAME"

if (-not (Test-Path $SPEC_FILE)) {
    Write-Error-Custom "Spec file $SPEC_FILE not found"
}

yc serverless api-gateway update --name $GATEWAY_NAME --spec $SPEC_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Success "API Gateway updated"
} else {
    Write-Error-Custom "Update failed"
}