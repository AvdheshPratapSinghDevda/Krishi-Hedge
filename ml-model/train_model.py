"""
ML Model Training Pipeline
Trains LSTM and Prophet models on real AGMARKNET data for price prediction
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# ML libraries
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Deep Learning
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("⚠️  TensorFlow not installed. LSTM training will be skipped.")

# Time Series Forecasting
try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False
    print("⚠️  Prophet not installed. Prophet training will be skipped.")

# Statistical models
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX


class PricePredictionTrainer:
    """Train ML models for oilseed price prediction"""
    
    def __init__(self, data_path: str, model_dir: str = None):
        """
        Initialize trainer
        
        Args:
            data_path: Path to processed ML-ready data
            model_dir: Directory to save trained models
        """
        self.data_path = Path(data_path)
        self.model_dir = Path(model_dir) if model_dir else self.data_path.parent.parent / "models"
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.df = None
        self.models = {}
        self.scalers = {}
        self.metrics = {}
        
    def load_data(self):
        """Load preprocessed data"""
        print(f"📂 Loading data from {self.data_path}...")
        self.df = pd.read_csv(self.data_path, parse_dates=['date'])
        print(f"✅ Loaded {len(self.df):,} records")
        print(f"   Date range: {self.df['date'].min()} to {self.df['date'].max()}")
        return self
    
    def prepare_features(self, commodity: str, horizon: int = 7):
        """
        Prepare feature matrix and target for a specific commodity
        
        Args:
            commodity: Commodity name
            horizon: Prediction horizon in days
            
        Returns:
            X_train, X_test, y_train, y_test, scaler
        """
        print(f"\n🎯 Preparing features for {commodity} (horizon: {horizon} days)...")
        
        # Filter commodity data
        df_commodity = self.df[self.df['commodity'] == commodity].copy()
        df_commodity = df_commodity.sort_values('date')
        
        # Select features
        feature_cols = [
            'modal_price', 'min_price', 'max_price',
            'ma_7', 'ma_30', 'ma_90', 'ema_30',
            'momentum_7', 'momentum_30',
            'price_lag_1', 'price_lag_7', 'price_lag_14', 'price_lag_30',
            'month', 'quarter', 'day_of_year', 'is_harvest_season',
            'arrivals', 'arrivals_ma_7', 'arrivals_ma_30'
        ]
        
        # Filter available features
        feature_cols = [col for col in feature_cols if col in df_commodity.columns]
        
        target_col = f'target_price_{horizon}d'
        
        # Remove rows with NaN
        df_clean = df_commodity[feature_cols + [target_col]].dropna()
        
        print(f"   Features: {len(feature_cols)}")
        print(f"   Samples: {len(df_clean):,}")
        
        # Split features and target
        X = df_clean[feature_cols].values
        y = df_clean[target_col].values
        
        # Train-test split (80-20, chronological)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        print(f"   Train samples: {len(X_train):,}")
        print(f"   Test samples: {len(X_test):,}")
        
        return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_cols
    
    def train_lstm_model(self, commodity: str, horizon: int = 7, sequence_length: int = 30):
        """
        Train LSTM model for price prediction
        
        Args:
            commodity: Commodity name
            horizon: Prediction horizon in days
            sequence_length: Number of time steps to look back
        """
        if not HAS_TENSORFLOW:
            print("⚠️  TensorFlow not available, skipping LSTM training")
            return None
        
        print(f"\n{'='*80}")
        print(f"🧠 Training LSTM Model: {commodity} ({horizon}-day forecast)")
        print(f"{'='*80}")
        
        # Prepare data
        X_train, X_test, y_train, y_test, scaler, feature_cols = self.prepare_features(commodity, horizon)
        
        # Reshape for LSTM (samples, time_steps, features)
        # Create sequences
        def create_sequences(X, y, seq_length):
            X_seq, y_seq = [], []
            for i in range(len(X) - seq_length):
                X_seq.append(X[i:i+seq_length])
                y_seq.append(y[i+seq_length])
            return np.array(X_seq), np.array(y_seq)
        
        X_train_seq, y_train_seq = create_sequences(X_train, y_train, sequence_length)
        X_test_seq, y_test_seq = create_sequences(X_test, y_test, sequence_length)
        
        print(f"   Sequence shape: {X_train_seq.shape}")
        
        # Build LSTM model
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(sequence_length, X_train.shape[1])),
            Dropout(0.2),
            LSTM(64, return_sequences=False),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        # Early stopping
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        
        # Train
        print("\n🏋️  Training LSTM model...")
        history = model.fit(
            X_train_seq, y_train_seq,
            validation_split=0.2,
            epochs=100,
            batch_size=32,
            callbacks=[early_stop],
            verbose=0
        )
        
        # Evaluate
        y_pred = model.predict(X_test_seq, verbose=0).flatten()
        
        mae = mean_absolute_error(y_test_seq, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test_seq, y_pred))
        r2 = r2_score(y_test_seq, y_pred)
        mape = np.mean(np.abs((y_test_seq - y_pred) / y_test_seq)) * 100
        
        print(f"\n📊 LSTM Performance:")
        print(f"   MAE:  ₹{mae:.2f}")
        print(f"   RMSE: ₹{rmse:.2f}")
        print(f"   R²:   {r2:.4f}")
        print(f"   MAPE: {mape:.2f}%")
        
        # Save model
        model_key = f"{commodity.lower()}_{horizon}d_lstm"
        model_path = self.model_dir / f"{model_key}.h5"
        scaler_path = self.model_dir / f"{model_key}_scaler.pkl"
        
        model.save(model_path)
        joblib.dump(scaler, scaler_path)
        joblib.dump(feature_cols, self.model_dir / f"{model_key}_features.pkl")
        
        print(f"✅ Saved model: {model_path}")
        
        # Store metrics
        self.metrics[model_key] = {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2),
            'mape': float(mape),
            'train_samples': len(X_train_seq),
            'test_samples': len(X_test_seq)
        }
        
        self.models[model_key] = model
        self.scalers[model_key] = scaler
        
        return model
    
    def train_prophet_model(self, commodity: str, horizon: int = 7):
        """
        Train Prophet model for price prediction
        
        Args:
            commodity: Commodity name
            horizon: Prediction horizon in days
        """
        if not HAS_PROPHET:
            print("⚠️  Prophet not available, skipping Prophet training")
            return None
        
        print(f"\n{'='*80}")
        print(f"📈 Training Prophet Model: {commodity} ({horizon}-day forecast)")
        print(f"{'='*80}")
        
        # Prepare data for Prophet
        df_commodity = self.df[self.df['commodity'] == commodity][['date', 'modal_price']].copy()
        df_commodity = df_commodity.rename(columns={'date': 'ds', 'modal_price': 'y'})
        df_commodity = df_commodity.sort_values('ds')
        
        # Train-test split
        split_idx = int(len(df_commodity) * 0.8)
        train_df = df_commodity[:split_idx]
        test_df = df_commodity[split_idx:]
        
        # Initialize and train Prophet
        print("\n🔮 Training Prophet model...")
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.05
        )
        
        # Add custom seasonality for harvest
        model.add_seasonality(name='harvest', period=365.25, fourier_order=5)
        
        model.fit(train_df)
        
        # Predict on test set
        future = model.make_future_dataframe(periods=horizon, freq='D')
        forecast = model.predict(future)
        
        # Evaluate on test set
        test_forecast = forecast[forecast['ds'].isin(test_df['ds'])]
        y_test = test_df['y'].values
        y_pred = test_forecast['yhat'].values[:len(y_test)]
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        print(f"\n📊 Prophet Performance:")
        print(f"   MAE:  ₹{mae:.2f}")
        print(f"   RMSE: ₹{rmse:.2f}")
        print(f"   R²:   {r2:.4f}")
        print(f"   MAPE: {mape:.2f}%")
        
        # Save model
        model_key = f"{commodity.lower()}_{horizon}d_prophet"
        model_path = self.model_dir / f"{model_key}.pkl"
        
        joblib.dump(model, model_path)
        print(f"✅ Saved model: {model_path}")
        
        # Store metrics
        self.metrics[model_key] = {
            'mae': float(mae),
            'rmse': float(rmse),
            'r2': float(r2),
            'mape': float(mape),
            'train_samples': len(train_df),
            'test_samples': len(test_df)
        }
        
        self.models[model_key] = model
        
        return model
    
    def train_all_models(self, commodities: list = None, horizons: list = [7, 30]):
        """
        Train models for all commodities and horizons
        
        Args:
            commodities: List of commodities (None = all)
            horizons: List of prediction horizons in days
        """
        if commodities is None:
            commodities = self.df['commodity'].unique()
        
        print(f"\n{'='*80}")
        print(f"🚀 TRAINING ALL MODELS")
        print(f"{'='*80}")
        print(f"Commodities: {', '.join(commodities)}")
        print(f"Horizons: {horizons} days")
        print(f"{'='*80}\n")
        
        for commodity in commodities:
            for horizon in horizons:
                # Train LSTM
                if HAS_TENSORFLOW:
                    self.train_lstm_model(commodity, horizon)
                
                # Train Prophet
                if HAS_PROPHET:
                    self.train_prophet_model(commodity, horizon)
        
        # Save all metrics
        self.save_metrics()
        
        print(f"\n{'='*80}")
        print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
        print(f"{'='*80}")
        
    def save_metrics(self):
        """Save training metrics to JSON"""
        metrics_path = self.model_dir / "model_metrics.json"
        
        metrics_summary = {
            'trained_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_models': len(self.metrics),
            'models': self.metrics
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics_summary, f, indent=2)
        
        print(f"\n💾 Saved metrics: {metrics_path}")
        
        # Print summary table
        print(f"\n{'='*80}")
        print("📊 MODEL PERFORMANCE SUMMARY")
        print(f"{'='*80}")
        print(f"{'Model':<40} {'MAE':>10} {'RMSE':>10} {'R²':>8} {'MAPE':>8}")
        print("-" * 80)
        
        for model_name, metrics in self.metrics.items():
            print(f"{model_name:<40} ₹{metrics['mae']:>9.2f} ₹{metrics['rmse']:>9.2f} {metrics['r2']:>7.4f} {metrics['mape']:>7.2f}%")
        
        print(f"{'='*80}\n")


def main():
    """Main training pipeline"""
    
    print("="*80)
    print("🤖 ML MODEL TRAINING PIPELINE")
    print("="*80)
    
    # Paths
    data_path = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\data\processed\ml_ready_data.csv")
    model_dir = Path(r"d:\FINAL PROJECT\TESTING-APP\ml-model\models")
    
    # Check if data exists
    if not data_path.exists():
        print(f"\n❌ Processed data not found: {data_path}")
        print("Please run preprocess_data.py first.")
        return
    
    # Initialize trainer
    trainer = PricePredictionTrainer(data_path, model_dir)
    
    # Load data
    trainer.load_data()
    
    # Train models for all commodities
    commodities = ['Soybean', 'Mustard', 'Sesame', 'Groundnut']
    horizons = [7, 30]  # 1-week and 1-month forecasts
    
    trainer.train_all_models(commodities, horizons)
    
    print("\n✅ Training complete! Models ready for deployment.")


if __name__ == "__main__":
    main()
