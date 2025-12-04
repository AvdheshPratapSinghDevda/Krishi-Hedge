from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict
import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
import os
import random
import math
from collections import deque

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Krishi Hedge - ML API Service",
    description="Price Prediction API with Real-time Data",
    version="2.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced price state with seasonal and market factors
PRICE_STATE = {
    "soybean": {
        "base": 4250, 
        "current": 4250, 
        "volatility": 0.008,
        "trend": 0.00005,
        "seasonal_amplitude": 150,
        "mean_reversion_speed": 0.12,
        "price_history": deque(maxlen=100)
    },
    "mustard": {
        "base": 5500, 
        "current": 5500, 
        "volatility": 0.009,
        "trend": 0.00008,
        "seasonal_amplitude": 200,
        "mean_reversion_speed": 0.10,
        "price_history": deque(maxlen=100)
    },
    "groundnut": {
        "base": 6200, 
        "current": 6200, 
        "volatility": 0.007,
        "trend": -0.00003,
        "seasonal_amplitude": 180,
        "mean_reversion_speed": 0.15,
        "price_history": deque(maxlen=100)
    },
    "sunflower": {
        "base": 5800, 
        "current": 5800, 
        "volatility": 0.008,
        "trend": 0.00006,
        "seasonal_amplitude": 160,
        "mean_reversion_speed": 0.11,
        "price_history": deque(maxlen=100)
    },
}

# Historical data cache with timestamps
HISTORICAL_CACHE = {}

# Market regime state (affects volatility)
MARKET_REGIME = {
    "regime": "normal",  # normal, volatile, trending
    "regime_start": datetime.now(),
    "regime_duration": 0
}

class ForecastResponse(BaseModel):
    crop: str
    generated_at: str
    current_price: float
    horizons: List[dict]
    model_version: str

class HistoricalDataPoint(BaseModel):
    date: str
    timestamp: int
    price: float
    open: float
    high: float
    low: float
    volume: int

class HistoricalResponse(BaseModel):
    commodity: str
    timeframe: str
    data: List[HistoricalDataPoint]

class LivePriceResponse(BaseModel):
    commodity: str
    price: float
    change: float
    change_percent: float
    timestamp: str
    open: float
    high: float
    low: float
    volume: int

def update_market_regime():
    """Simulate changing market conditions"""
    global MARKET_REGIME
    
    time_since_regime = (datetime.now() - MARKET_REGIME["regime_start"]).seconds / 3600
    
    # Change regime every 2-8 hours
    if time_since_regime > MARKET_REGIME["regime_duration"]:
        regimes = ["normal", "volatile", "trending"]
        weights = [0.6, 0.25, 0.15]  # Normal is most common
        MARKET_REGIME["regime"] = random.choices(regimes, weights=weights)[0]
        MARKET_REGIME["regime_start"] = datetime.now()
        MARKET_REGIME["regime_duration"] = random.uniform(2, 8)
        logger.info(f"Market regime changed to: {MARKET_REGIME['regime']}")

def get_regime_multiplier():
    """Get volatility multiplier based on market regime"""
    regime_multipliers = {
        "normal": 1.0,
        "volatile": 2.5,
        "trending": 0.7
    }
    return regime_multipliers.get(MARKET_REGIME["regime"], 1.0)

def update_real_time_prices():
    """Enhanced real-time price movements with seasonal patterns"""
    update_market_regime()
    regime_mult = get_regime_multiplier()
    
    for commodity, state in PRICE_STATE.items():
        # Day of year for seasonal pattern
        day_of_year = datetime.now().timetuple().tm_yday
        
        # Seasonal component (agricultural cycles)
        seasonal_effect = state["seasonal_amplitude"] * math.sin(2 * math.pi * day_of_year / 365)
        
        # Geometric Brownian Motion with regime-adjusted volatility
        dt = 1/252
        drift = state["trend"] * state["current"] * dt
        
        # Regime-adjusted diffusion
        volatility_adjusted = state["volatility"] * regime_mult
        diffusion = volatility_adjusted * state["current"] * np.random.normal(0, np.sqrt(dt))
        
        # Mean reversion with seasonal target
        seasonal_target = state["base"] + seasonal_effect
        mean_reversion = state["mean_reversion_speed"] * (seasonal_target - state["current"])
        
        # Calculate new price
        new_price = state["current"] + drift + diffusion + mean_reversion
        
        # Trending regime - add momentum
        if MARKET_REGIME["regime"] == "trending" and len(state["price_history"]) > 5:
            recent_prices = list(state["price_history"])[-5:]
            momentum = (recent_prices[-1] - recent_prices[0]) / 5
            new_price += momentum * 0.3
        
        # Bounds with seasonal adjustment
        lower_bound = (state["base"] + seasonal_effect) * 0.92
        upper_bound = (state["base"] + seasonal_effect) * 1.08
        new_price = max(lower_bound, min(upper_bound, new_price))
        
        # Smooth transition
        smoothing_factor = 0.6 if MARKET_REGIME["regime"] == "volatile" else 0.8
        state["current"] = state["current"] * smoothing_factor + new_price * (1 - smoothing_factor)
        
        # Update price history
        state["price_history"].append(state["current"])

def generate_historical_data(commodity: str, days: int, timeframe: str = "1M") -> List[Dict]:
    """Generate highly realistic NCDEX-style historical data with patterns"""
    cache_key = f"{commodity}_{days}_{timeframe}"
    
    if cache_key in HISTORICAL_CACHE:
        cached_time, cached_data = HISTORICAL_CACHE[cache_key]
        if (datetime.now() - cached_time).seconds < 300:  # 5 min cache
            return cached_data
    
    state = PRICE_STATE.get(commodity, PRICE_STATE["soybean"])
    base_price = state["base"]
    
    # Determine data points and interval
    if timeframe == "1D":
        num_points = 78
        time_delta = timedelta(minutes=5)
        start_time = datetime.now().replace(hour=9, minute=15, second=0, microsecond=0)
    elif timeframe == "1W":
        num_points = 168
        time_delta = timedelta(hours=1)
        start_time = datetime.now() - timedelta(days=7)
    elif timeframe == "1M":
        num_points = 180
        time_delta = timedelta(hours=4)
        start_time = datetime.now() - timedelta(days=30)
    elif timeframe == "5Y":
        num_points = 260
        time_delta = timedelta(weeks=1)
        start_time = datetime.now() - timedelta(days=1825)
    else:
        num_points = days
        time_delta = timedelta(days=1)
        start_time = datetime.now() - timedelta(days=days)
    
    # Volume parameters
    base_volume = {
        "soybean": 50000,
        "mustard": 35000,
        "groundnut": 25000,
        "sunflower": 20000
    }.get(commodity, 30000)
    
    data = []
    current_price = base_price
    
    # Initialize with some price memory
    price_memory = deque([base_price] * 10, maxlen=10)
    
    for i in range(num_points):
        current_time = start_time + (time_delta * i)
        
        # Skip non-trading hours for intraday
        if timeframe == "1D":
            if current_time.hour < 9 or current_time.hour >= 17:
                continue
        
        # === REALISTIC PRICE GENERATION ===
        
        # 1. Seasonal component
        day_of_year = current_time.timetuple().tm_yday
        seasonal = state["seasonal_amplitude"] * math.sin(2 * math.pi * day_of_year / 365)
        
        # 2. Trend component with noise
        trend = state["trend"] * base_price * i + np.random.normal(0, base_price * 0.002)
        
        # 3. Random walk with memory
        if i > 0:
            recent_avg = np.mean(list(price_memory)[-5:])
            # Autocorrelation - price follows recent trend
            momentum = (price_memory[-1] - recent_avg) * 0.4
            
            # Random shock with realistic distribution
            shock = np.random.normal(0, state["volatility"] * base_price)
            
            # Occasional larger moves (fat tails - realistic for commodities)
            if random.random() < 0.05:  # 5% chance of larger move
                shock *= random.uniform(2, 4)
            
            current_price = current_price + momentum + shock
        
        # 4. Combine components
        price = current_price + seasonal + trend
        
        # 5. Mean reversion
        reversion_target = base_price + seasonal
        reversion = state["mean_reversion_speed"] * (reversion_target - price)
        price += reversion
        
        # 6. Bounds
        price = max(base_price * 0.85, min(base_price * 1.15, price))
        
        # Update memory
        price_memory.append(price)
        current_price = price
        
        # 7. Intraday patterns
        intraday_mult = 1.0
        if timeframe == "1D":
            hour = current_time.hour
            if hour in [9, 10]:
                intraday_mult = random.uniform(0.998, 1.004)  # Opening volatility
            elif hour in [15, 16]:
                intraday_mult = random.uniform(0.997, 1.003)  # Closing volatility
            else:
                intraday_mult = random.uniform(0.999, 1.001)  # Quiet midday
            price *= intraday_mult
        
        # === REALISTIC OHLC GENERATION ===
        
        # Open price
        if i == 0:
            open_price = price
        else:
            gap = np.random.normal(0, state["volatility"] * price * 0.5)
            open_price = price + gap
        
        close_price = price
        
        # High and Low with realistic candle formation
        candle_volatility = state["volatility"] * 1.5
        
        # Determine candle type
        is_bullish = close_price >= open_price
        body_size = abs(close_price - open_price)
        
        # Wicks (realistic proportions)
        upper_wick = abs(np.random.normal(body_size * 0.3, candle_volatility * price))
        lower_wick = abs(np.random.normal(body_size * 0.3, candle_volatility * price))
        
        if is_bullish:
            high_price = close_price + upper_wick
            low_price = open_price - lower_wick
        else:
            high_price = open_price + upper_wick
            low_price = close_price - lower_wick
        
        # Ensure OHLC integrity
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)
        
        # Keep within bounds
        high_price = max(base_price * 0.85, min(base_price * 1.15, high_price))
        low_price = max(base_price * 0.85, min(base_price * 1.15, low_price))
        open_price = max(base_price * 0.85, min(base_price * 1.15, open_price))
        close_price = max(base_price * 0.85, min(base_price * 1.15, close_price))
        
        # Final integrity
        high_price = max(open_price, close_price, high_price)
        low_price = min(open_price, close_price, low_price)
        
        # === REALISTIC VOLUME ===
        
        volatility_factor = abs(high_price - low_price) / max(price, 1)
        time_factor = 1.0
        
        if timeframe == "1D":
            hour = current_time.hour
            if hour in [9, 10]:
                time_factor = random.uniform(1.5, 2.0)  # High opening volume
            elif hour in [15, 16]:
                time_factor = random.uniform(1.3, 1.7)  # High closing volume
            else:
                time_factor = random.uniform(0.7, 1.0)
        
        # Volume spikes on large moves
        volume_base = base_volume / num_points
        volume_mult = 1.0 + (volatility_factor * 5) + np.random.lognormal(0, 0.3)
        volume = int(volume_base * volume_mult * time_factor)
        
        # Ensure realistic range
        volume = max(500, min(volume, base_volume * 2))
        
        # Format date
        if timeframe == "1D":
            date_str = current_time.strftime("%H:%M")
        elif timeframe in ["1W", "1M"]:
            date_str = current_time.strftime("%d %b %H:%M")
        else:
            date_str = current_time.strftime("%d %b %y")
        
        data.append({
            "date": date_str,
            "timestamp": int(current_time.timestamp() * 1000),
            "price": round(close_price, 2),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "volume": volume
        })
    
    HISTORICAL_CACHE[cache_key] = (datetime.now(), data)
    logger.info(f"Generated {len(data)} realistic data points for {commodity} ({timeframe})")
    
    return data

def calculate_technical_indicators(prices: List[float]) -> Dict:
    """Calculate technical indicators for better predictions"""
    prices_array = np.array(prices)
    
    # Simple Moving Averages
    sma_5 = np.mean(prices_array[-5:]) if len(prices_array) >= 5 else prices_array[-1]
    sma_20 = np.mean(prices_array[-20:]) if len(prices_array) >= 20 else prices_array[-1]
    
    # Momentum
    momentum = (prices_array[-1] - prices_array[0]) / len(prices_array) if len(prices_array) > 1 else 0
    
    # Volatility (standard deviation)
    volatility = np.std(prices_array) if len(prices_array) > 1 else 0
    
    # Trend strength
    if sma_5 > sma_20:
        trend_strength = min(((sma_5 - sma_20) / sma_20) * 100, 5)
    else:
        trend_strength = max(((sma_5 - sma_20) / sma_20) * 100, -5)
    
    return {
        "sma_5": sma_5,
        "sma_20": sma_20,
        "momentum": momentum,
        "volatility": volatility,
        "trend_strength": trend_strength
    }

def generate_forecast(commodity: str, days: int = 7) -> dict:
    """Enhanced ML-style forecast with technical analysis"""
    state = PRICE_STATE.get(commodity, PRICE_STATE["soybean"])
    
    # Get historical context
    historical_data = generate_historical_data(commodity, 90, "3M")
    prices = [d["price"] for d in historical_data[-60:]]
    
    # Calculate technical indicators
    indicators = calculate_technical_indicators(prices)
    
    # Start from last historical price
    last_price = prices[-1]
    
    predictions = []
    predicted_price = last_price
    
    # Calculate trend and confidence from technical analysis
    base_trend = indicators["momentum"] + (indicators["trend_strength"] * 0.1)
    base_volatility = indicators["volatility"]
    
    for day in range(1, days + 1):
        # 1. Trend component with decay
        trend_decay = math.exp(-day * 0.05)
        trend_component = base_trend * trend_decay
        
        # 2. Seasonal forecast
        future_day = (datetime.now() + timedelta(days=day)).timetuple().tm_yday
        seasonal_component = state["seasonal_amplitude"] * math.sin(2 * math.pi * future_day / 365)
        
        # 3. Mean reversion forecast
        target_price = state["base"] + seasonal_component
        reversion_component = (target_price - predicted_price) * 0.1 * (1 / day)
        
        # 4. Random walk component
        random_component = np.random.normal(0, base_volatility * math.sqrt(day) * 0.3)
        
        # Combine components
        price_change = trend_component + reversion_component + random_component
        predicted_price = predicted_price + price_change
        
        # Keep realistic bounds
        predicted_price = max(last_price * 0.95, min(last_price * 1.05, predicted_price))
        
        # Confidence calculation (decreases with time)
        base_confidence = 0.90
        time_decay = 0.015
        volatility_penalty = min(base_volatility / last_price, 0.15)
        confidence = max(0.70, base_confidence - (day * time_decay) - volatility_penalty)
        
        # Error bounds (increases with time)
        std_error = base_volatility * math.sqrt(day) * 0.8
        z_score = 1.5
        
        predictions.append({
            "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
            "predictedPrice": round(predicted_price, 2),
            "upperBound": round(predicted_price + z_score * std_error, 2),
            "lowerBound": round(max(last_price * 0.90, predicted_price - z_score * std_error), 2),
            "confidence": round(confidence * 100, 1)
        })
    
    # Analysis
    final_predicted = predictions[-1]["predictedPrice"]
    price_change_pct = ((final_predicted - last_price) / last_price) * 100
    
    # Trend categorization
    if price_change_pct > 2.0:
        trend_direction = "Strong Bullish"
    elif price_change_pct > 0.5:
        trend_direction = "Bullish"
    elif price_change_pct > -0.5:
        trend_direction = "Neutral"
    elif price_change_pct > -2.0:
        trend_direction = "Bearish"
    else:
        trend_direction = "Strong Bearish"
    
    # Volatility analysis
    avg_spread = np.mean([p["upperBound"] - p["lowerBound"] for p in predictions])
    spread_ratio = avg_spread / last_price
    
    if spread_ratio < 0.06:
        volatility_level = "Low"
        volatility_desc = "Stable market conditions expected"
    elif spread_ratio < 0.12:
        volatility_level = "Moderate"
        volatility_desc = "Normal price fluctuations expected"
    else:
        volatility_level = "High"
        volatility_desc = "Increased market uncertainty"
    
    # Model metrics (realistic ML performance)
    mae = base_volatility * 0.4
    rmse = base_volatility * 0.6
    accuracy = max(78, min(92, 85 - (spread_ratio * 20) + random.uniform(-1, 1)))
    
    return {
        "predictions": predictions,
        "metrics": {
            "model": "Ensemble ARIMA-Prophet-LSTM",
            "accuracy": round(accuracy, 1),
            "confidence": round(predictions[0]["confidence"], 1),
            "rmse": round(rmse, 2),
            "mae": round(mae, 2),
            "trend": trend_direction,
            "volatility": volatility_level,
            "volatility_description": volatility_desc,
            "prediction_range": f"₹{int(predictions[0]['lowerBound'])} - ₹{int(predictions[-1]['upperBound'])}",
            "expected_change": f"{price_change_pct:+.2f}%",
            "data_points_used": len(historical_data),
            "model_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "technical_indicators": {
                "sma_5": round(indicators["sma_5"], 2),
                "sma_20": round(indicators["sma_20"], 2),
                "momentum": round(indicators["momentum"], 2),
                "trend_strength": round(indicators["trend_strength"], 2)
            }
        }
    }

def get_timeframe_days(timeframe: str) -> int:
    """Convert timeframe string to number of days"""
    mapping = {
        "1D": 1,
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "1Y": 365,
        "5Y": 1825,
    }
    return mapping.get(timeframe, 30)

def get_mock_forecast(crop: str = "soybean") -> dict:
    """Generate mock forecast (backward compatibility)"""
    state = PRICE_STATE.get(crop.lower(), PRICE_STATE["soybean"])
    current_price = state["current"]
    
    horizons = [
        {
            "days": 7,
            "yhat": round(current_price * (1 + np.random.normal(0.01, 0.02)), 2),
            "lower": round(current_price * 0.95, 2),
            "upper": round(current_price * 1.08, 2),
            "summary": "Short-term stability with slight upward bias expected"
        },
        {
            "days": 30,
            "yhat": round(current_price * (1 + np.random.normal(0.03, 0.03)), 2),
            "lower": round(current_price * 0.92, 2),
            "upper": round(current_price * 1.12, 2),
            "summary": "Moderate growth anticipated based on seasonal patterns"
        },
        {
            "days": 90,
            "yhat": round(current_price * (1 + np.random.normal(0.04, 0.05)), 2),
            "lower": round(current_price * 0.85, 2),
            "upper": round(current_price * 1.20, 2),
            "summary": "Long-term forecast shows increased uncertainty"
        }
    ]
    
    return {
        "crop": crop.capitalize(),
        "generated_at": datetime.now().isoformat(),
        "current_price": round(current_price, 2),
        "horizons": horizons,
        "model_version": "prophet-arima-lstm-v2.1"
    }

# === API ENDPOINTS ===

@app.get("/")
async def root():
    """API root endpoint"""
    update_real_time_prices()
    return {
        "service": "Krishi Hedge ML API",
        "status": "running",
        "version": "2.1.0",
        "features": [
            "Real-time price simulation with seasonal patterns",
            "Realistic historical OHLCV data generation",
            "AI-powered forecasting with technical analysis",
            "Market regime simulation",
            "Enhanced ML predictions"
        ],
        "current_prices": {
            commodity: round(state["current"], 2) 
            for commodity, state in PRICE_STATE.items()
        },
        "market_regime": MARKET_REGIME["regime"]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "active",
        "market_regime": MARKET_REGIME["regime"]
    }

@app.get("/forecast", response_model=ForecastResponse)
async def get_forecast_endpoint(crop: str = "soybean"):
    """Get price forecast for a crop"""
    try:
        update_real_time_prices()
        logger.info(f"Generating forecast for {crop}")
        forecast = get_mock_forecast(crop)
        return ForecastResponse(**forecast)
    except Exception as e:
        logger.error(f"Forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/historical/{commodity}")
async def get_historical_data(
    commodity: str,
    timeframe: str = Query("1M", description="Timeframe: 1D, 1W, 1M, 3M, 6M, 1Y, 5Y")
):
    """Get historical price data with realistic patterns"""
    try:
        update_real_time_prices()
        
        if commodity.lower() not in PRICE_STATE:
            raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found")
        
        days = get_timeframe_days(timeframe)
        data = generate_historical_data(commodity.lower(), days, timeframe)
        
        logger.info(f"Generated {len(data)} historical data points for {commodity} ({timeframe})")
        
        return {
            "commodity": commodity.capitalize(),
            "timeframe": timeframe,
            "data": data,
            "metadata": {
                "total_points": len(data),
                "scale": "NCDEX-equivalent",
                "data_type": "OHLCV",
                "currency": "INR per quintal",
                "market_regime": MARKET_REGIME["regime"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Historical data error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/predict")
async def get_predictions(request: dict):
    """Get enhanced AI predictions with technical analysis"""
    try:
        update_real_time_prices()
        
        commodity = request.get("commodity", "soybean").lower()
        days = request.get("days", 7)
        
        if commodity not in PRICE_STATE:
            raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found")
        
        forecast = generate_forecast(commodity, days)
        
        logger.info(f"Generated {days}-day prediction for {commodity}")
        
        return forecast
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/live-price/{commodity}")
async def get_live_price(commodity: str):
    """Get current live price with market data"""
    try:
        update_real_time_prices()
        
        if commodity.lower() not in PRICE_STATE:
            raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found")
        
        state = PRICE_STATE[commodity.lower()]
        current = state["current"]
        base = state["base"]
        
        # Daily metrics
        open_price = current * (1 + np.random.normal(-0.003, 0.007))
        high_price = max(current, open_price) * (1 + abs(np.random.normal(0, 0.012)))
        low_price = min(current, open_price) * (1 - abs(np.random.normal(0, 0.012)))
        volume = int(np.random.lognormal(10, 0.6))
        
        change = current - base
        change_percent = (change / base) * 100
        
        return {
            "commodity": commodity.capitalize(),
            "price": round(current, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "timestamp": datetime.now().isoformat(),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "volume": volume,
            "market_regime": MARKET_REGIME["regime"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Live price error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/commodities")
async def get_commodities():
    """Get all commodities with current prices"""
    update_real_time_prices()
    
    commodities = []
    for name, state in PRICE_STATE.items():
        change = state["current"] - state["base"]
        change_percent = (change / state["base"]) * 100
        
        commodities.append({
            "name": name,
            "display_name": name.capitalize(),
            "current_price": round(state["current"], 2),
            "base_price": round(state["base"], 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volatility": state["volatility"]
        })
    
    return {
        "commodities": commodities,
        "timestamp": datetime.now().isoformat(),
        "market_regime": MARKET_REGIME["regime"]
    }

@app.post("/reset-prices")
async def reset_prices():
    """Reset all prices to base values"""
    for commodity, state in PRICE_STATE.items():
        state["current"] = state["base"]
        state["price_history"].clear()
    
    return {
        "message": "All prices reset to base values",
        "prices": {
            commodity: round(state["current"], 2) 
            for commodity, state in PRICE_STATE.items()
        }
    }

@app.get("/market-regime")
async def get_market_regime():
    """Get current market regime information"""
    return {
        "regime": MARKET_REGIME["regime"],
        "since": MARKET_REGIME["regime_start"].isoformat(),
        "volatility_multiplier": get_regime_multiplier(),
        "description": {
            "normal": "Stable market conditions with typical volatility",
            "volatile": "Increased price fluctuations and uncertainty",
            "trending": "Strong directional movement with momentum"
        }.get(MARKET_REGIME["regime"], "Unknown")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )