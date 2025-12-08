# Test ML API Integration
# Run this script to verify the API endpoints are working

Write-Host "🧪 Testing ML API Integration..." -ForegroundColor Cyan
Write-Host ""

# Test 1: ML Data Endpoint
Write-Host "📊 Test 1: Fetching historical data for Groundnut (1M)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/ml-data?commodity=Groundnut&timeframe=1M' -Method GET
    Write-Host "✅ Success! Retrieved $($response.data.Count) data points" -ForegroundColor Green
    Write-Host "   Current Price: ₹$($response.currentPrice)" -ForegroundColor Green
    Write-Host "   Price Change: $($response.priceChangePercent)%" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: ML Data Endpoint - Soybean
Write-Host "📊 Test 2: Fetching historical data for Soybean (3M)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/ml-data?commodity=Soybean&timeframe=3M' -Method GET
    Write-Host "✅ Success! Retrieved $($response.data.Count) data points" -ForegroundColor Green
    Write-Host "   Current Price: ₹$($response.currentPrice)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Prediction Endpoint
Write-Host "🔮 Test 3: Generating predictions for Groundnut (7 days)..." -ForegroundColor Yellow
try {
    $body = @{
        commodity = "Groundnut"
        days = 7
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/ml-prediction' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'
    
    Write-Host "✅ Success! Generated $($response.predictions.Count) predictions" -ForegroundColor Green
    Write-Host "   Model: $($response.metrics.model)" -ForegroundColor Green
    Write-Host "   Trend: $($response.metrics.trend)" -ForegroundColor Green
    Write-Host "   Volatility: $($response.metrics.volatility)" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Predictions:" -ForegroundColor Cyan
    foreach ($pred in $response.predictions) {
        Write-Host "      $($pred.date): ₹$([math]::Round($pred.predictedPrice, 2)) (confidence: $($pred.confidence)%)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Sunflower Oil
Write-Host "📊 Test 4: Fetching historical data for Sunflower Oil (1Y)..." -ForegroundColor Yellow
try {
    $sunflowerUrl = 'http://localhost:3000/api/ml-data?commodity=Sunflower%20Oil&timeframe=1Y'
    $response = Invoke-RestMethod -Uri $sunflowerUrl -Method GET
    Write-Host "✅ Success! Retrieved $($response.data.Count) data points" -ForegroundColor Green
    Write-Host "   Current Price: ₹$($response.currentPrice)" -ForegroundColor Green
    Write-Host "   Statistics:" -ForegroundColor Cyan
    Write-Host "      Avg Price: ₹$([math]::Round($response.statistics.avgPrice, 2))" -ForegroundColor White
    Write-Host "      Min Price: ₹$($response.statistics.minPrice)" -ForegroundColor White
    Write-Host "      Max Price: ₹$($response.statistics.maxPrice)" -ForegroundColor White
    Write-Host "      Total Volume: $($response.statistics.totalVolume) qtls" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "🎉 Integration test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3000/forecast in your browser" -ForegroundColor White
Write-Host "   2. Select different commodities (Soybean, Mustard, Groundnut, Sunflower)" -ForegroundColor White
Write-Host "   3. Try different timeframes (1D, 1W, 1M, 3M, 6M, 1Y)" -ForegroundColor White
Write-Host "   4. Verify charts display real ML data" -ForegroundColor White
Write-Host ""
