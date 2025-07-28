from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# WeatherAPI.com response models
class WeatherCondition(BaseModel):
    text: str
    icon: str
    code: int

class CurrentWeather(BaseModel):
    last_updated: str
    temp_c: float
    temp_f: float
    is_day: int
    condition: WeatherCondition
    wind_mph: float
    wind_kph: float
    wind_degree: int
    wind_dir: str
    pressure_mb: float
    pressure_in: float
    precip_mm: float
    precip_in: float
    humidity: int
    cloud: int
    feelslike_c: float
    feelslike_f: float
    vis_km: float
    vis_miles: float
    uv: float
    gust_mph: float
    gust_kph: float

class Location(BaseModel):
    name: str
    region: str
    country: str
    lat: float
    lon: float
    tz_id: str
    localtime: str

class HourWeather(BaseModel):
    time: str
    temp_c: float
    temp_f: float
    condition: WeatherCondition
    wind_mph: float
    wind_kph: float
    wind_degree: int
    wind_dir: str
    pressure_mb: float
    precip_mm: float
    humidity: int
    cloud: int
    feelslike_c: float
    feelslike_f: float
    vis_km: float

class DayWeather(BaseModel):
    maxtemp_c: float
    maxtemp_f: float
    mintemp_c: float
    mintemp_f: float
    avgtemp_c: float
    avgtemp_f: float
    maxwind_mph: float
    maxwind_kph: float
    totalprecip_mm: float
    totalprecip_in: float
    avgvis_km: float
    avgvis_miles: float
    avghumidity: float
    daily_will_it_rain: int
    daily_chance_of_rain: int
    daily_will_it_snow: int
    daily_chance_of_snow: int
    condition: WeatherCondition
    uv: float

class ForecastDay(BaseModel):
    date: str
    day: DayWeather
    hour: List[HourWeather]

class Forecast(BaseModel):
    forecastday: List[ForecastDay]

class WeatherResponse(BaseModel):
    location: Location
    current: CurrentWeather
    forecast: Optional[Forecast] = None

# Database models for search history
class SearchHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city_name: str
    country: str
    region: str
    latitude: float
    longitude: float
    search_timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_ip: Optional[str] = None

class SearchHistoryCreate(BaseModel):
    city_name: str
    country: str
    region: str
    latitude: float
    longitude: float
    user_ip: Optional[str] = None

# City search models
class CitySearchResult(BaseModel):
    name: str
    region: str
    country: str
    lat: float
    lon: float

# Request/Response models
class WeatherRequest(BaseModel):
    city: str
    days: int = 3  # Number of forecast days

class ErrorResponse(BaseModel):
    error: str
    message: str
    code: Optional[str] = None