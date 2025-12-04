# Kill any existing Node processes
Write-Host "Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clean the .next cache
Write-Host "Cleaning .next cache..." -ForegroundColor Yellow
if (Test-Path ".\apps\pwa\.next") {
    Remove-Item -Recurse -Force ".\apps\pwa\.next" -ErrorAction SilentlyContinue
    Write-Host ".next cache cleared" -ForegroundColor Green
}

# Start the dev server
Write-Host "`nStarting PWA dev server..." -ForegroundColor Cyan
Write-Host "Server will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

pnpm dev:pwa
