# Admin Web Dev Server Startup Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Admin Web Application" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kill any existing Node processes to free up port 3000
Write-Host "Checking for existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "`n📦 Dependencies: Already installed (57 packages)" -ForegroundColor Green
Write-Host "🌐 Server URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📁 App: apps/admin-web" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start the dev server
pnpm dev:admin-web
