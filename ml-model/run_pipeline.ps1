# Oilseed Dataset Generation Pipeline
# Master script to run all data processing steps

Write-Host "=" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host "OILSEED ML DATASET GENERATION PIPELINE"
Write-Host "=" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host ""

$ErrorActionPreference = "Continue"
$ScriptsDir = "d:\FINAL PROJECT\TESTING-APP\ml-model\data\scripts"
$OutputDir = "d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed"

# Check if Python is available
Write-Host "Checking Python installation..."
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Cyan
Write-Host "-" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "-" -NoNewline }; Write-Host ""
python -m pip install -r "d:\FINAL PROJECT\TESTING-APP\ml-model\requirements.txt" --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Processing real data (CSV files)..." -ForegroundColor Cyan
Write-Host "-" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "-" -NoNewline }; Write-Host ""
python "$ScriptsDir\data_processor.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Data processing failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Real data processed successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Generating synthetic data..." -ForegroundColor Cyan
Write-Host "-" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "-" -NoNewline }; Write-Host ""
python "$ScriptsDir\generate_synthetic_data.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Synthetic data generation had issues (optional step)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Synthetic data generated" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 4: Feature engineering..." -ForegroundColor Cyan
Write-Host "-" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "-" -NoNewline }; Write-Host ""
python "$ScriptsDir\feature_engineering.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Feature engineering failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ ML-ready dataset created" -ForegroundColor Green

Write-Host ""
Write-Host "Step 5: Data validation..." -ForegroundColor Cyan
Write-Host "-" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "-" -NoNewline }; Write-Host ""
python "$ScriptsDir\data_validator.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Validation completed with warnings" -ForegroundColor Yellow
} else {
    Write-Host "✓ Data validation passed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host "PIPELINE COMPLETE!" -ForegroundColor Green
Write-Host "=" -NoNewline; for ($i=0; $i -lt 79; $i++) { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host ""
Write-Host "Generated Files:" -ForegroundColor Cyan
Write-Host "  📊 Combined dataset: $OutputDir\combined_oilseed_data.csv"
Write-Host "  🤖 ML-ready dataset: $OutputDir\ml_ready_dataset.csv"
Write-Host "  📈 Training data: $OutputDir\train_data.csv"
Write-Host "  📉 Validation data: $OutputDir\validation_data.csv"
Write-Host "  🧪 Test data: $OutputDir\test_data.csv"
Write-Host "  📋 Summary: $OutputDir\dataset_summary.json"
Write-Host "  📝 Features: $OutputDir\feature_info.json"
Write-Host "  ✅ Validation: $OutputDir\validation_report.json"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review validation_report.txt for data quality issues"
Write-Host "  2. Check feature_info.json for available features"
Write-Host "  3. Use train_data.csv for ML model training"
Write-Host "  4. See README.md for usage examples"
Write-Host ""
