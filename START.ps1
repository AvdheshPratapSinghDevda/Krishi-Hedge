# 🚀 Krishi Hedge - Quick Start Script
# Starts both ML Service and PWA

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║     🌾 KRISHI HEDGE - Real-Time Price Platform 🌾    ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Smart India Hackathon 2025 - Problem Statement SIH25274" -ForegroundColor Cyan
Write-Host ""

# Function to test if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if services are already running
if (Test-Port 8000) {
    Write-Host "⚠️  Port 8000 is already in use (ML Service might be running)" -ForegroundColor Yellow
    $response = Read-Host "Do you want to continue anyway? (y/n)"
    if ($response -ne 'y') {
        exit
    }
}

if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use (PWA might be running)" -ForegroundColor Yellow
    $response = Read-Host "Do you want to continue anyway? (y/n)"
    if ($response -ne 'y') {
        exit
    }
}

Write-Host ""
Write-Host "📋 Starting services in the following order:" -ForegroundColor Cyan
Write-Host "   1. ML Service (Port 8000)" -ForegroundColor White
Write-Host "   2. PWA Application (Port 3000)" -ForegroundColor White
Write-Host ""

# Start ML Service
Write-Host "🤖 Starting ML Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'g:\SIH FINALS\TeamKartavya-SIH25274\root\services\ml'; Write-Host '🤖 ML SERVICE - Real-time Price Engine' -ForegroundColor Cyan; Write-Host ''; python main.py"

# Wait for ML service to start
Write-Host "⏳ Waiting for ML service to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start PWA
Write-Host "💻 Starting PWA Application..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'g:\SIH FINALS\TeamKartavya-SIH25274\root\apps\pwa'; Write-Host '💻 PWA - Krishi Hedge Platform' -ForegroundColor Cyan; Write-Host ''; pnpm dev"

Write-Host ""
Write-Host "✅ Services are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📡 Access Points:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🌐 PWA Application:     http://localhost:3000" -ForegroundColor White
Write-Host "   📊 Forecast Dashboard:  http://localhost:3000/forecast" -ForegroundColor White
Write-Host "   🤖 ML API Service:      http://localhost:8000" -ForegroundColor White
Write-Host "   📚 API Documentation:   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Features:" -ForegroundColor Cyan
Write-Host "   ✓ Real-time price updates (auto-refresh every 30s)" -ForegroundColor Green
Write-Host "   ✓ 4 Commodities: Soybean, Mustard, Groundnut, Sunflower" -ForegroundColor Green
Write-Host "   ✓ AI-powered 7-day price predictions" -ForegroundColor Green
Write-Host "   ✓ Historical data with 6 timeframes (1D to 1Y)" -ForegroundColor Green
Write-Host "   ✓ Interactive charts with confidence intervals" -ForegroundColor Green
Write-Host "   ✓ Live price ticker with change indicators" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Please wait 10-15 seconds for services to fully start..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 10

# Try to open browser
Write-Host "🌐 Opening browser..." -ForegroundColor Green
try {
    Start-Process "http://localhost:3000/forecast"
} catch {
    Write-Host "⚠️  Could not open browser automatically" -ForegroundColor Yellow
    Write-Host "   Please open manually: http://localhost:3000/forecast" -ForegroundColor White
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "ℹ️  Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   • Two terminal windows will open" -ForegroundColor White
Write-Host "   • Keep both terminals running" -ForegroundColor White
Write-Host "   • Press Ctrl+C in either terminal to stop that service" -ForegroundColor White
Write-Host "   • Check REAL_TIME_DATA_GUIDE.md for detailed documentation" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Ready for Smart India Hackathon 2025!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
