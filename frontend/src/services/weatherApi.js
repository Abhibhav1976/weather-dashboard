import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

class WeatherAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          const errorType = data?.error || 'api_error';
          const message = data?.message || 'An error occurred';
          throw new WeatherAPIError(errorType, message, status);
        } else if (error.request) {
          // Network error
          throw new WeatherAPIError('network_error', 'Network connection failed', 0);
        } else {
          // Other error
          throw new WeatherAPIError('unknown_error', error.message, 0);
        }
      }
    );
  }

  async getCurrentWeather(city) {
    try {
      const response = await this.client.get(`/weather/current/${encodeURIComponent(city)}`);
      return response.data;
    } catch (error) {
      this.handleError(error, city);
    }
  }

  async getWeatherForecast(city, days = 3) {
    try {
      const response = await this.client.get(`/weather/forecast/${encodeURIComponent(city)}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, city);
    }
  }

  async getWeather(city, days = 3) {
    try {
      const response = await this.client.post('/weather', {
        city,
        days
      });
      return response.data;
    } catch (error) {
      this.handleError(error, city);
    }
  }

  async searchCities(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await this.client.get('/cities/search', {
        params: { q: query.trim() }
      });
      return response.data;
    } catch (error) {
      console.warn('City search failed:', error);
      return [];
    }
  }

  async getWeatherByCoordinates(lat, lon, days = 3) {
    try {
      const response = await this.client.get('/weather/coordinates', {
        params: { lat, lon, days }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `${lat},${lon}`);
    }
  }

  async getSearchHistory(limit = 50) {
    try {
      const response = await this.client.get('/history/searches', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch search history:', error);
      return [];
    }
  }

  async getPopularCities(limit = 10) {
    try {
      const response = await this.client.get('/history/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch popular cities:', error);
      return [];
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.warn('Health check failed:', error);
      return { status: 'unhealthy' };
    }
  }

  handleError(error, location = '') {
    if (error instanceof WeatherAPIError) {
      throw error;
    }

    // Fallback error handling
    console.error('Unhandled weather API error:', error);
    throw new WeatherAPIError('api_error', 'Weather service is temporarily unavailable', 500);
  }
}

// Custom error class for weather API errors
class WeatherAPIError extends Error {
  constructor(type, message, statusCode = 500) {
    super(message);
    this.name = 'WeatherAPIError';
    this.type = type;
    this.statusCode = statusCode;
  }

  isCityNotFound() {
    return this.type === 'city_not_found';
  }

  isNetworkError() {
    return this.type === 'network_error';
  }

  isAPIError() {
    return this.type === 'api_error';
  }

  isInvalidInput() {
    return this.type === 'invalid_parameter';
  }
}

// Singleton instance
const weatherAPI = new WeatherAPI();

export { weatherAPI, WeatherAPIError };
export default weatherAPI;
