# Complete ML Pipeline Setup and Execution Script
# Fetches real data, trains models, starts API server

param(
    [switch]$FetchData,
    [switch]$TrainModels,
    [switch]$StartAPI,
    [switch]$RunAll
)

$ErrorActionPreference = "Continue"

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  AGMARKNET ML PIPELINE - Smart India Hackathon 2025" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# Set working directory
Set-Location "d:\FINAL PROJECT\TESTING-APP\ml-model"

# Step 1: Create virtual environment if needed
if (-not (Test-Path ".venv")) {
    Write-Host "`n[1/6] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    Write-Host " Virtual environment created" -ForegroundColor Green
}

# Step 2: Activate virtual environment
Write-Host "`n[2/6] Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Step 3: Install dependencies
Write-Host "`n[3/6] Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "    This may take 5-10 minutes for first-time setup..." -ForegroundColor Gray
pip install -r requirements.txt --upgrade --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host " Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host " Warning: Some dependencies may have failed to install" -ForegroundColor Yellow
}

# Step 4: Fetch real market data (if requested or RunAll)
if ($FetchData -or $RunAll) {
    Write-Host "`n[4/6] Fetching real market data from AGMARKNET..." -ForegroundColor Yellow
    Write-Host "    Target: 10 years of historical data" -ForegroundColor Gray
    Write-Host "    Commodities: Soybean, Mustard, Sesame, Groundnut" -ForegroundColor Gray
    Write-Host "`n    Note: This may take 10-30 minutes depending on API response" -ForegroundColor Gray
    Write-Host "    You can get free API key from: https://data.gov.in/`n" -ForegroundColor Cyan
    
    # Check for API key
    $apiKey = $env:DATA_GOV_IN_API_KEY
    if (-not $apiKey) {
        Write-Host "    No API key found in environment variable" -ForegroundColor Yellow
        $apiKey = Read-Host "    Enter data.gov.in API key (or press Enter to try without)"
        if ($apiKey) {
            $env:DATA_GOV_IN_API_KEY = $apiKey
        }
    }
    
    python data\scripts\fetch_agmarknet_data.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n Data fetch completed!" -ForegroundColor Green
    } else {
        Write-Host "`n Warning: Data fetch had errors. Check logs above." -ForegroundColor Yellow
    }
}

# Step 5: Preprocess data
if ($FetchData -or $RunAll) {
    Write-Host "`n[4.5/6] Preprocessing fetched data..." -ForegroundColor Yellow
    python data\scripts\preprocess_data.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Data preprocessing completed!" -ForegroundColor Green
    } else {
        Write-Host " Warning: Preprocessing had errors" -ForegroundColor Yellow
    }
}

# Step 6: Train ML models (if requested or RunAll)
if ($TrainModels -or $RunAll) {
    Write-Host "`n[5/6] Training ML models (LSTM + Prophet)..." -ForegroundColor Yellow
    Write-Host "    This will train models for all commodities" -ForegroundColor Gray
    Write-Host "    Estimated time: 15-30 minutes`n" -ForegroundColor Gray
    
    # Check if processed data exists
    $processedData = "data\processed\ml_ready_data.csv"
    if (-not (Test-Path $processedData)) {
        Write-Host " Error: Processed data not found at $processedData" -ForegroundColor Red
        Write-Host "    Please run with -FetchData flag first" -ForegroundColor Yellow
    } else {
        python train_model.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n Model training completed!" -ForegroundColor Green
            Write-Host " Trained models saved to: models/" -ForegroundColor Cyan
        } else {
            Write-Host "`n Warning: Model training had errors" -ForegroundColor Yellow
        }
    }
}

# Step 7: Start API server (if requested or RunAll)
if ($StartAPI -or $RunAll) {
    Write-Host "`n[6/6] Starting ML Prediction API Server..." -ForegroundColor Yellow
    
    # Check if models exist
    $modelDir = "models"
    if (-not (Test-Path $modelDir)) {
        Write-Host " Error: No trained models found in $modelDir" -ForegroundColor Red
        Write-Host "    Please run with -TrainModels flag first" -ForegroundColor Yellow
    } else {
        Write-Host "`n=====================================================================" -ForegroundColor Green
        Write-Host "  ML PREDICTION API SERVER" -ForegroundColor Green
        Write-Host "=====================================================================" -ForegroundColor Green
        Write-Host " API Endpoint: http://localhost:8000" -ForegroundColor Cyan
        Write-Host " API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
        Write-Host " Status:       http://localhost:8000/" -ForegroundColor Cyan
        Write-Host "`n Next.js will call this API for real ML predictions" -ForegroundColor Yellow
        Write-Host " Press Ctrl+C to stop the server`n" -ForegroundColor Gray
        Write-Host "=====================================================================" -ForegroundColor Green
        
        python api_server.py
    }
}

# If no flags specified, show help
if (-not ($FetchData -or $TrainModels -or $StartAPI -or $RunAll)) {
    Write-Host "`n=====================================================================" -ForegroundColor Yellow
    Write-Host "  USAGE GUIDE" -ForegroundColor Yellow
    Write-Host "=====================================================================" -ForegroundColor Yellow
    Write-Host "`nAvailable options:" -ForegroundColor White
    Write-Host "  -FetchData      Fetch real market data from AGMARKNET (10+ years)" -ForegroundColor Cyan
    Write-Host "  -TrainModels    Train LSTM and Prophet models on fetched data" -ForegroundColor Cyan
    Write-Host "  -StartAPI       Start the ML prediction API server" -ForegroundColor Cyan
    Write-Host "  -RunAll         Run complete pipeline (fetch + train + start)" -ForegroundColor Cyan
    
    Write-Host "`nExamples:" -ForegroundColor White
    Write-Host "  .\setup-ml-pipeline.ps1 -FetchData     # Fetch data only" -ForegroundColor Gray
    Write-Host "  .\setup-ml-pipeline.ps1 -TrainModels   # Train models only" -ForegroundColor Gray
    Write-Host "  .\setup-ml-pipeline.ps1 -StartAPI      # Start API only" -ForegroundColor Gray
    Write-Host "  .\setup-ml-pipeline.ps1 -RunAll        # Complete setup" -ForegroundColor Gray
    
    Write-Host "`nRecommended for first-time setup:" -ForegroundColor Yellow
    Write-Host "  .\setup-ml-pipeline.ps1 -RunAll" -ForegroundColor Green
    
    Write-Host "`nFor evaluators/demo:" -ForegroundColor Yellow
    Write-Host "  1. .\setup-ml-pipeline.ps1 -RunAll     # One-time setup" -ForegroundColor Cyan
    Write-Host "  2. .\setup-ml-pipeline.ps1 -StartAPI   # Start API before demo" -ForegroundColor Cyan
    Write-Host "  3. Open Next.js app (http://localhost:3000/forecast)" -ForegroundColor Cyan
    
    Write-Host "`n=====================================================================" -ForegroundColor Yellow
}

Write-Host "`n"
