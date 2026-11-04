# MIFEM MIS - Setup Script
Write-Host "=== MIFEM Management Information System Setup ===" -ForegroundColor Cyan
Write-Host ""

# Install frontend dependencies
Write-Host "[1/2] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -LiteralPath "Frontend_Mifem"
npm install
$frontendOk = $?
Set-Location -LiteralPath ".."
if ($frontendOk) {
    Write-Host "  Frontend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Failed to install frontend dependencies." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "[2/2] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -LiteralPath "Backend_MIFEM"
npm install
$backendOk = $?
Set-Location -LiteralPath ".."
if ($backendOk) {
    Write-Host "  Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  Failed to install backend dependencies." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start development:" -ForegroundColor White
Write-Host "  Frontend: cd Frontend_Mifem; npm run dev" -ForegroundColor Gray
Write-Host "  Backend:  cd Backend_MIFEM; npm run dev" -ForegroundColor Gray
