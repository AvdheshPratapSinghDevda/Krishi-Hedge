# Oilseed Market Dataset for ML Training

## Overview
Comprehensive dataset of Indian oilseed commodity market data (AGMARK/NCDEX format) for machine learning model training and price forecasting.

## Dataset Information

### Commodities Covered
- **Groundnut** (Bold variety) - Rajkot, Gujarat
- **Groundnut Oil** (Filtered) - Rajkot, Gujarat  
- **Sunflower Oil** (Refined) - Mumbai, Maharashtra (NCDEX)
- **Castor Oil** (Commercial) - Ahmedabad, Gujarat
- **Soybean** (Yellow, Synthetic) - Indore, Bhopal, Rajkot
- **Mustard** (Black, Synthetic) - Jaipur, Bharatpur, Alwar
- **Sesame** (White, Synthetic) - Hyderabad, Bangalore, Rajkot

### Date Range
- **Real Data**: November 2023 - December 2024
- **Synthetic Data**: January 2020 - December 2024
- **Total Coverage**: ~5 years

### Data Sources
- AGMARK historical commodity data
- NCDEX trading data  
- Synthetic data generated using realistic market patterns

## Directory Structure

```
ml-model/
├── data/
│   ├── raw/                    # Original CSV files
│   ├── processed/              # Cleaned and standardized data
│   │   ├── combined_oilseed_data.csv       # Merged dataset
│   │   ├── ml_ready_dataset.csv            # Feature-engineered dataset
│   │   ├── train_data.csv                  # Training set (70%)
│   │   ├── validation_data.csv             # Validation set (10%)
│   │   ├── test_data.csv                   # Test set (20%)
│   │   ├── dataset_summary.json            # Statistics
│   │   ├── feature_info.json               # Feature metadata
│   │   └── validation_report.json          # Quality checks
│   └── scripts/                # Processing scripts
│       ├── data_processor.py               # Data cleaning
│       ├── generate_synthetic_data.py      # Synthetic data generator
│       ├── feature_engineering.py          # ML feature creation
│       └── data_validator.py               # Quality validation
└── requirements.txt            # Python dependencies
```

## Data Schema

### Core Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `commodity` | String | Commodity name | "Groundnut" |
| `variety` | String | Variety/grade | "Bold" |
| `market` | String | Market/trading center | "Rajkot" |
| `district` | String | District | "Rajkot" |
| `state` | String | State | "Gujarat" |
| `date` | Date | Trading date | "2024-01-15" |
| `modal_price` | Float | Most frequent price (₹/Quintal) | 5500.00 |
| `min_price` | Float | Minimum price (₹/Quintal) | 5200.00 |
| `max_price` | Float | Maximum price (₹/Quintal) | 5800.00 |
| `arrivals` | Float | Quantity arrived (Quintals) | 150.00 |
| `unit` | String | Measurement unit | "Quintal" |

### Additional Fields (Real Data)

| Field | Type | Description |
|-------|------|-------------|
| `volume_lakhs` | Float | Trading volume (₹ in Lakhs) |
| `adtv` | Float | Average Daily Trading Volume |

### Engineered Features (ML-Ready Dataset)

**Temporal Features** (12 features)
- `year`, `month`, `day`, `day_of_week`, `day_of_year`
- `week_of_year`, `quarter`, `is_weekend`, `month_name`

**Seasonal Features** (5 features)
- `season` (Winter, Summer, Monsoon, Post-Monsoon)
- `is_soybean_harvest`, `is_mustard_harvest`, `is_groundnut_harvest`

**Festival Indicators** (3 features)
- `is_diwali_season`, `is_holi_season`, `is_pongal_season`

**Price Features** (4 features)
- `price_spread` = max_price - min_price
- `price_spread_pct` = (spread / modal_price) × 100
- `is_high_volatility` (boolean)

**Lag Features** (6 features)
- `price_lag_1d`, `price_lag_7d`, `price_lag_30d`
- `arrivals_lag_1d`, `arrivals_lag_7d`, `arrivals_lag_30d`

**Rolling Window Features** (15 features)
- `price_ma_7d`, `price_ma_14d`, `price_ma_30d` (Moving averages)
- `price_std_7d`, `price_std_14d`, `price_std_30d` (Volatility)
- `price_min_7d/14d/30d`, `price_max_7d/14d/30d`
- `arrivals_ma_7d/14d/30d`

**Change Features** (8 features)
- `price_change_1d`, `price_change_pct_1d`
- `price_change_7d`, `price_change_pct_7d`
- `price_change_30d`, `price_change_pct_30d`
- `arrivals_change_1d`, `arrivals_change_7d`

**Trend Features** (4 features)
- `is_uptrend`, `is_downtrend`, `price_momentum`

**Year-over-Year Features** (2 features)
- `price_yoy`, `price_yoy_pct`

**Arrival-Price Features** (2 features)
- `arrivals_normalized`, `is_high_arrivals`

**Total Engineered Features: 60+**

## Usage Instructions

### 1. Setup Environment

```powershell
# Navigate to ml-model directory
cd "d:\FINAL PROJECT\TESTING-APP\ml-model"

# Install dependencies
pip install -r requirements.txt
```

### 2. Process Real Data

```powershell
# Convert attached CSVs to AGMARK format
python data\scripts\data_processor.py
```

**Output:**
- `combined_oilseed_data.csv` - Merged real data
- `dataset_summary.json` - Statistics

### 3. Generate Synthetic Data (Optional)

```powershell
# Generate Soybean, Mustard, Sesame data
python data\scripts\generate_synthetic_data.py
```

**Output:**
- `synthetic_oilseed_data.csv` - Additional commodities
- Individual commodity files

### 4. Feature Engineering

```powershell
# Add ML features to dataset
python data\scripts\feature_engineering.py
```

**Output:**
- `ml_ready_dataset.csv` - Full feature set
- `train_data.csv`, `validation_data.csv`, `test_data.csv`
- `feature_info.json` - Feature documentation

### 5. Validate Data Quality

```powershell
# Run quality checks
python data\scripts\data_validator.py
```

**Output:**
- `validation_report.json` - Detailed validation results
- `validation_report.txt` - Human-readable report

## Data Quality Checks

### Validation Performed
✅ Missing value detection  
✅ Date continuity checks  
✅ Price anomaly detection (IQR method)  
✅ Zero value analysis  
✅ Price consistency (min ≤ modal ≤ max)  
✅ Data coverage by commodity/market  
✅ Statistical sanity checks  
✅ Duplicate record detection  

### Quality Metrics
- **Completeness**: % of non-null values in critical fields
- **Consistency**: Price ordering validation
- **Coverage**: Records per commodity/market
- **Anomalies**: Statistical outliers flagged
- **Continuity**: Date gap analysis

## Dataset Statistics

### Record Counts (Approximate)
- **Groundnut**: 8-12 records (monthly data)
- **Sunflower Oil**: 250+ records (daily data)
- **Castor Oil**: 2 records (limited activity)
- **Groundnut Oil**: 15-20 records (monthly synthetic)
- **Soybean** (Synthetic): 5400+ records (3 markets × 5 years)
- **Mustard** (Synthetic): 5400+ records (3 markets × 5 years)
- **Sesame** (Synthetic): 5400+ records (3 markets × 5 years)

### Price Ranges (₹/Quintal)
| Commodity | Typical Range |
|-----------|---------------|
| Groundnut | ₹5,000 - ₹7,000 |
| Soybean | ₹4,000 - ₹5,500 |
| Mustard | ₹5,200 - ₹7,000 |
| Sesame | ₹10,000 - ₹14,000 |
| Sunflower Oil | Varies by volume |

## ML Use Cases

### Supported Tasks
1. **Price Forecasting** - Predict future commodity prices
2. **Trend Analysis** - Identify uptrend/downtrend patterns
3. **Seasonality Detection** - Harvest season impacts
4. **Volatility Prediction** - Price spread forecasting
5. **Arrival Prediction** - Supply forecasting
6. **Market Comparison** - Cross-market analysis

### Recommended Models
- **Time Series**: ARIMA, SARIMA, Prophet
- **Machine Learning**: Random Forest, XGBoost, LightGBM
- **Deep Learning**: LSTM, GRU, Transformer
- **Ensemble**: Stacking multiple models

### Feature Selection Tips
- **For Short-term Prediction**: Use lag features (1d, 7d)
- **For Long-term Prediction**: Use rolling averages (30d), seasonal features
- **For Volatility**: Use std features, price_spread
- **For Trend**: Use is_uptrend, price_momentum

## Data Limitations

### Real Data
- **Limited History**: Most data from 2023-2024 only
- **Sparse Records**: Some commodities have monthly aggregation
- **Zero Trading Days**: Weekends and holidays have zero values
- **Market Holidays**: Indian market holidays affect continuity

### Synthetic Data
- **Pattern-Based**: Generated using mathematical models
- **Simplified Events**: Festival impacts are approximated
- **No External Factors**: Weather, policy changes not modeled
- **Market Correlation**: Cross-commodity effects simplified

## Best Practices

### Data Preparation
1. **Handle Missing Values**: Use forward-fill for lag features
2. **Outlier Treatment**: Keep outliers for training, flag for analysis
3. **Normalization**: Scale prices by commodity (different ranges)
4. **Train/Test Split**: Use time-based split (not random)

### Feature Engineering
1. **Commodity-Specific**: Engineer features per commodity
2. **Market Context**: Keep market as categorical feature
3. **Lag Selection**: Test different lag windows (1, 3, 7, 14, 30 days)
4. **Rolling Windows**: Match to forecasting horizon

### Model Training
1. **Group by Commodity**: Train separate models per commodity
2. **Cross-Validation**: Use time series CV (not K-fold)
3. **Seasonal Adjustment**: Account for harvest seasons
4. **Evaluation Metrics**: RMSE, MAE, MAPE for price prediction

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError`  
**Solution**: `pip install -r requirements.txt`

**Issue**: File not found errors  
**Solution**: Ensure you've run scripts in order (processor → synthetic → features → validator)

**Issue**: High missing value percentages  
**Solution**: Expected for lag/rolling features at start of series

**Issue**: Date parsing errors  
**Solution**: Check CSV date format matches expected formats

## Future Enhancements

### Data
- [ ] Add more historical years (2018-2019)
- [ ] Include more markets per commodity
- [ ] Add weather data integration
- [ ] Include policy event indicators
- [ ] Add global price benchmarks

### Features
- [ ] Cross-commodity correlation features
- [ ] Weather-based features (rainfall, temperature)
- [ ] Sentiment analysis from news
- [ ] Government policy indicators
- [ ] Export/import volume features

### Scripts
- [ ] Automated AGMARK data scraper
- [ ] Real-time data update pipeline
- [ ] Advanced anomaly detection
- [ ] Auto-correlation analysis
- [ ] Feature importance ranking

## References

### Data Sources
- [AGMARK](https://agmarknet.gov.in/) - Agricultural Marketing Information Network
- [NCDEX](https://www.ncdex.com/) - National Commodity & Derivatives Exchange

### Documentation
- Indian Agricultural Marketing Seasons
- Commodity Trading Standards (NCDEX/MCX)
- AGMARK Grading Standards

## License & Attribution

This dataset is compiled for educational and ML training purposes. Real market data is sourced from public AGMARK/NCDEX sources. Synthetic data is generated algorithmically.

**Note**: Not for commercial trading decisions. Use for ML model development only.

---

## Contact & Support

For questions about the dataset structure or scripts:
1. Check validation reports in `data/processed/`
2. Review feature_info.json for feature definitions
3. Examine dataset_summary.json for statistics

**Last Updated**: December 2024
