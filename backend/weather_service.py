import aiohttp
import os
from typing import List, Optional
from models import WeatherResponse, CitySearchResult, ErrorResponse
import logging

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.api_key = os.environ.get('WEATHER_API_KEY')
        self.base_url = os.environ.get('WEATHER_API_BASE_URL', 'http://api.weatherapi.com/v1')
        
        if not self.api_key:
            raise ValueError("WEATHER_API_KEY environment variable is required")

    async def get_current_weather(self, city: str) -> WeatherResponse:
        """Get current weather for a city"""
        url = f"{self.base_url}/current.json"
        params = {
            'key': self.api_key,
            'q': city,
            'aqi': 'no'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return WeatherResponse(**data)
                    elif response.status == 400:
                        error_data = await response.json()
                        error_msg = error_data.get('error', {}).get('message', 'Invalid request')
                        if 'No matching location found' in error_msg:
                            raise ValueError(f"City '{city}' not found")
                        else:
                            raise ValueError(error_msg)
                    elif response.status == 401:
                        raise ValueError("Invalid API key")
                    elif response.status == 403:
                        raise ValueError("API key exceeded quota")
                    else:
                        raise ValueError(f"Weather service error: {response.status}")
        except aiohttp.ClientError as e:
            logger.error(f"Network error fetching weather for {city}: {e}")
            raise ValueError("Network connection failed")
        except Exception as e:
            logger.error(f"Unexpected error fetching weather for {city}: {e}")
            raise ValueError("Weather service temporarily unavailable")

    async def get_weather_forecast(self, city: str, days: int = 3) -> WeatherResponse:
        """Get weather forecast for a city"""
        url = f"{self.base_url}/forecast.json"
        params = {
            'key': self.api_key,
            'q': city,
            'days': min(days, 10),  # API supports max 10 days
            'aqi': 'no',
            'alerts': 'no'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return WeatherResponse(**data)
                    elif response.status == 400:
                        error_data = await response.json()
                        error_msg = error_data.get('error', {}).get('message', 'Invalid request')
                        if 'No matching location found' in error_msg:
                            raise ValueError(f"City '{city}' not found")
                        else:
                            raise ValueError(error_msg)
                    elif response.status == 401:
                        raise ValueError("Invalid API key")
                    elif response.status == 403:
                        raise ValueError("API key exceeded quota")
                    else:
                        raise ValueError(f"Weather service error: {response.status}")
        except aiohttp.ClientError as e:
            logger.error(f"Network error fetching forecast for {city}: {e}")
            raise ValueError("Network connection failed")
        except Exception as e:
            logger.error(f"Unexpected error fetching forecast for {city}: {e}")
            raise ValueError("Weather service temporarily unavailable")

    async def search_cities(self, query: str) -> List[CitySearchResult]:
        """Search for cities by name"""
        if len(query.strip()) < 2:
            return []
        
        url = f"{self.base_url}/search.json"
        params = {
            'key': self.api_key,
            'q': query
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [CitySearchResult(**city) for city in data]
                    elif response.status == 400:
                        # Search endpoint might return empty array for no results
                        return []
                    else:
                        logger.warning(f"City search failed with status {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error searching cities for query '{query}': {e}")
            return []

    async def get_weather_by_coordinates(self, lat: float, lon: float, days: int = 3) -> WeatherResponse:
        """Get weather forecast by coordinates"""
        url = f"{self.base_url}/forecast.json"
        params = {
            'key': self.api_key,
            'q': f"{lat},{lon}",
            'days': min(days, 10),
            'aqi': 'no',
            'alerts': 'no'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return WeatherResponse(**data)
                    else:
                        raise ValueError(f"Failed to get weather for coordinates: {response.status}")
        except Exception as e:
            logger.error(f"Error fetching weather for coordinates {lat},{lon}: {e}")
            raise ValueError("Failed to get weather data")

# Singleton instance - initialize only when needed and env vars are loaded
_weather_service = None

def get_weather_service():
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service
