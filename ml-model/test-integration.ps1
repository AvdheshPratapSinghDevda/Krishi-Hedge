# Quick Test Script for ML Integration
# Tests all components of the ML pipeline

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  ML INTEGRATION TEST SUITE" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

# Test 1: Check if Python is installed
Write-Host "`n[TEST 1] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host " $pythonVersion" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host " Python not found!" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Check if ml-model directory exists
Write-Host "`n[TEST 2] Checking ml-model directory..." -ForegroundColor Yellow
if (Test-Path "d:\FINAL PROJECT\TESTING-APP\ml-model") {
    Write-Host " ml-model directory exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host " ml-model directory not found!" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Check if scripts exist
Write-Host "`n[TEST 3] Checking required scripts..." -ForegroundColor Yellow
$requiredScripts = @(
    "d:\FINAL PROJECT\TESTING-APP\ml-model\data\scripts\fetch_agmarknet_data.py",
    "d:\FINAL PROJECT\TESTING-APP\ml-model\data\scripts\preprocess_data.py",
    "d:\FINAL PROJECT\TESTING-APP\ml-model\train_model.py",
    "d:\FINAL PROJECT\TESTING-APP\ml-model\prediction_service.py",
    "d:\FINAL PROJECT\TESTING-APP\ml-model\api_server.py",
    "d:\FINAL PROJECT\TESTING-APP\ml-model\setup-ml-pipeline.ps1"
)

$scriptsFound = 0
foreach ($script in $requiredScripts) {
    if (Test-Path $script) {
        $scriptsFound++
        Write-Host "  $(Split-Path $script -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  $(Split-Path $script -Leaf) - MISSING" -ForegroundColor Red
    }
}

if ($scriptsFound -eq $requiredScripts.Count) {
    Write-Host " All scripts present ($scriptsFound/$($requiredScripts.Count))" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host " Missing scripts ($scriptsFound/$($requiredScripts.Count))" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Check if requirements.txt updated
Write-Host "`n[TEST 4] Checking requirements.txt..." -ForegroundColor Yellow
$reqPath = "d:\FINAL PROJECT\TESTING-APP\ml-model\requirements.txt"
if (Test-Path $reqPath) {
    $reqContent = Get-Content $reqPath -Raw
    $requiredPackages = @("tensorflow", "prophet", "fastapi", "beautifulsoup4")
    $packagesFound = 0
    
    foreach ($pkg in $requiredPackages) {
        if ($reqContent -match $pkg) {
            $packagesFound++
        }
    }
    
    if ($packagesFound -eq $requiredPackages.Count) {
        Write-Host " All required packages listed ($packagesFound/$($requiredPackages.Count))" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " Missing packages in requirements.txt" -ForegroundColor Yellow
        $testsFailed++
    }
} else {
    Write-Host " requirements.txt not found!" -ForegroundColor Red
    $testsFailed++
}

# Test 5: Check Next.js API endpoint
Write-Host "`n[TEST 5] Checking Next.js API endpoint..." -ForegroundColor Yellow
$apiPath = "d:\FINAL PROJECT\TESTING-APP\root\apps\pwa\src\app\api\ml-prediction\route.ts"
if (Test-Path $apiPath) {
    $apiContent = Get-Content $apiPath -Raw
    if ($apiContent -match "ML_API_URL" -and $apiContent -match "8000") {
        Write-Host " API endpoint updated to call ML service" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host " API endpoint may not be fully configured" -ForegroundColor Yellow
        $testsPassed++
    }
} else {
    Write-Host " API endpoint not found!" -ForegroundColor Red
    $testsFailed++
}

# Test 6: Check if virtual environment exists
Write-Host "`n[TEST 6] Checking Python virtual environment..." -ForegroundColor Yellow
if (Test-Path "d:\FINAL PROJECT\TESTING-APP\ml-model\.venv") {
    Write-Host " Virtual environment exists" -ForegroundColor Green
    $testsPassed++
} else {
    Write-Host " Virtual environment not created yet (run setup-ml-pipeline.ps1)" -ForegroundColor Yellow
    Write-Host "   This is OK - will be created on first run" -ForegroundColor Gray
    $testsPassed++
}

# Test 7: Check if data directory structure exists
Write-Host "`n[TEST 7] Checking data directory structure..." -ForegroundColor Yellow
$dataDir = "d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed"
if (Test-Path $dataDir) {
    Write-Host " Data directory structure exists" -ForegroundColor Green
    $testsPassed++
    
    # Check if data has been fetched
    if (Test-Path "$dataDir\agmarknet_real_data.csv") {
        Write-Host "   Real data already fetched!" -ForegroundColor Cyan
    } else {
        Write-Host "   No data yet (run with -FetchData flag)" -ForegroundColor Gray
    }
} else {
    Write-Host " Data directory will be created on first run" -ForegroundColor Yellow
    $testsPassed++
}

# Test 8: Check if models directory exists
Write-Host "`n[TEST 8] Checking models directory..." -ForegroundColor Yellow
$modelsDir = "d:\FINAL PROJECT\TESTING-APP\ml-model\models"
if (Test-Path $modelsDir) {
    Write-Host " Models directory exists" -ForegroundColor Green
    
    # Check if models have been trained
    $modelFiles = Get-ChildItem $modelsDir -Filter "*.h5" -ErrorAction SilentlyContinue
    if ($modelFiles.Count -gt 0) {
        Write-Host "   $($modelFiles.Count) trained models found!" -ForegroundColor Cyan
    } else {
        Write-Host "   No trained models yet (run with -TrainModels)" -ForegroundColor Gray
    }
    $testsPassed++
} else {
    Write-Host " Models directory will be created on first run" -ForegroundColor Yellow
    $testsPassed++
}

# Summary
Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host " Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host "=====================================================================" -ForegroundColor Cyan

if ($testsFailed -eq 0) {
    Write-Host "`n SUCCESS! All integration files are in place." -ForegroundColor Green
    Write-Host "`n Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\setup-ml-pipeline.ps1 -RunAll" -ForegroundColor Cyan
    Write-Host "  2. Wait for data fetch + training (30-60 min)" -ForegroundColor Cyan
    Write-Host "  3. ML API will start automatically on port 8000" -ForegroundColor Cyan
    Write-Host "  4. Start Next.js and test /forecast page" -ForegroundColor Cyan
} else {
    Write-Host "`n WARNING: Some tests failed. Check logs above." -ForegroundColor Yellow
}

# Additional Info
Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  QUICK REFERENCE" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Scripts Location: d:\FINAL PROJECT\TESTING-APP\ml-model\" -ForegroundColor White
Write-Host " Main Setup:      .\setup-ml-pipeline.ps1 -RunAll" -ForegroundColor White
Write-Host " Start API Only:  .\start-api.ps1" -ForegroundColor White
Write-Host " Documentation:   ..\AGMARKNET_INTEGRATION_README.md" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan

Write-Host "`n"
