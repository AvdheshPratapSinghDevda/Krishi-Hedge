# Quick Start Guide - Oilseed ML Dataset

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8 or higher
- Your CSV files on Desktop (already attached)

### Option 1: Run Everything (Automated)

```powershell
# Navigate to ml-model directory
cd "d:\FINAL PROJECT\TESTING-APP\ml-model"

# Run complete pipeline
.\run_pipeline.ps1
```

This will:
1. ✅ Install dependencies
2. ✅ Process your CSV files
3. ✅ Generate synthetic data
4. ✅ Create ML features
5. ✅ Validate data quality

**Output**: Ready-to-use ML datasets in `data/processed/`

---

### Option 2: Step-by-Step (Manual)

#### Step 1: Setup
```powershell
cd "d:\FINAL PROJECT\TESTING-APP\ml-model"
pip install -r requirements.txt
```

#### Step 2: Process Your CSVs
```powershell
python data\scripts\data_processor.py
```
**Creates**: `combined_oilseed_data.csv` from your Desktop CSVs

#### Step 3: Add More Commodities (Optional)
```powershell
python data\scripts\generate_synthetic_data.py
```
**Creates**: Synthetic Soybean, Mustard, Sesame data

#### Step 4: Create ML Features
```powershell
python data\scripts\feature_engineering.py
```
**Creates**: `ml_ready_dataset.csv` with 60+ features

#### Step 5: Validate Quality
```powershell
python data\scripts\data_validator.py
```
**Creates**: `validation_report.json` and `.txt`

---

## 📂 What You'll Get

```
ml-model/data/processed/
├── combined_oilseed_data.csv      # All your data merged
├── ml_ready_dataset.csv           # Feature-engineered data
├── train_data.csv                 # 70% for training
├── validation_data.csv            # 10% for tuning
├── test_data.csv                  # 20% for testing
├── dataset_summary.json           # Statistics
├── feature_info.json              # Feature documentation
└── validation_report.json         # Quality checks
```

---

## 🎯 Use Cases

### Price Forecasting Example

```python
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Load training data
train_df = pd.read_csv('data/processed/train_data.csv')

# Select features
features = [
    'price_lag_7d', 'price_ma_7d', 'price_ma_30d',
    'arrivals', 'month', 'is_groundnut_harvest'
]

X_train = train_df[features].fillna(method='ffill')
y_train = train_df['modal_price']

# Train model
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)
```

---

## 🔍 Quick Checks

### View Dataset Info
```powershell
python -c "import pandas as pd; df = pd.read_csv('data/processed/combined_oilseed_data.csv'); print(df.info()); print(df.describe())"
```

### Check Commodities
```powershell
python -c "import pandas as pd; df = pd.read_csv('data/processed/combined_oilseed_data.csv'); print(df['commodity'].value_counts())"
```

### Preview Data
```powershell
python -c "import pandas as pd; df = pd.read_csv('data/processed/ml_ready_dataset.csv'); print(df.head(10))"
```

---

## ⚠️ Troubleshooting

**Error: File not found**
- Run scripts from `ml-model/` directory
- Check that CSVs are on Desktop (C:\Users\HP\Desktop\)

**Error: Module not found**
- Run: `pip install -r requirements.txt`

**Warning: Missing values**
- Normal for lag features at start of time series
- Check `validation_report.txt` for details

**Error: Date parsing**
- CSVs should have dates in format: DD-MMM-YYYY or MM-YYYY

---

## 📊 Data Summary

Your attached CSVs contain:
- **Groundnut**: Monthly data (2023-2025)
- **Sunflower Oil**: Daily NCDEX data (Nov 2023 - Dec 2024)
- **Castor Oil**: Limited monthly data (2025)
- **Groundnut Oil**: Monthly synthetic (2020-2025)

After processing, you'll have:
- **~270 real records** from your CSVs
- **~16,000 synthetic records** (if generated)
- **60+ ML features** per record

---

## 🎓 Learning Resources

### Understand Your Data
1. Read `README.md` - Full documentation
2. Check `data_dictionary.json` - Field definitions
3. Review `validation_report.txt` - Data quality

### Feature Reference
- `feature_info.json` - Lists all 60+ features
- Grouped by: temporal, seasonal, price, lag, rolling, trend

### Model Training Tips
- Use `train_data.csv` for training
- Validate on `validation_data.csv`
- Test final model on `test_data.csv`
- Group by commodity (different price ranges)

---

## 📞 Next Steps

1. **Run Pipeline**: `.\run_pipeline.ps1`
2. **Check Output**: Open `data/processed/` folder
3. **Review Quality**: Read `validation_report.txt`
4. **Start ML**: Load `train_data.csv` in your notebook
5. **Read Docs**: See `README.md` for detailed guide

---

**Pro Tip**: Start with Groundnut or Sunflower Oil (most data) before trying other commodities.

**Ready? Run**: `.\run_pipeline.ps1` 🚀
