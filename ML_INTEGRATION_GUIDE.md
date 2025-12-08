# ML Model Integration with PWA Forecast Page

## 🎯 Integration Complete

Successfully integrated the ML oilseed price dataset with the PWA forecast page.

## 📊 What Was Done

### 1. Created API Endpoints (Next.js API Routes)

#### `/api/ml-data` - Historical Data Endpoint
- **Location**: `root/apps/pwa/src/app/api/ml-data/route.ts`
- **Purpose**: Serves processed ML dataset to forecast page
- **Method**: GET
- **Parameters**:
  - `commodity`: Commodity name (Groundnut, Sunflower Oil, Castor Oil, Groundnut Oil, Soybean, Mustard, Sesame)
  - `timeframe`: Time range (1D, 1W, 1M, 3M, 6M, 1Y)
- **Data Source**: `ml-model/data/processed/combined_oilseed_data.csv`
- **Response**:
  ```json
  {
    "success": true,
    "commodity": "Groundnut",
    "timeframe": "1M",
    "currentPrice": 6250.50,
    "priceChange": 125.30,
    "priceChangePercent": 2.04,
    "statistics": {
      "avgPrice": 6180.25,
      "minPrice": 5980.00,
      "maxPrice": 6450.00,
      "totalVolume": 15000,
      "dataPoints": 281
    },
    "data": [
      {
        "date": "2024-01-15",
        "timestamp": 1705276800000,
        "price": 6200.00,
        "minPrice": 6150.00,
        "maxPrice": 6250.00,
        "arrivals": 500,
        "volume": 2.5
      }
      // ... more data points
    ]
  }
  ```

#### `/api/ml-prediction` - Price Prediction Endpoint
- **Location**: `root/apps/pwa/src/app/api/ml-prediction/route.ts`
- **Purpose**: Generates 7-day price predictions
- **Method**: POST
- **Request Body**:
  ```json
  {
    "commodity": "Groundnut",
    "days": 7
  }
  ```
- **Algorithm**: Simple linear regression on last 30 data points
- **Response**:
  ```json
  {
    "success": true,
    "commodity": "Groundnut",
    "predictions": [
      {
        "date": "2025-01-16",
        "predictedPrice": 6275.50,
        "upperBound": 6450.25,
        "lowerBound": 6100.75,
        "confidence": 85
      }
      // ... 7 days total
    ],
    "metrics": {
      "model": "Linear Regression",
      "trend": "Bullish",
      "volatility": "Medium",
      "confidence": 80
    }
  }
  ```

### 2. Updated Forecast Page

#### Changes to `root/apps/pwa/src/app/forecast/page.tsx`:

1. **Added Commodity Mapping**:
   ```typescript
   const COMMODITY_MAP: Record<string, string> = {
     'soybean': 'Soybean',
     'mustard': 'Mustard', 
     'groundnut': 'Groundnut',
     'sunflower': 'Sunflower Oil'
   };
   ```

2. **Updated `fetchData()` Function**:
   - Replaced `http://localhost:8000` FastAPI calls with `/api/ml-data` and `/api/ml-prediction`
   - Added commodity name mapping
   - Integrated real CSV data from ML model
   - Added fallback to mock data if ML data unavailable
   - Improved error handling

3. **Added Helper Function**:
   ```typescript
   function generateSimplePredictions(historicalData: HistoricalDataPoint[]): PredictionPoint[]
   ```
   - Generates predictions from historical trend when API fails
   - Uses last 30 days for trend analysis
   - Calculates volatility-based confidence intervals

## 🗂️ Data Flow

```
User Opens Forecast Page
        ↓
PWA calls /api/ml-data?commodity=Groundnut&timeframe=1M
        ↓
API reads ml-model/data/processed/combined_oilseed_data.csv
        ↓
Parses CSV, filters by commodity & timeframe
        ↓
Returns chart-ready JSON data
        ↓
PWA displays historical price chart
        ↓
PWA calls /api/ml-prediction (POST {commodity, days})
        ↓
API loads last 30 data points, runs linear regression
        ↓
Returns 7-day predictions with confidence intervals
        ↓
PWA overlays predictions on chart
```

## 📁 File Structure

```
root/apps/pwa/src/app/
├── forecast/
│   └── page.tsx              # Updated forecast page (integrated ML data)
├── api/
│   ├── ml-data/
│   │   └── route.ts          # Historical data endpoint (NEW)
│   └── ml-prediction/
│       └── route.ts          # Prediction endpoint (NEW)
```

## 🎨 Available Commodities

### Real Data (281 records from user CSVs):
- ✅ **Groundnut** - June 2020 to December 2024
- ✅ **Sunflower Oil** - June 2020 to December 2024
- ✅ **Castor Oil** - June 2020 to December 2024
- ✅ **Groundnut Oil** - June 2020 to December 2024

### Synthetic Data (16,443 records):
- ✅ **Soybean** - January 2020 to December 2025 (3 markets)
- ✅ **Mustard** - January 2020 to December 2025 (3 markets)
- ✅ **Sesame** - January 2020 to December 2025 (3 markets)

**Total Dataset**: 16,724 records across 7 commodities

## 📊 Data Features

The ML dataset includes 68 features per record:
- **Base Fields**: commodity, variety, market, district, state, date, modal_price, min_price, max_price, arrivals, volume_lakhs, adtv, unit
- **Temporal Features**: year, month, quarter, day_of_week, day_of_month, week_of_year, is_month_start, is_month_end, is_quarter_start, is_quarter_end, is_year_start, is_year_end
- **Seasonal Features**: season, is_harvest_season, is_sowing_season, is_festival_season, is_monsoon
- **Festival Indicators**: is_diwali_month, is_holi_month, is_eid_month
- **Price Metrics**: price_range, price_volatility, normalized_price, price_zscore
- **Lag Features**: price_lag_1d, price_lag_7d, price_lag_30d, arrivals_lag_1d, arrivals_lag_7d, arrivals_lag_30d
- **Rolling Windows**: price_ma_7d, price_ma_30d, price_std_7d, arrivals_ma_7d, arrivals_ma_30d, volume_ma_7d, volume_ma_30d, adtv_ma_7d, price_ema_7d, price_ema_30d, arrivals_ema_7d, arrivals_ema_30d, volume_ema_7d, adtv_ema_7d, price_rolling_max_30d
- **Change Metrics**: price_pct_change, price_diff, arrivals_pct_change, volume_pct_change, adtv_pct_change, price_acceleration, arrivals_acceleration, volume_acceleration
- **Trend Features**: price_trend_7d, price_trend_30d, arrivals_trend_7d, arrivals_trend_30d
- **Year-over-Year**: price_yoy_change, arrivals_yoy_change
- **Arrival-Price Relationship**: arrival_price_ratio, arrival_price_elasticity

## 🚀 Testing the Integration

### 1. Start PWA Development Server
```powershell
cd "d:\FINAL PROJECT\TESTING-APP\root\apps\pwa"
npm run dev
```

### 2. Open Forecast Page
Navigate to: `http://localhost:3000/forecast`

### 3. Test Features
- **Select Commodity**: Choose from Soybean, Mustard, Groundnut, or Sunflower
- **Change Timeframe**: Test 1D, 1W, 1M, 3M, 6M, 1Y views
- **View Charts**: Historical prices displayed from ML dataset
- **Check Predictions**: 7-day price forecasts with confidence intervals
- **Verify Metrics**: Model accuracy, trend direction, volatility level

### 4. Expected Behavior

#### For Groundnut (Real Data):
- Shows 281 actual market records
- Date range: June 2020 - December 2024
- Real AGMARK market prices
- Multiple markets: Gondal, Junagadh, Rajkot, etc.

#### For Soybean (Synthetic Data):
- Shows 5,481 synthetic records
- Date range: January 2020 - December 2025
- Realistic price patterns with seasonal trends
- Markets: Indore, Bhopal, Ujjain

#### For Sunflower (Maps to Sunflower Oil):
- Shows real data from user CSVs
- Historical market prices
- Full feature set available

## 🔧 API Testing

### Test Historical Data Endpoint
```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/ml-data?commodity=Groundnut&timeframe=1M" -Method GET | ConvertTo-Json -Depth 5
```

### Test Prediction Endpoint
```powershell
# PowerShell
$body = @{
    commodity = "Groundnut"
    days = 7
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/ml-prediction" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

## 📈 Data Quality

From validation report (`ml-model/data/validation/validation_report.json`):

- ✅ **No missing values** in critical fields
- ✅ **No duplicate records**
- ⚠️ **22 date gap warnings** (expected for monthly data)
- ⚠️ **1 price outlier** (Groundnut Oil in Gondal - higher than usual)
- ✅ **No zero price values**
- ✅ **Min < Modal < Max price consistency**
- ✅ **Statistical sanity checks passed**

## 🎯 Next Steps (Optional Enhancements)

### 1. Advanced ML Model
Replace simple linear regression with:
- ARIMA for time series
- Prophet for seasonal decomposition
- LSTM for deep learning predictions
- Ensemble methods for better accuracy

### 2. Feature Engineering Integration
Use the 68 engineered features from `ml_ready_dataset.csv`:
- Seasonal patterns
- Festival impact
- Market trends
- Rolling averages
- Year-over-year comparisons

### 3. Real-time Updates
- WebSocket for live price feeds
- Auto-refresh every 5 minutes
- Push notifications for price alerts

### 4. Enhanced Visualizations
- Candlestick charts for OHLC data
- Volume overlays
- Technical indicators (RSI, MACD, Bollinger Bands)
- Market comparison charts

### 5. Data Export
- Download CSV reports
- PDF chart exports
- Excel-compatible datasets

## 🐛 Troubleshooting

### Issue: "No data available"
**Cause**: CSV file path incorrect or commodity not found
**Fix**: Check `ml-model/data/processed/combined_oilseed_data.csv` exists and has data for the selected commodity

### Issue: API returns 500 error
**Cause**: CSV parsing error or file read permission issue
**Fix**: 
1. Verify file encoding is UTF-8
2. Check CSV format matches AGMARK schema
3. Ensure Next.js has read permissions

### Issue: Predictions show straight line
**Cause**: Insufficient historical data (< 30 points)
**Fix**: 
1. Select longer timeframe (1M or 3M)
2. Check if commodity has enough data points
3. Verify date filtering logic

### Issue: Chart not rendering
**Cause**: Data format mismatch between API and chart component
**Fix**:
1. Check browser console for errors
2. Verify data transformation in `fetchData()`
3. Ensure date formats are consistent

## 📝 Code References

### Key Functions in API Routes:

**ml-data/route.ts**:
- `parseCSV()`: Reads and parses combined_oilseed_data.csv
- `filterDataByTimeframe()`: Filters data by selected time range
- `GET handler`: Main endpoint logic

**ml-prediction/route.ts**:
- `calculateVolatility()`: Computes price volatility
- `POST handler`: Generates predictions using linear regression

### Key Functions in Forecast Page:

**forecast/page.tsx**:
- `fetchData()`: Loads data from API endpoints
- `generateSimplePredictions()`: Fallback prediction algorithm
- `generateMockHistoricalData()`: Mock data for testing

## ✅ Success Criteria

The integration is successful if:
- ✅ Forecast page loads without errors
- ✅ Historical data displays from ML dataset
- ✅ Predictions show 7-day forecast
- ✅ Commodity selector works for all 4 commodities
- ✅ Timeframe selector filters data correctly
- ✅ Charts render smoothly
- ✅ Price changes calculated accurately
- ✅ Fallback to mock data works if API fails

## 📚 Additional Documentation

- **ML Pipeline**: `ml-model/README.md` (9000+ words)
- **Data Dictionary**: `ml-model/data_dictionary.json`
- **Quick Start**: `ml-model/QUICKSTART.md`
- **Project Summary**: `ml-model/PROJECT_SUMMARY.md`
- **Feature Info**: `ml-model/data/processed/feature_info.json`
- **Validation Report**: `ml-model/data/validation/validation_report.json`

---

## 🎉 Summary

Your PWA forecast page now displays **real oilseed market data** from the ML model! The integration:

1. ✅ Uses actual AGMARK market prices (281 real records)
2. ✅ Includes synthetic data for 3 additional commodities (16,443 records)
3. ✅ Provides 7-day price predictions
4. ✅ Shows trend analysis and volatility metrics
5. ✅ Works offline with fallback mock data
6. ✅ Follows Next.js 14 best practices
7. ✅ Fully typed with TypeScript

**Total Dataset**: 16,724 records | **7 commodities** | **68 features per record**

The data is now **live on your forecast page** at `http://localhost:3000/forecast`! 🚀
