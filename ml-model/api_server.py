"""
FastAPI Service for ML Predictions
Serves trained models via REST API that Next.js can call
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sys
from pathlib import Path

# Add ml-model directory to path
sys.path.append(str(Path(__file__).parent))

from prediction_service import get_prediction_service, predict_commodity_price

app = FastAPI(title="Oilseed Price Prediction API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class PredictionRequest(BaseModel):
    commodity: str
    horizon: int = 7
    model_type: str = "prophet"

class PredictionResponse(BaseModel):
    success: bool
    commodity: str
    horizon_days: int
    predicted_price: float
    confidence_interval: Optional[dict] = None
    model: str
    prediction_date: str
    error: Optional[str] = None

class ModelInfo(BaseModel):
    total_models: int
    models: List[str]
    tensorflow_available: bool
    prophet_available: bool


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "Oilseed Price Prediction API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/models", response_model=ModelInfo)
def get_models():
    """Get available models"""
    service = get_prediction_service()
    return service.get_available_models()

@app.post("/predict", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):
    """
    Predict commodity price
    
    - **commodity**: Soybean, Mustard, Sesame, or Groundnut
    - **horizon**: Days ahead to predict (7 or 30)
    - **model_type**: lstm or prophet
    """
    try:
        result = predict_commodity_price(
            commodity=request.commodity,
            horizon=request.horizon,
            model_type=request.model_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
def predict_batch(commodities: List[str], horizon: int = 7, model_type: str = "prophet"):
    """Predict prices for multiple commodities"""
    results = []
    for commodity in commodities:
        result = predict_commodity_price(commodity, horizon, model_type)
        results.append(result)
    return {"predictions": results}


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ML Prediction API Server...")
    print("📡 API Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
