from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime

from models import (
    WeatherResponse, WeatherRequest, SearchHistory, SearchHistoryCreate,
    CitySearchResult, ErrorResponse
)

# Load environment variables FIRST
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import weather service AFTER loading env vars
from weather_service import get_weather_service

# Create the main app
app = FastAPI(title="Weather Dashboard API", version="1.0.0")

# Add CORS middleware immediately after app creation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize weather service AFTER environment is loaded
weather_service = get_weather_service()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    raise ValueError("MONGO_URL environment variable is required")

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME')
if not db_name:
    raise ValueError("DB_NAME environment variable is required")

db = client[db_name]

# Helper function to get client IP
def get_client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"

# Weather endpoints
@api_router.get("/", tags=["Health"])
async def root():
    return {"message": "Weather Dashboard API", "status": "healthy"}

@api_router.get("/weather/current/{city}", response_model=WeatherResponse, tags=["Weather"])
async def get_current_weather(city: str, request: Request):
    """Get current weather for a city"""
    try:
        # Get weather data
        weather_data = await weather_service.get_current_weather(city)
        
        # Save search history
        search_history = SearchHistoryCreate(
            city_name=weather_data.location.name,
            country=weather_data.location.country,
            region=weather_data.location.region,
            latitude=weather_data.location.lat,
            longitude=weather_data.location.lon,
            user_ip=get_client_ip(request)
        )
        
        history_dict = search_history.dict()
        history_obj = SearchHistory(**history_dict)
        await db.search_history.insert_one(history_obj.dict())
        
        return weather_data
        
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail={
                "error": "city_not_found",
                "message": error_msg
            })
        elif "Network connection failed" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "network_error",
                "message": error_msg
            })
        elif "Invalid API key" in error_msg or "exceeded quota" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "api_error",
                "message": "Weather service temporarily unavailable"
            })
        else:
            raise HTTPException(status_code=500, detail={
                "error": "api_error",
                "message": error_msg
            })
    except Exception as e:
        logger.error(f"Unexpected error in get_current_weather: {e}")
        raise HTTPException(status_code=500, detail={
            "error": "server_error",
            "message": "Internal server error"
        })

@api_router.get("/weather/forecast/{city}", response_model=WeatherResponse, tags=["Weather"])
async def get_weather_forecast(city: str, days: int = 3, request: Request = None):
    """Get weather forecast for a city"""
    try:
        # Validate days parameter
        if days < 1 or days > 10:
            raise HTTPException(status_code=400, detail={
                "error": "invalid_parameter",
                "message": "Days must be between 1 and 10"
            })
        
        # Get forecast data
        forecast_data = await weather_service.get_weather_forecast(city, days)
        
        # Save search history
        if request:
            search_history = SearchHistoryCreate(
                city_name=forecast_data.location.name,
                country=forecast_data.location.country,
                region=forecast_data.location.region,
                latitude=forecast_data.location.lat,
                longitude=forecast_data.location.lon,
                user_ip=get_client_ip(request)
            )
            
            history_dict = search_history.dict()
            history_obj = SearchHistory(**history_dict)
            await db.search_history.insert_one(history_obj.dict())
        
        return forecast_data
        
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail={
                "error": "city_not_found",
                "message": error_msg
            })
        elif "Network connection failed" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "network_error",
                "message": error_msg
            })
        elif "Invalid API key" in error_msg or "exceeded quota" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "api_error",
                "message": "Weather service temporarily unavailable"
            })
        else:
            raise HTTPException(status_code=500, detail={
                "error": "api_error",
                "message": error_msg
            })
    except Exception as e:
        logger.error(f"Unexpected error in get_weather_forecast: {e}")
        raise HTTPException(status_code=500, detail={
            "error": "server_error",
            "message": "Internal server error"
        })

@api_router.post("/weather", response_model=WeatherResponse, tags=["Weather"])
async def get_weather(weather_request: WeatherRequest, request: Request):
    """Get weather data (current + forecast) for a city"""
    try:
        # Get comprehensive weather data
        weather_data = await weather_service.get_weather_forecast(
            weather_request.city,
            weather_request.days
        )
        
        # Save search history
        search_history = SearchHistoryCreate(
            city_name=weather_data.location.name,
            country=weather_data.location.country,
            region=weather_data.location.region,
            latitude=weather_data.location.lat,
            longitude=weather_data.location.lon,
            user_ip=get_client_ip(request)
        )
        
        history_dict = search_history.dict()
        history_obj = SearchHistory(**history_dict)
        await db.search_history.insert_one(history_obj.dict())
        
        return weather_data
        
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg:
            raise HTTPException(status_code=404, detail={
                "error": "city_not_found",
                "message": error_msg
            })
        elif "Network connection failed" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "network_error",
                "message": error_msg
            })
        elif "Invalid API key" in error_msg or "exceeded quota" in error_msg:
            raise HTTPException(status_code=503, detail={
                "error": "api_error",
                "message": "Weather service temporarily unavailable"
            })
        else:
            raise HTTPException(status_code=500, detail={
                "error": "api_error",
                "message": error_msg
            })

@api_router.get("/cities/search", response_model=List[CitySearchResult], tags=["Cities"])
async def search_cities(q: str):
    """Search for cities by name"""
    if len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail={
            "error": "invalid_parameter",
            "message": "Search query must be at least 2 characters"
        })
    
    try:
        cities = await weather_service.search_cities(q)
        return cities
    except Exception as e:
        logger.error(f"Error searching cities: {e}")
        # Return empty list instead of error for search
        return []

@api_router.get("/weather/coordinates", response_model=WeatherResponse, tags=["Weather"])
async def get_weather_by_coordinates(lat: float, lon: float, days: int = 3, request: Request = None):
    """Get weather data by coordinates"""
    try:
        # Validate coordinates
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            raise HTTPException(status_code=400, detail={
                "error": "invalid_parameter",
                "message": "Invalid coordinates"
            })
        
        weather_data = await weather_service.get_weather_by_coordinates(lat, lon, days)
        
        # Save search history
        if request:
            search_history = SearchHistoryCreate(
                city_name=weather_data.location.name,
                country=weather_data.location.country,
                region=weather_data.location.region,
                latitude=weather_data.location.lat,
                longitude=weather_data.location.lon,
                user_ip=get_client_ip(request)
            )
            
            history_dict = search_history.dict()
            history_obj = SearchHistory(**history_dict)
            await db.search_history.insert_one(history_obj.dict())
        
        return weather_data
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail={
            "error": "api_error",
            "message": str(e)
        })

# Search history endpoints
@api_router.get("/history/searches", response_model=List[SearchHistory], tags=["History"])
async def get_search_history(limit: int = 50):
    """Get recent search history"""
    try:
        searches = await db.search_history.find().sort("search_timestamp", -1).limit(limit).to_list(limit)
        return [SearchHistory(**search) for search in searches]
    except Exception as e:
        logger.error(f"Error fetching search history: {e}")
        raise HTTPException(status_code=500, detail={
            "error": "database_error",
            "message": "Failed to fetch search history"
        })

@api_router.get("/history/popular", tags=["History"])
async def get_popular_cities(limit: int = 10):
    """Get most searched cities"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "city_name": "$city_name",
                        "country": "$country",
                        "region": "$region"
                    },
                    "search_count": {"$sum": 1},
                    "last_searched": {"$max": "$search_timestamp"}
                }
            },
            {"$sort": {"search_count": -1}},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 0,
                    "city_name": "$_id.city_name",
                    "country": "$_id.country",
                    "region": "$_id.region",
                    "search_count": 1,
                    "last_searched": 1
                }
            }
        ]
        
        result = await db.search_history.aggregate(pipeline).to_list(limit)
        return result
    except Exception as e:
        logger.error(f"Error fetching popular cities: {e}")
        raise HTTPException(status_code=500, detail={
            "error": "database_error",
            "message": "Failed to fetch popular cities"
        })

# Health check with weather service status
@api_router.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Test a simple weather API call
        await weather_service.search_cities("London")
        return {
            "status": "healthy",
            "weather_api": "connected",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "weather_api": "disconnected",
                "database": "connected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# Include the router in the main app
app.include_router(api_router)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "server_error",
            "message": "An unexpected error occurred"
        }
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
