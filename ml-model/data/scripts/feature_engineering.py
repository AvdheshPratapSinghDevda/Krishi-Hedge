"""
Feature Engineering Pipeline for Oilseed ML Model
Adds derived features for time series forecasting
"""

import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

class OilseedFeatureEngineer:
    """Create ML-ready features from oilseed market data"""
    
    def __init__(self):
        self.feature_list = []
        
    def add_temporal_features(self, df):
        """Add date-based features"""
        print("Adding temporal features...")
        
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        
        # Weekend indicator
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Month name for interpretability
        df['month_name'] = df['date'].dt.month_name()
        
        return df
    
    def add_seasonal_features(self, df):
        """Add season indicators based on Indian agricultural calendar"""
        print("Adding seasonal features...")
        
        def get_season(month):
            if month in [12, 1, 2]:
                return 'Winter'
            elif month in [3, 4, 5]:
                return 'Summer'
            elif month in [6, 7, 8, 9]:
                return 'Monsoon'
            else:  # 10, 11
                return 'Post-Monsoon'
        
        df['season'] = df['month'].apply(get_season)
        
        # Harvest season indicators for different crops
        df['is_soybean_harvest'] = df['month'].isin([10, 11, 12]).astype(int)
        df['is_mustard_harvest'] = df['month'].isin([2, 3, 4]).astype(int)
        df['is_groundnut_harvest'] = df['month'].isin([9, 10, 11]).astype(int)
        
        return df
    
    def add_festival_indicators(self, df):
        """Add major Indian festival indicators"""
        print("Adding festival indicators...")
        
        # Diwali (Oct-Nov)
        df['is_diwali_season'] = df['month'].isin([10, 11]).astype(int)
        
        # Holi (Mar)
        df['is_holi_season'] = df['month'].isin([3]).astype(int)
        
        # Pongal/Makar Sankranti (Jan)
        df['is_pongal_season'] = df['month'].isin([1]).astype(int)
        
        return df
    
    def add_price_features(self, df):
        """Add price-derived features"""
        print("Adding price features...")
        
        # Price spread
        df['price_spread'] = df['max_price'] - df['min_price']
        df['price_spread_pct'] = ((df['price_spread'] / df['modal_price']) * 100).round(2)
        
        # Price volatility indicator
        df['is_high_volatility'] = (df['price_spread_pct'] > 10).astype(int)
        
        return df
    
    def add_lag_features(self, df, lags=[1, 7, 30]):
        """Add lagged price features by commodity and market"""
        print(f"Adding lag features: {lags}")
        
        for lag in lags:
            df[f'price_lag_{lag}d'] = df.groupby(['commodity', 'market'])['modal_price'].shift(lag)
            df[f'arrivals_lag_{lag}d'] = df.groupby(['commodity', 'market'])['arrivals'].shift(lag)
        
        return df
    
    def add_rolling_features(self, df, windows=[7, 14, 30]):
        """Add rolling statistics by commodity and market"""
        print(f"Adding rolling window features: {windows}")
        
        for window in windows:
            # Rolling mean
            df[f'price_ma_{window}d'] = df.groupby(['commodity', 'market'])['modal_price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).mean()
            ).round(2)
            
            # Rolling std (volatility)
            df[f'price_std_{window}d'] = df.groupby(['commodity', 'market'])['modal_price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).std()
            ).round(2)
            
            # Rolling min/max
            df[f'price_min_{window}d'] = df.groupby(['commodity', 'market'])['modal_price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).min()
            ).round(2)
            
            df[f'price_max_{window}d'] = df.groupby(['commodity', 'market'])['modal_price'].transform(
                lambda x: x.rolling(window=window, min_periods=1).max()
            ).round(2)
            
            # Arrivals rolling mean
            df[f'arrivals_ma_{window}d'] = df.groupby(['commodity', 'market'])['arrivals'].transform(
                lambda x: x.rolling(window=window, min_periods=1).mean()
            ).round(2)
        
        return df
    
    def add_change_features(self, df):
        """Add price and arrival change features"""
        print("Adding change features...")
        
        # Day-over-day changes
        df['price_change_1d'] = df.groupby(['commodity', 'market'])['modal_price'].diff(1).round(2)
        df['price_change_pct_1d'] = (
            df.groupby(['commodity', 'market'])['modal_price'].pct_change(1) * 100
        ).round(2)
        
        # Week-over-week changes
        df['price_change_7d'] = df.groupby(['commodity', 'market'])['modal_price'].diff(7).round(2)
        df['price_change_pct_7d'] = (
            df.groupby(['commodity', 'market'])['modal_price'].pct_change(7) * 100
        ).round(2)
        
        # Month-over-month changes
        df['price_change_30d'] = df.groupby(['commodity', 'market'])['modal_price'].diff(30).round(2)
        df['price_change_pct_30d'] = (
            df.groupby(['commodity', 'market'])['modal_price'].pct_change(30) * 100
        ).round(2)
        
        # Arrivals changes
        df['arrivals_change_1d'] = df.groupby(['commodity', 'market'])['arrivals'].diff(1).round(2)
        df['arrivals_change_7d'] = df.groupby(['commodity', 'market'])['arrivals'].diff(7).round(2)
        
        return df
    
    def add_trend_features(self, df):
        """Add trend indicators"""
        print("Adding trend features...")
        
        # Price trend (based on 7-day MA vs 30-day MA)
        df['is_uptrend'] = (df['price_ma_7d'] > df['price_ma_30d']).astype(int)
        df['is_downtrend'] = (df['price_ma_7d'] < df['price_ma_30d']).astype(int)
        
        # Momentum indicator
        df['price_momentum'] = (df['modal_price'] - df['price_ma_30d']).round(2)
        
        return df
    
    def add_year_over_year_features(self, df):
        """Add year-over-year comparison features"""
        print("Adding year-over-year features...")
        
        # YoY price change (365 days lag)
        df['price_yoy'] = df.groupby(['commodity', 'market'])['modal_price'].diff(365).round(2)
        df['price_yoy_pct'] = (
            df.groupby(['commodity', 'market'])['modal_price'].pct_change(365) * 100
        ).round(2)
        
        return df
    
    def add_arrival_price_correlation(self, df):
        """Add features showing arrival-price relationship"""
        print("Adding arrival-price correlation features...")
        
        # Normalize arrivals for comparison
        df['arrivals_normalized'] = df.groupby(['commodity', 'market'])['arrivals'].transform(
            lambda x: (x - x.mean()) / x.std() if x.std() > 0 else 0
        ).round(2)
        
        # High/low arrival indicators
        df['is_high_arrivals'] = (
            df['arrivals'] > df.groupby(['commodity', 'market'])['arrivals'].transform('mean')
        ).astype(int)
        
        return df
    
    def engineer_all_features(self, df):
        """Apply all feature engineering steps"""
        print("\n" + "=" * 60)
        print("FEATURE ENGINEERING PIPELINE")
        print("=" * 60)
        
        # Make a copy to avoid modifying original
        df_engineered = df.copy()
        
        # Ensure date is datetime
        df_engineered['date'] = pd.to_datetime(df_engineered['date'])
        
        # Sort by commodity, market, and date
        df_engineered = df_engineered.sort_values(['commodity', 'market', 'date']).reset_index(drop=True)
        
        # Apply feature engineering steps
        df_engineered = self.add_temporal_features(df_engineered)
        df_engineered = self.add_seasonal_features(df_engineered)
        df_engineered = self.add_festival_indicators(df_engineered)
        df_engineered = self.add_price_features(df_engineered)
        df_engineered = self.add_lag_features(df_engineered)
        df_engineered = self.add_rolling_features(df_engineered)
        df_engineered = self.add_change_features(df_engineered)
        df_engineered = self.add_trend_features(df_engineered)
        df_engineered = self.add_year_over_year_features(df_engineered)
        df_engineered = self.add_arrival_price_correlation(df_engineered)
        
        print("\n" + "=" * 60)
        print("Feature engineering complete!")
        print(f"Original columns: {len(df.columns)}")
        print(f"Engineered columns: {len(df_engineered.columns)}")
        print(f"New features added: {len(df_engineered.columns) - len(df.columns)}")
        print("=" * 60)
        
        return df_engineered
    
    def create_train_test_split(self, df, test_size=0.2, validation_size=0.1):
        """Split data into train, validation, and test sets (time-based)"""
        print("\nCreating train/validation/test split...")
        
        # Sort by date
        df_sorted = df.sort_values('date').reset_index(drop=True)
        
        total_rows = len(df_sorted)
        test_rows = int(total_rows * test_size)
        val_rows = int(total_rows * validation_size)
        train_rows = total_rows - test_rows - val_rows
        
        # Time-based split
        train_df = df_sorted.iloc[:train_rows].copy()
        val_df = df_sorted.iloc[train_rows:train_rows+val_rows].copy()
        test_df = df_sorted.iloc[train_rows+val_rows:].copy()
        
        print(f"Train set: {len(train_df)} rows ({train_df['date'].min()} to {train_df['date'].max()})")
        print(f"Validation set: {len(val_df)} rows ({val_df['date'].min()} to {val_df['date'].max()})")
        print(f"Test set: {len(test_df)} rows ({test_df['date'].min()} to {test_df['date'].max()})")
        
        return train_df, val_df, test_df
    
    def save_engineered_data(self, df, output_dir, filename='ml_ready_dataset'):
        """Save engineered dataset"""
        output_path = Path(output_dir)
        
        # Save full dataset
        full_path = output_path / f"{filename}.csv"
        df.to_csv(full_path, index=False)
        print(f"\nSaved: {full_path}")
        
        # Save train/val/test splits
        train_df, val_df, test_df = self.create_train_test_split(df)
        
        train_path = output_path / "train_data.csv"
        val_path = output_path / "validation_data.csv"
        test_path = output_path / "test_data.csv"
        
        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)
        
        print(f"Saved: {train_path}")
        print(f"Saved: {val_path}")
        print(f"Saved: {test_path}")
        
        # Feature list
        feature_info = {
            'total_features': len(df.columns),
            'feature_names': list(df.columns),
            'feature_categories': {
                'temporal': [col for col in df.columns if any(x in col for x in ['year', 'month', 'day', 'week', 'quarter', 'season'])],
                'price_based': [col for col in df.columns if 'price' in col],
                'arrival_based': [col for col in df.columns if 'arrival' in col],
                'indicators': [col for col in df.columns if any(x in col for x in ['is_', 'festival', 'harvest'])],
                'rolling': [col for col in df.columns if any(x in col for x in ['_ma_', '_std_', '_min_', '_max_'])],
                'lag': [col for col in df.columns if '_lag_' in col],
                'change': [col for col in df.columns if 'change' in col],
            },
            'dataset_info': {
                'total_rows': len(df),
                'train_rows': len(train_df),
                'validation_rows': len(val_df),
                'test_rows': len(test_df),
                'date_range': {
                    'start': df['date'].min().strftime('%Y-%m-%d'),
                    'end': df['date'].max().strftime('%Y-%m-%d')
                }
            }
        }
        
        import json
        feature_info_path = output_path / "feature_info.json"
        with open(feature_info_path, 'w') as f:
            json.dump(feature_info, f, indent=2)
        print(f"Saved: {feature_info_path}")
        
        return full_path


def main():
    """Main execution function"""
    print("=" * 60)
    print("Oilseed Feature Engineering Pipeline")
    print("=" * 60)
    
    # Load processed data
    data_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed")
    combined_file = data_path / "combined_oilseed_data.csv"
    
    if not combined_file.exists():
        print(f"Error: {combined_file} not found!")
        print("Please run data_processor.py first to generate the combined dataset.")
        return
    
    print(f"\nLoading data from: {combined_file}")
    df = pd.read_csv(combined_file)
    print(f"Loaded {len(df)} records")
    
    # Initialize feature engineer
    engineer = OilseedFeatureEngineer()
    
    # Apply feature engineering
    df_ml_ready = engineer.engineer_all_features(df)
    
    # Save engineered data
    engineer.save_engineered_data(df_ml_ready, data_path)
    
    # Display sample
    print("\n" + "=" * 60)
    print("SAMPLE OF ENGINEERED DATA")
    print("=" * 60)
    print(df_ml_ready.head(10)[['commodity', 'market', 'date', 'modal_price', 'price_ma_7d', 'price_ma_30d', 'is_uptrend']])
    
    print("\n" + "=" * 60)
    print("Pipeline complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
