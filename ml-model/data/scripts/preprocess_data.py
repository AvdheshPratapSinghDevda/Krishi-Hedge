"""
Data Cleaning and Preprocessing Pipeline
Prepares AGMARKNET data for ML model training
"""

import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import json

class DataPreprocessor:
    """Clean and prepare market data for ML training"""
    
    def __init__(self, data_path: str):
        """
        Initialize preprocessor
        
        Args:
            data_path: Path to raw data file (CSV or JSON)
        """
        self.data_path = Path(data_path)
        self.df = None
        self.processed_df = None
        
    def load_data(self):
        """Load raw data from file"""
        print(f"📂 Loading data from {self.data_path}...")
        
        if self.data_path.suffix == '.csv':
            self.df = pd.read_csv(self.data_path, parse_dates=['date'])
        elif self.data_path.suffix == '.json':
            self.df = pd.read_json(self.data_path)
            self.df['date'] = pd.to_datetime(self.df['date'])
        else:
            raise ValueError(f"Unsupported file format: {self.data_path.suffix}")
        
        print(f"✅ Loaded {len(self.df):,} records")
        return self
    
    def handle_missing_values(self):
        """Handle missing values in the dataset"""
        print("\n🔍 Handling missing values...")
        
        # Show missing value summary
        missing = self.df.isnull().sum()
        if missing.sum() > 0:
            print("Missing values found:")
            print(missing[missing > 0])
        
        # Drop rows with missing critical fields
        critical_fields = ['date', 'commodity', 'modal_price']
        self.df = self.df.dropna(subset=critical_fields)
        
        # Fill missing arrivals with 0
        if 'arrivals' in self.df.columns:
            self.df['arrivals'] = self.df['arrivals'].fillna(0)
        
        # Fill missing min/max prices with modal price
        if 'min_price' in self.df.columns:
            self.df['min_price'] = self.df['min_price'].fillna(self.df['modal_price'] * 0.95)
        if 'max_price' in self.df.columns:
            self.df['max_price'] = self.df['max_price'].fillna(self.df['modal_price'] * 1.05)
        
        print(f"✅ Cleaned data: {len(self.df):,} records remaining")
        return self
    
    def remove_outliers(self, method='iqr', threshold=3):
        """
        Remove price outliers
        
        Args:
            method: 'iqr' (Interquartile Range) or 'zscore'
            threshold: Threshold for outlier detection
        """
        print(f"\n🎯 Removing outliers using {method.upper()} method...")
        
        initial_count = len(self.df)
        
        for commodity in self.df['commodity'].unique():
            mask = self.df['commodity'] == commodity
            prices = self.df.loc[mask, 'modal_price']
            
            if method == 'iqr':
                Q1 = prices.quantile(0.25)
                Q3 = prices.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - threshold * IQR
                upper_bound = Q3 + threshold * IQR
                
                outlier_mask = (prices < lower_bound) | (prices > upper_bound)
                self.df = self.df[~(mask & outlier_mask)]
                
            elif method == 'zscore':
                z_scores = np.abs((prices - prices.mean()) / prices.std())
                outlier_mask = z_scores > threshold
                self.df = self.df[~(mask & outlier_mask)]
        
        removed = initial_count - len(self.df)
        print(f"✅ Removed {removed:,} outliers ({removed/initial_count*100:.2f}%)")
        return self
    
    def add_time_features(self):
        """Add time-based features for ML model"""
        print("\n📅 Adding time-based features...")
        
        self.df['year'] = self.df['date'].dt.year
        self.df['month'] = self.df['date'].dt.month
        self.df['quarter'] = self.df['date'].dt.quarter
        self.df['day_of_year'] = self.df['date'].dt.dayofyear
        self.df['week_of_year'] = self.df['date'].dt.isocalendar().week
        self.df['day_of_week'] = self.df['date'].dt.dayofweek
        self.df['is_weekend'] = self.df['day_of_week'].isin([5, 6]).astype(int)
        
        # Season (meteorological)
        self.df['season'] = self.df['month'].map({
            12: 'Winter', 1: 'Winter', 2: 'Winter',
            3: 'Spring', 4: 'Spring', 5: 'Spring',
            6: 'Summer', 7: 'Summer', 8: 'Summer',
            9: 'Fall', 10: 'Fall', 11: 'Fall'
        })
        
        # Harvest season flags (commodity-specific)
        harvest_months = {
            'Soybean': [10, 11, 12],
            'Mustard': [2, 3, 4],
            'Sesame': [10, 11],
            'Groundnut': [10, 11, 12, 3, 4]
        }
        
        self.df['is_harvest_season'] = 0
        for commodity, months in harvest_months.items():
            mask = (self.df['commodity'] == commodity) & (self.df['month'].isin(months))
            self.df.loc[mask, 'is_harvest_season'] = 1
        
        print("✅ Added time features: year, month, quarter, season, harvest_season, etc.")
        return self
    
    def add_price_features(self):
        """Add price-based features"""
        print("\n💰 Adding price-based features...")
        
        # Sort by commodity, market, and date
        self.df = self.df.sort_values(['commodity', 'market', 'date'])
        
        # Price volatility (daily change)
        self.df['price_change'] = self.df.groupby(['commodity', 'market'])['modal_price'].diff()
        self.df['price_change_pct'] = self.df.groupby(['commodity', 'market'])['modal_price'].pct_change() * 100
        
        # Moving averages (7-day, 30-day, 90-day)
        for window in [7, 30, 90]:
            self.df[f'ma_{window}'] = self.df.groupby(['commodity', 'market'])['modal_price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).mean()
            )
        
        # Exponential moving average
        self.df['ema_30'] = self.df.groupby(['commodity', 'market'])['modal_price'].transform(
            lambda x: x.ewm(span=30, adjust=False).mean()
        )
        
        # Price momentum
        self.df['momentum_7'] = self.df['modal_price'] - self.df['ma_7']
        self.df['momentum_30'] = self.df['modal_price'] - self.df['ma_30']
        
        # Lag features (previous days' prices)
        for lag in [1, 7, 14, 30]:
            self.df[f'price_lag_{lag}'] = self.df.groupby(['commodity', 'market'])['modal_price'].shift(lag)
        
        print("✅ Added price features: moving averages, momentum, lags, etc.")
        return self
    
    def add_arrival_features(self):
        """Add arrival-based features"""
        print("\n📦 Adding arrival-based features...")
        
        if 'arrivals' not in self.df.columns:
            print("⚠️  No arrivals column found, skipping arrival features")
            return self
        
        # Arrival moving averages
        for window in [7, 30]:
            self.df[f'arrivals_ma_{window}'] = self.df.groupby(['commodity', 'market'])['arrivals'].transform(
                lambda x: x.rolling(window=window, min_periods=1).mean()
            )
        
        # Arrival change
        self.df['arrivals_change'] = self.df.groupby(['commodity', 'market'])['arrivals'].diff()
        
        # Supply indicator (high arrivals = more supply)
        self.df['high_supply'] = (self.df['arrivals'] > self.df['arrivals_ma_30']).astype(int)
        
        print("✅ Added arrival features")
        return self
    
    def create_target_variables(self, horizons=[1, 7, 30]):
        """
        Create prediction target variables
        
        Args:
            horizons: List of prediction horizons in days
        """
        print(f"\n🎯 Creating target variables for horizons: {horizons}")
        
        for horizon in horizons:
            target_col = f'target_price_{horizon}d'
            self.df[target_col] = self.df.groupby(['commodity', 'market'])['modal_price'].shift(-horizon)
            
            # Also create % change target
            change_col = f'target_change_{horizon}d'
            self.df[change_col] = ((self.df[target_col] - self.df['modal_price']) / 
                                    self.df['modal_price'] * 100)
        
        print(f"✅ Created targets for {len(horizons)} prediction horizons")
        return self
    
    def encode_categorical(self):
        """Encode categorical variables"""
        print("\n🏷️  Encoding categorical variables...")
        
        # One-hot encode commodity
        if 'commodity' in self.df.columns:
            commodity_dummies = pd.get_dummies(self.df['commodity'], prefix='commodity')
            self.df = pd.concat([self.df, commodity_dummies], axis=1)
        
        # Encode season
        if 'season' in self.df.columns:
            season_dummies = pd.get_dummies(self.df['season'], prefix='season')
            self.df = pd.concat([self.df, season_dummies], axis=1)
        
        # Label encode state and market (many categories)
        from sklearn.preprocessing import LabelEncoder
        
        for col in ['state', 'district', 'market']:
            if col in self.df.columns:
                le = LabelEncoder()
                self.df[f'{col}_encoded'] = le.fit_transform(self.df[col].astype(str))
        
        print("✅ Encoded categorical variables")
        return self
    
    def finalize(self):
        """Final cleanup and preparation"""
        print("\n🏁 Finalizing dataset...")
        
        # Drop rows with any NaN in target variables
        target_cols = [col for col in self.df.columns if col.startswith('target_')]
        self.df = self.df.dropna(subset=target_cols)
        
        # Reset index
        self.df = self.df.reset_index(drop=True)
        
        self.processed_df = self.df
        
        print(f"✅ Final dataset: {len(self.processed_df):,} records")
        print(f"   Features: {len(self.processed_df.columns)} columns")
        return self
    
    def save_processed_data(self, output_path: str = None):
        """Save processed data"""
        if output_path is None:
            output_path = self.data_path.parent / "processed_ml_data.csv"
        else:
            output_path = Path(output_path)
        
        print(f"\n💾 Saving processed data to {output_path}...")
        
        self.processed_df.to_csv(output_path, index=False)
        
        # Save feature metadata
        metadata = {
            'processed_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_records': len(self.processed_df),
            'total_features': len(self.processed_df.columns),
            'date_range': {
                'start': self.processed_df['date'].min().strftime('%Y-%m-%d'),
                'end': self.processed_df['date'].max().strftime('%Y-%m-%d')
            },
            'commodities': list(self.processed_df['commodity'].unique()),
            'features': {
                'time_features': [col for col in self.processed_df.columns if col in 
                                 ['year', 'month', 'quarter', 'season', 'is_harvest_season']],
                'price_features': [col for col in self.processed_df.columns if 'price' in col or 'ma_' in col],
                'arrival_features': [col for col in self.processed_df.columns if 'arrivals' in col],
                'target_variables': [col for col in self.processed_df.columns if col.startswith('target_')]
            }
        }
        
        metadata_path = output_path.parent / "processed_ml_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ Saved processed data: {output_path}")
        print(f"✅ Saved metadata: {metadata_path}")
        
        return output_path
    
    def get_summary(self):
        """Print dataset summary"""
        print("\n" + "="*80)
        print("📊 PROCESSED DATA SUMMARY")
        print("="*80)
        
        print(f"\nShape: {self.processed_df.shape}")
        print(f"Date Range: {self.processed_df['date'].min()} to {self.processed_df['date'].max()}")
        print(f"\nCommodities: {', '.join(self.processed_df['commodity'].unique())}")
        print(f"Markets: {self.processed_df['market'].nunique()}")
        print(f"States: {self.processed_df['state'].nunique()}")
        
        print("\n📈 Price Statistics:")
        print(self.processed_df.groupby('commodity')['modal_price'].describe())
        
        print("\n📦 Arrivals Statistics:")
        if 'arrivals' in self.processed_df.columns:
            print(self.processed_df.groupby('commodity')['arrivals'].describe())
        
        print("\n🎯 Target Variables Available:")
        target_cols = [col for col in self.processed_df.columns if col.startswith('target_')]
        for col in target_cols:
            print(f"  - {col}")
        
        print("\n" + "="*80)


def main():
    """Main preprocessing pipeline"""
    
    print("="*80)
    print("🧹 DATA PREPROCESSING PIPELINE")
    print("="*80)
    
    # Input/output paths
    data_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed\agmarknet_real_data.csv")
    output_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed\ml_ready_data.csv")
    
    # Check if input file exists
    if not data_path.exists():
        print(f"\n❌ Data file not found: {data_path}")
        print("Please run fetch_agmarknet_data.py first to download real market data.")
        return
    
    # Initialize preprocessor
    preprocessor = DataPreprocessor(data_path)
    
    # Run preprocessing pipeline
    preprocessor.load_data() \
        .handle_missing_values() \
        .remove_outliers(method='iqr', threshold=3) \
        .add_time_features() \
        .add_price_features() \
        .add_arrival_features() \
        .create_target_variables(horizons=[1, 7, 30]) \
        .encode_categorical() \
        .finalize()
    
    # Save processed data
    preprocessor.save_processed_data(output_path)
    
    # Print summary
    preprocessor.get_summary()
    
    print("\n✅ Preprocessing complete! Data ready for model training.")


if __name__ == "__main__":
    main()
