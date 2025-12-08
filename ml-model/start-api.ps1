# ML Model API Service Startup Script
# Starts the FastAPI server for serving ML predictions

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "ML Prediction API Server" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Navigate to ml-model directory
Set-Location "d:\FINAL PROJECT\TESTING-APP\ml-model"

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "`n Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "`n Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "`n Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

# Start FastAPI server
Write-Host "`n Starting ML Prediction API..." -ForegroundColor Green
Write-Host " API Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host " API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

python api_server.py
