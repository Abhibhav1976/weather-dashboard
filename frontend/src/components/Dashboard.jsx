import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import ForecastChart from './ForecastChart';
import ErrorDisplay, { CompactError } from './ErrorDisplay';
import APIStatusIndicator from './APIStatusIndicator';
import { 
  WeatherCardSkeleton, 
  ForecastCardSkeleton, 
  QuickStatsSkeleton 
} from './LoadingSkeletons';
import { 
  Sun, 
  Moon, 
  Thermometer, 
  RefreshCw, 
  Loader2,
  CloudRain,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';
import weatherAPI, { WeatherAPIError } from '../services/weatherApi';
import { formatLocalTime } from '../utils/timezone';

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState('celsius');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown'); // healthy, degraded, error
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved preferences
    const savedUnit = localStorage.getItem('weatherUnit');
    const savedDarkMode = localStorage.getItem('weatherDarkMode');
    const savedCity = localStorage.getItem('lastSearchedCity');
    
    if (savedUnit) setUnit(savedUnit);
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    
    // Apply dark mode to document
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    }

    // Initial health check and load default city
    checkAPIHealth();
    if (savedCity) {
      setCurrentCity(savedCity);
      handleCitySearch(savedCity);
    } else {
      // Try to get user's location or default to London
      getUserLocation();
    }
  }, []);

  useEffect(() => {
    // Save preferences
    localStorage.setItem('weatherUnit', unit);
    localStorage.setItem('weatherDarkMode', darkMode.toString());
    
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [unit, darkMode]);

  const checkAPIHealth = async () => {
    try {
      const health = await weatherAPI.healthCheck();
      setApiStatus(health.status === 'healthy' ? 'healthy' : 'degraded');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await weatherAPI.getWeatherByCoordinates(latitude, longitude);
            setWeatherData(data);
            setForecastData(data);
            setCurrentCity(data.location.name);
            setLastUpdated(new Date());
            localStorage.setItem('lastSearchedCity', data.location.name);
          } catch (error) {
            // Fallback to default city
            handleCitySearch('London');
          }
        },
        () => {
          // Geolocation failed, use default city
          handleCitySearch('London');
        }
      );
    } else {
      // Geolocation not supported, use default city
      handleCitySearch('London');
    }
  };

  const validateCityInput = (cityName) => {
    if (!cityName || cityName.trim().length < 2) {
      return { isValid: false, error: 'invalid_input' };
    }
    
    // Basic validation for valid characters
    const validCityRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!validCityRegex.test(cityName.trim())) {
      return { isValid: false, error: 'invalid_input' };
    }
    
    return { isValid: true };
  };

  const handleCitySearch = async (cityName) => {
    setError(null);
    setLastSearchQuery(cityName);
    
    // Validate input
    const validation = validateCityInput(cityName);
    if (!validation.isValid) {
      setError({
        type: validation.error,
        message: 'Please enter a valid city name with at least 2 characters.',
        searchQuery: cityName
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get comprehensive weather data (current + forecast)
      const data = await weatherAPI.getWeather(cityName, 3);
      
      setWeatherData({
        location: data.location,
        current: data.current
      });
      setForecastData(data);
      setCurrentCity(data.location.name);
      setLastUpdated(new Date());
      
      // Save last searched city
      localStorage.setItem('lastSearchedCity', data.location.name);
      
      toast({
        title: "Weather Updated! 🌤️",
        description: `Showing weather for ${data.location.name}`,
      });
      
      // Update API status to healthy if request succeeded
      setApiStatus('healthy');
      
    } catch (error) {
      let errorType = 'general';
      let errorMessage = 'Failed to fetch weather data. Please try again.';
      
      if (error instanceof WeatherAPIError) {
        if (error.isCityNotFound()) {
          errorType = 'city_not_found';
          errorMessage = `City "${cityName}" not found. Please check the spelling.`;
        } else if (error.isNetworkError()) {
          errorType = 'network_error';
          errorMessage = 'Network connection failed. Check your internet connection.';
          setApiStatus('error');
        } else if (error.isAPIError()) {
          errorType = 'api_error';
          errorMessage = 'Weather service is temporarily unavailable.';
          setApiStatus('degraded');
        } else if (error.isInvalidInput()) {
          errorType = 'invalid_input';
          errorMessage = error.message;
        }
      } else {
        setApiStatus('error');
      }
      
      setError({
        type: errorType,
        message: errorMessage,
        searchQuery: cityName
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (currentCity) {
      handleCitySearch(currentCity);
    } else if (lastSearchQuery) {
      handleCitySearch(lastSearchQuery);
    }
  };

  const handleRetry = () => {
    if (lastSearchQuery) {
      handleCitySearch(lastSearchQuery);
    } else {
      handleRefresh();
    }
  };

  const handleNewSearch = () => {
    setError(null);
    setLastSearchQuery('');
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
    toast({
      title: "Unit Changed",
      description: `Temperature unit changed to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`,
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    toast({
      title: darkMode ? "Light Mode" : "Dark Mode",
      description: `Switched to ${darkMode ? 'light' : 'dark'} mode`,
    });
  };

  const getBackgroundClass = () => {
    if (!weatherData?.current?.condition?.code) {
      return darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-100 via-white to-gray-100';
    }
    
    const conditionCode = weatherData.current.condition.code;
    const isDay = weatherData.current.is_day;
    
    if (darkMode) {
      return 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800';
    }
    
    switch (conditionCode) {
      case 1000: // Sunny
        return isDay 
          ? 'bg-gradient-to-br from-yellow-100 via-orange-100 to-blue-100'
          : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900';
      case 1003: // Partly cloudy
        return 'bg-gradient-to-br from-blue-100 via-white to-gray-100';
      case 1006: // Cloudy
        return 'bg-gradient-to-br from-gray-200 via-gray-100 to-white';
      case 1183: // Light rain
      case 1195: // Heavy rain
        return 'bg-gradient-to-br from-gray-300 via-blue-200 to-gray-400';
      default:
        return 'bg-gradient-to-br from-blue-100 via-white to-gray-100';
    }
  };

  const getApiStatusIcon = () => {
    // This function is no longer needed as we use APIStatusIndicator component
    return null;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${getBackgroundClass()}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <CloudRain className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Weather Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Real-time weather insights and forecasts
                </p>
                <APIStatusIndicator 
                  status={apiStatus} 
                  onStatusChange={setApiStatus}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <Card className="w-full lg:w-auto">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="unit-toggle" className="text-sm font-medium">
                    {unit === 'celsius' ? '°C' : '°F'}
                  </Label>
                  <Switch
                    id="unit-toggle"
                    checked={unit === 'fahrenheit'}
                    onCheckedChange={toggleUnit}
                  />
                  <Thermometer className="w-4 h-4 text-muted-foreground" />
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <Switch
                    id="dark-mode-toggle"
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                  <Moon className="w-4 h-4 text-blue-500" />
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onCitySelect={handleCitySearch}
            onSearch={handleCitySearch}
            isLoading={isLoading}
          />
          
          {/* Compact error display for search issues */}
          {error && error.type === 'invalid_input' && (
            <div className="mt-4">
              <CompactError 
                message={error.message} 
                onRetry={() => setError(null)}
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {isLoading ? (
          <div className="mb-8">
            <QuickStatsSkeleton />
          </div>
        ) : !error && weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Current Location</div>
                    <div className="font-semibold">{currentCity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                    <div className="font-semibold">
                      {weatherData ? (
                        unit === 'celsius' 
                          ? `${Math.round(weatherData.current.temp_c)}°C`
                          : `${Math.round(weatherData.current.temp_f)}°F`
                      ) : '--'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Condition</div>
                    <div className="font-semibold">
                      {weatherData?.current?.condition?.text || '--'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                    <div className="font-semibold text-xs sm:text-sm">
                      {weatherData ? 
                        formatLocalTime(weatherData.current.last_updated, weatherData.location.tz_id) :
                        lastUpdated.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Current Weather */}
          <div className="xl:col-span-2">
            {isLoading ? (
              <WeatherCardSkeleton />
            ) : error ? (
              <ErrorDisplay
                type={error.type}
                message={error.message}
                searchQuery={error.searchQuery}
                onRetry={handleRetry}
                onSearch={handleNewSearch}
              />
            ) : weatherData ? (
              <WeatherCard weatherData={weatherData} unit={unit} />
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <CloudRain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Search for a city to see weather data</p>
                </div>
              </Card>
            )}
          </div>

          {/* Forecast Chart */}
          <div className="xl:col-span-1">
            {isLoading ? (
              <ForecastCardSkeleton />
            ) : !error && forecastData ? (
              <ForecastChart forecastData={forecastData} unit={unit} />
            ) : (
              <Card className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">Forecast will appear here</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              <span className="text-sm">
                Powered by WeatherAPI.com • Built with React & Tailwind CSS
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <APIStatusIndicator 
              status={apiStatus} 
              onStatusChange={setApiStatus}
            />
            {currentCity && (
              <Badge variant="outline" className="text-xs">
                Current: {currentCity}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;