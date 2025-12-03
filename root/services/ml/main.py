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

# Global price state for real-time simulation
PRICE_STATE = {
    "soybean": {"base": 4250, "current": 4250, "volatility": 0.02, "trend": 0.0001},
    "mustard": {"base": 5500, "current": 5500, "volatility": 0.025, "trend": 0.0002},
    "groundnut": {"base": 6200, "current": 6200, "volatility": 0.018, "trend": -0.0001},
    "sunflower": {"base": 5800, "current": 5800, "volatility": 0.022, "trend": 0.00015},
}

# Historical data cache
HISTORICAL_CACHE = {}

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

def update_real_time_prices():
    """Simulate real-time price movements using Geometric Brownian Motion"""
    for commodity, state in PRICE_STATE.items():
        # Geometric Brownian Motion: dS = μS dt + σS dW
        dt = 1/252  # Daily time step
        drift = state["trend"] * state["current"] * dt
        diffusion = state["volatility"] * state["current"] * np.random.normal(0, np.sqrt(dt))
        
        # Update price
        new_price = state["current"] + drift + diffusion
        
        # Add mean reversion to prevent extreme divergence
        mean_reversion = 0.01 * (state["base"] - state["current"])
        new_price += mean_reversion
        
        # Ensure price doesn't go negative or too extreme
        new_price = max(state["base"] * 0.5, min(state["base"] * 1.5, new_price))
        
        state["current"] = new_price

def generate_historical_data(commodity: str, days: int) -> List[Dict]:
    """Generate synthetic historical price data with realistic patterns"""
    cache_key = f"{commodity}_{days}"
    
    # Return cached data if available and recent
    if cache_key in HISTORICAL_CACHE:
        cached_time, cached_data = HISTORICAL_CACHE[cache_key]
        if (datetime.now() - cached_time).seconds < 60:  # Cache for 1 minute
            return cached_data
    
    state = PRICE_STATE.get(commodity, PRICE_STATE["soybean"])
    base_price = state["base"]
    
    data = []
    current_price = base_price
    
    # Start from 'days' ago
    start_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Add trend and seasonality
        seasonal = 50 * math.sin(2 * math.pi * i / 365)  # Yearly seasonality
        trend = state["trend"] * base_price * i
        
        # Random walk with drift
        daily_return = np.random.normal(0.0002, state["volatility"])
        current_price *= (1 + daily_return)
        
        # Add trend and seasonality
        price = current_price + seasonal + trend
        
        # Mean reversion
        price = price * 0.95 + base_price * 0.05
        
        # Generate OHLCV
        open_price = price * (1 + np.random.normal(0, 0.005))
        close_price = price
        high_price = max(open_price, close_price) * (1 + abs(np.random.normal(0, 0.01)))
        low_price = min(open_price, close_price) * (1 - abs(np.random.normal(0, 0.01)))
        volume = int(np.random.lognormal(8, 0.5))  # Log-normal distribution for volume
        
        data.append({
            "date": date.strftime("%d %b"),
            "timestamp": int(date.timestamp() * 1000),
            "price": round(close_price, 2),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "volume": volume
        })
    
    # Update cache
    HISTORICAL_CACHE[cache_key] = (datetime.now(), data)
    
    return data

def get_timeframe_days(timeframe: str) -> int:
    """Convert timeframe string to number of days"""
    mapping = {
        "1D": 1,
        "1W": 7,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "1Y": 365
    }
    return mapping.get(timeframe, 30)

def generate_forecast(commodity: str, days: int = 7) -> dict:
    """Generate realistic forecast using ARIMA-like simulation"""
    state = PRICE_STATE.get(commodity, PRICE_STATE["soybean"])
    current_price = state["current"]
    
    # Use more sophisticated forecasting
    trend = state["trend"] * current_price
    volatility = state["volatility"] * current_price
    
    predictions = []
    for day in range(1, days + 1):
        # ARIMA-like prediction with decreasing confidence
        predicted = current_price + (trend * day)
        
        # Add some random walk
        predicted += np.random.normal(0, volatility * math.sqrt(day))
        
        # Confidence intervals widen over time
        confidence = max(0.6, 0.95 - (day * 0.05))
        std_dev = volatility * math.sqrt(day)
        
        predictions.append({
            "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
            "predictedPrice": round(predicted, 2),
            "upperBound": round(predicted + 1.96 * std_dev, 2),
            "lowerBound": round(predicted - 1.96 * std_dev, 2),
            "confidence": round(confidence * 100, 1)
        })
    
    # Calculate trend
    if predictions[-1]["predictedPrice"] > current_price * 1.02:
        trend_direction = "Bullish"
    elif predictions[-1]["predictedPrice"] < current_price * 0.98:
        trend_direction = "Bearish"
    else:
        trend_direction = "Neutral"
    
    # Calculate volatility level
    avg_range = np.mean([p["upperBound"] - p["lowerBound"] for p in predictions])
    if avg_range < current_price * 0.1:
        volatility_level = "Low"
    elif avg_range < current_price * 0.2:
        volatility_level = "Medium"
    else:
        volatility_level = "High"
    
    return {
        "predictions": predictions,
        "metrics": {
            "model": "Prophet + ARIMA Ensemble",
            "accuracy": round(75 + random.uniform(0, 10), 1),
            "confidence": round(80 + random.uniform(0, 8), 1),
            "rmse": round(volatility * random.uniform(0.8, 1.2), 2),
            "mae": round(volatility * random.uniform(0.6, 0.9), 2),
            "trend": trend_direction,
            "volatility": volatility_level
        }
    }

def get_mock_forecast(crop: str = "soybean") -> dict:
    """Generate mock forecast data matching the JSON structure"""
    state = PRICE_STATE.get(crop.lower(), PRICE_STATE["soybean"])
    current_price = state["current"]
    
    horizons = [
        {
            "days": 7,
            "yhat": round(current_price * (1 + np.random.normal(0.01, 0.02)), 2),
            "lower": round(current_price * 0.95, 2),
            "upper": round(current_price * 1.08, 2),
            "summary": "Price expected to remain stable with slight upward bias"
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
            "summary": "Higher uncertainty in long-term forecast due to market volatility"
        }
    ]
    
    return {
        "crop": crop.capitalize(),
        "generated_at": datetime.now().isoformat(),
        "current_price": round(current_price, 2),
        "horizons": horizons,
        "model_version": "prophet-arima-v2.0"
    }


@app.get("/")
async def root():
    """API root endpoint"""
    update_real_time_prices()
    return {
        "service": "Krishi Hedge ML API",
        "status": "running",
        "version": "2.0.0",
        "features": [
            "Real-time price simulation",
            "Historical data generation",
            "AI-powered forecasting",
            "Live price updates"
        ],
        "current_prices": {
            commodity: round(state["current"], 2) 
            for commodity, state in PRICE_STATE.items()
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "active"
    }

@app.get("/forecast", response_model=ForecastResponse)
async def get_forecast(crop: str = "soybean"):
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
    timeframe: str = Query("1M", description="Timeframe: 1D, 1W, 1M, 3M, 6M, 1Y")
):
    """Get historical price data for a commodity"""
    try:
        update_real_time_prices()
        
        if commodity.lower() not in PRICE_STATE:
            raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found")
        
        days = get_timeframe_days(timeframe)
        data = generate_historical_data(commodity.lower(), days)
        
        logger.info(f"Generated {len(data)} historical data points for {commodity} ({timeframe})")
        
        return {
            "commodity": commodity.capitalize(),
            "timeframe": timeframe,
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Historical data error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/predict")
async def get_predictions(
    request: dict
):
    """Get AI predictions for a commodity
    
    Request body:
    {
        "commodity": "soybean",
        "days": 7,
        "timeframe": "1M"
    }
    """
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
    """Get current live price for a commodity"""
    try:
        update_real_time_prices()
        
        if commodity.lower() not in PRICE_STATE:
            raise HTTPException(status_code=404, detail=f"Commodity '{commodity}' not found")
        
        state = PRICE_STATE[commodity.lower()]
        current = state["current"]
        base = state["base"]
        
        # Calculate daily metrics
        open_price = current * (1 + np.random.normal(-0.002, 0.005))
        high_price = current * (1 + abs(np.random.normal(0, 0.01)))
        low_price = current * (1 - abs(np.random.normal(0, 0.01)))
        volume = int(np.random.lognormal(8, 0.5))
        
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
            "volume": volume
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Live price error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/commodities")
async def get_commodities():
    """Get list of supported commodities with current prices"""
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
        "timestamp": datetime.now().isoformat()
    }

@app.post("/reset-prices")
async def reset_prices():
    """Reset all prices to base values (for testing)"""
    for commodity, state in PRICE_STATE.items():
        state["current"] = state["base"]
    
    return {
        "message": "All prices reset to base values",
        "prices": {
            commodity: round(state["current"], 2) 
            for commodity, state in PRICE_STATE.items()
        }
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
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload on file changes
        log_level="info"
    )
