"""
ML Model Prediction Service
Serves trained models for price prediction via API
"""

import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
import joblib
import json

try:
    import tensorflow as tf
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False

try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False


class PricePredictionService:
    """Service for making price predictions using trained models"""
    
    def __init__(self, model_dir: str = None):
        """
        Initialize prediction service
        
        Args:
            model_dir: Directory containing trained models
        """
        if model_dir is None:
            model_dir = Path(__file__).parent / "models"
        
        self.model_dir = Path(model_dir)
        self.models = {}
        self.scalers = {}
        self.feature_cols = {}
        
        self._load_models()
    
    def _load_models(self):
        """Load all trained models from disk"""
        print(f"📂 Loading models from {self.model_dir}...")
        
        if not self.model_dir.exists():
            print(f"⚠️  Model directory not found: {self.model_dir}")
            return
        
        # Load LSTM models
        if HAS_TENSORFLOW:
            for model_file in self.model_dir.glob("*_lstm.h5"):
                model_key = model_file.stem
                try:
                    self.models[model_key] = tf.keras.models.load_model(model_file)
                    
                    # Load corresponding scaler
                    scaler_file = self.model_dir / f"{model_key}_scaler.pkl"
                    if scaler_file.exists():
                        self.scalers[model_key] = joblib.load(scaler_file)
                    
                    # Load feature columns
                    features_file = self.model_dir / f"{model_key}_features.pkl"
                    if features_file.exists():
                        self.feature_cols[model_key] = joblib.load(features_file)
                    
                    print(f"✅ Loaded LSTM: {model_key}")
                except Exception as e:
                    print(f"❌ Failed to load {model_key}: {e}")
        
        # Load Prophet models
        if HAS_PROPHET:
            for model_file in self.model_dir.glob("*_prophet.pkl"):
                model_key = model_file.stem
                try:
                    self.models[model_key] = joblib.load(model_file)
                    print(f"✅ Loaded Prophet: {model_key}")
                except Exception as e:
                    print(f"❌ Failed to load {model_key}: {e}")
        
        print(f"✅ Loaded {len(self.models)} models")
    
    def predict_lstm(self, commodity: str, horizon: int, features: np.ndarray):
        """
        Make prediction using LSTM model
        
        Args:
            commodity: Commodity name
            horizon: Prediction horizon in days
            features: Feature array
            
        Returns:
            Predicted price
        """
        model_key = f"{commodity.lower()}_{horizon}d_lstm"
        
        if model_key not in self.models:
            raise ValueError(f"Model not found: {model_key}")
        
        # Scale features
        if model_key in self.scalers:
            features_scaled = self.scalers[model_key].transform(features)
        else:
            features_scaled = features
        
        # Create sequence (use last 30 timesteps)
        sequence_length = 30
        if len(features_scaled) >= sequence_length:
            sequence = features_scaled[-sequence_length:].reshape(1, sequence_length, -1)
        else:
            # Pad if not enough data
            pad_length = sequence_length - len(features_scaled)
            padded = np.pad(features_scaled, ((pad_length, 0), (0, 0)), mode='edge')
            sequence = padded.reshape(1, sequence_length, -1)
        
        # Predict
        prediction = self.models[model_key].predict(sequence, verbose=0)[0][0]
        
        return float(prediction)
    
    def predict_prophet(self, commodity: str, horizon: int, current_date: str = None):
        """
        Make prediction using Prophet model
        
        Args:
            commodity: Commodity name
            horizon: Prediction horizon in days
            current_date: Current date (YYYY-MM-DD)
            
        Returns:
            Predicted price and confidence intervals
        """
        model_key = f"{commodity.lower()}_{horizon}d_prophet"
        
        if model_key not in self.models:
            raise ValueError(f"Model not found: {model_key}")
        
        # Create future dataframe
        if current_date is None:
            current_date = datetime.now().strftime('%Y-%m-%d')
        
        future_dates = pd.DataFrame({
            'ds': pd.date_range(start=current_date, periods=horizon+1, freq='D')
        })
        
        # Predict
        forecast = self.models[model_key].predict(future_dates)
        
        # Get last prediction
        last_pred = forecast.iloc[-1]
        
        return {
            'price': float(last_pred['yhat']),
            'lower_bound': float(last_pred['yhat_lower']),
            'upper_bound': float(last_pred['yhat_upper']),
            'date': last_pred['ds'].strftime('%Y-%m-%d')
        }
    
    def predict_price(self, commodity: str, horizon: int = 7, 
                     historical_data: pd.DataFrame = None, model_type: str = 'prophet'):
        """
        Make price prediction for a commodity
        
        Args:
            commodity: Commodity name (Soybean, Mustard, Sesame, Groundnut)
            horizon: Prediction horizon in days (7 or 30)
            historical_data: Historical price data (for LSTM)
            model_type: 'lstm' or 'prophet'
            
        Returns:
            Prediction result dictionary
        """
        try:
            if model_type == 'lstm' and HAS_TENSORFLOW:
                if historical_data is None:
                    raise ValueError("LSTM model requires historical_data")
                
                # Prepare features from historical data
                # (This would extract the same features used in training)
                # For now, simplified version
                prediction = self.predict_lstm(commodity, horizon, historical_data)
                
                return {
                    'success': True,
                    'commodity': commodity,
                    'horizon_days': horizon,
                    'predicted_price': prediction,
                    'model': 'LSTM',
                    'prediction_date': (datetime.now() + timedelta(days=horizon)).strftime('%Y-%m-%d')
                }
            
            elif model_type == 'prophet' and HAS_PROPHET:
                result = self.predict_prophet(commodity, horizon)
                
                return {
                    'success': True,
                    'commodity': commodity,
                    'horizon_days': horizon,
                    'predicted_price': result['price'],
                    'confidence_interval': {
                        'lower': result['lower_bound'],
                        'upper': result['upper_bound']
                    },
                    'model': 'Prophet',
                    'prediction_date': result['date']
                }
            
            else:
                return {
                    'success': False,
                    'error': f"Model type '{model_type}' not available"
                }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_available_models(self):
        """Get list of available models"""
        return {
            'total_models': len(self.models),
            'models': list(self.models.keys()),
            'tensorflow_available': HAS_TENSORFLOW,
            'prophet_available': HAS_PROPHET
        }


# Global service instance
_service = None

def get_prediction_service():
    """Get or create prediction service singleton"""
    global _service
    if _service is None:
        model_dir = Path(__file__).parent / "models"
        _service = PricePredictionService(model_dir)
    return _service


def predict_commodity_price(commodity: str, horizon: int = 7, model_type: str = 'prophet'):
    """
    Convenience function for price prediction
    
    Args:
        commodity: Commodity name
        horizon: Days ahead to predict
        model_type: 'lstm' or 'prophet'
        
    Returns:
        Prediction result
    """
    service = get_prediction_service()
    return service.predict_price(commodity, horizon, model_type=model_type)


if __name__ == "__main__":
    # Test predictions
    service = PricePredictionService()
    
    print("\n📊 Available Models:")
    print(json.dumps(service.get_available_models(), indent=2))
    
    print("\n🔮 Testing Predictions:")
    for commodity in ['Soybean', 'Mustard', 'Sesame', 'Groundnut']:
        result = predict_commodity_price(commodity, horizon=7, model_type='prophet')
        if result['success']:
            print(f"\n{commodity} (7-day forecast):")
            print(f"  Predicted Price: ₹{result['predicted_price']:.2f}/quintal")
            print(f"  Date: {result['prediction_date']}")
        else:
            print(f"\n{commodity}: {result['error']}")
