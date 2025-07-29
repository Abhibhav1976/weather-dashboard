import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import SearchBar from './SearchBar';
import WeatherCard from './WeatherCard';
import ForecastChart from './ForecastChart';
import ErrorDisplay, { CompactError } from './ErrorDisplay';
import APIStatusIndicator from './APIStatusIndicator';
import {
  WeatherCardSkeleton,
  ForecastCardSkeleton,
  QuickStatsSkeleton,
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
  Zap,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  Heart,
  Share2,
  Maximize2,
  Minimize2,
  Activity,
  CheckCircle,
} from 'lucide-react';
import weatherAPI, { WeatherAPIError } from '../services/weatherApi';
import { formatLocalTime } from '../utils/timezone';

const Dashboard = () => {
  // === Core State ===
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
  // === Enhanced Features State ===
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes default
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(true);

  const { toast } = useToast();
  const intervalRef = useRef(null);
  const performanceRef = useRef({ startTime: 0, apiStartTime: 0 });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
  });

  // === Initialization and Preferences ===
  useEffect(() => {
    const loadStoredData = () => {
      const savedUnit = localStorage.getItem('weatherUnit');
      const savedDarkMode = localStorage.getItem('weatherDarkMode');
      const savedCity = localStorage.getItem('lastSearchedCity');
      const savedFavorites = localStorage.getItem('favoriteLocations');
      const savedHistory = localStorage.getItem('searchHistory');
      const savedAutoRefresh = localStorage.getItem('autoRefresh');
      const savedNotifications = localStorage.getItem('notifications');

      if (savedUnit) setUnit(savedUnit);
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
      if (savedFavorites) setFavoriteLocations(JSON.parse(savedFavorites));
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
      if (savedAutoRefresh) setAutoRefresh(savedAutoRefresh === 'true');
      if (savedNotifications) setNotifications(savedNotifications === 'true');

      // Apply dark mode class
      if (savedDarkMode === 'true') {
        document.documentElement.classList.add('dark');
      }

      // Apply font smoothing and font family
      document.body.style.fontFamily =
        'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      document.body.style.webkitFontSmoothing = 'antialiased';
      document.body.style.mozOsxFontSmoothing = 'grayscale';

      if (savedCity) {
        setCurrentCity(savedCity);
        handleCitySearch(savedCity);
      } else {
        getUserLocation();
      }
    };

    loadStoredData();
    checkAPIHealth();
  }, []);

  // Persist preferences and update dark mode class
  useEffect(() => {
    localStorage.setItem('weatherUnit', unit);
    localStorage.setItem('weatherDarkMode', darkMode.toString());
    localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    localStorage.setItem('autoRefresh', autoRefresh.toString());
    localStorage.setItem('notifications', notifications.toString());

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [unit, darkMode, favoriteLocations, searchHistory, autoRefresh, notifications]);

  // Auto-refresh weather data
  useEffect(() => {
    if (autoRefresh && currentCity) {
      intervalRef.current = setInterval(() => {
        handleCitySearch(currentCity);
      }, refreshInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refreshInterval, currentCity]);

  // Performance tracking
  useEffect(() => {
    performanceRef.current.startTime = performance.now();
    return () => {
      const endTime = performance.now();
      setPerformanceMetrics((prev) => ({
        ...prev,
        renderTime: endTime - performanceRef.current.startTime,
      }));
    };
  }, [weatherData]);

  // === API & Location Methods ===
  const checkAPIHealth = async () => {
    try {
      const startTime = performance.now();
      const health = await weatherAPI.healthCheck();
      const endTime = performance.now();

      setApiStatus(health.status === 'healthy' ? 'healthy' : 'degraded');
      setPerformanceMetrics((prev) => ({
        ...prev,
        apiResponseTime: endTime - startTime,
      }));
    } catch {
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

            if (notifications) {
              toast({
                title: 'Location Detected! 📍',
                description: `Weather loaded for ${data.location.name}`,
              });
            }
          } catch {
            handleCitySearch('London');
          }
        },
        () => handleCitySearch('London')
      );
    } else {
      handleCitySearch('London');
    }
  };

  const validateCityInput = (cityName) => {
    if (!cityName || cityName.trim().length < 2) {
      return { isValid: false, error: 'invalid_input' };
    }

    const validCityRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!validCityRegex.test(cityName.trim())) {
      return { isValid: false, error: 'invalid_input' };
    }
    return { isValid: true };
  };

  const handleCitySearch = async (cityName) => {
    performanceRef.current.apiStartTime = performance.now();
    setError(null);
    setLastSearchQuery(cityName);

    const validation = validateCityInput(cityName);
    if (!validation.isValid) {
      setError({
        type: validation.error,
        message: 'Please enter a valid city name with at least 2 characters.',
        searchQuery: cityName,
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await weatherAPI.getWeather(cityName, 7); // Extended forecast

      setWeatherData({
        location: data.location,
        current: data.current,
      });
      setForecastData(data);
      setCurrentCity(data.location.name);
      setLastUpdated(new Date());

      const newHistory = [cityName, ...searchHistory.filter((city) => city !== cityName)].slice(0, 10);
      setSearchHistory(newHistory);

      localStorage.setItem('lastSearchedCity', data.location.name);

      const apiEndTime = performance.now();
      setPerformanceMetrics((prev) => ({
        ...prev,
        apiResponseTime: apiEndTime - performanceRef.current.apiStartTime,
      }));

      if (notifications) {
        toast({
          title: 'Weather Updated! 🌤️',
          description: `Showing weather for ${data.location.name}`,
        });
      }

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
        searchQuery: cityName,
      });

      if (notifications) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
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
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
    if (notifications) {
      toast({
        title: 'Unit Changed',
        description: `Temperature unit changed to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`,
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (notifications) {
      toast({
        title: darkMode ? 'Light Mode' : 'Dark Mode',
        description: `Switched to ${darkMode ? 'light' : 'dark'} mode`,
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const addToFavorites = () => {
    if (currentCity && !favoriteLocations.includes(currentCity)) {
      const newFavorites = [...favoriteLocations, currentCity];
      setFavoriteLocations(newFavorites);
      if (notifications) {
        toast({
          title: 'Added to Favorites! ⭐',
          description: `${currentCity} has been added to your favorites`,
        });
      }
    }
  };

  const removeFromFavorites = (city) => {
    const newFavorites = favoriteLocations.filter((fav) => fav !== city);
    setFavoriteLocations(newFavorites);
    if (notifications) {
      toast({
        title: 'Removed from Favorites',
        description: `${city} has been removed from your favorites`,
      });
    }
  };

  const shareWeather = async () => {
    if (navigator.share && weatherData) {
      try {
        await navigator.share({
          title: 'Weather Update',
          text: `Current weather in ${currentCity}: ${weatherData.current.condition.text}, ${Math.round(weatherData.current.temp_c)}°C`,
          url: window.location.href,
        });
      } catch {
        navigator.clipboard.writeText(
          `Weather in ${currentCity}: ${weatherData.current.condition.text}, ${Math.round(weatherData.current.temp_c)}°C`
        );
        toast({
          title: 'Copied to Clipboard! 📋',
          description: 'Weather info copied to clipboard',
        });
      }
    }
  };

  // === Dynamic Background Configuration & Effects ===

  const getDynamicBackgroundConfig = () => {
    if (!weatherData?.current?.condition?.code) {
      return darkMode
        ? { background: 'from-gray-900 via-slate-900 to-indigo-950', effect: null }
        : { background: 'from-blue-50 via-sky-100 to-fuchsia-100', effect: null };
    }
    const code = weatherData.current.condition.code;
    const isDay = weatherData.current.is_day;

    if ([1000].includes(code)) {
      return isDay
        ? { background: 'from-yellow-200 via-orange-100 to-purple-200', effect: 'sunny' }
        : { background: 'from-blue-900 via-indigo-950 to-fuchsia-900', effect: 'clearNight' };
    }
    if ([1003].includes(code)) {
      return isDay
        ? { background: 'from-sky-200 via-blue-100 to-indigo-100', effect: 'cloudy' }
        : { background: 'from-blue-950 via-gray-900 to-slate-900', effect: 'cloudy' };
    }
    if ([1006, 1009, 1030, 1135, 1147].includes(code)) {
      return darkMode
        ? { background: 'from-slate-900 via-gray-800 to-zinc-700', effect: 'cloudy' }
        : { background: 'from-gray-100 via-slate-100 to-gray-300', effect: 'cloudy' };
    }
    if ([1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
      return { background: 'from-sky-300 via-blue-400 to-slate-600', effect: 'rainy' };
    }
    if ([1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264].includes(code)) {
      return { background: 'from-blue-100 via-slate-200 to-gray-100', effect: 'snowy' };
    }
    if ([1273, 1276].includes(code)) {
      return { background: 'from-fuchsia-900 via-indigo-900 to-gray-900', effect: 'storm' };
    }
    return darkMode
      ? { background: 'from-slate-900 via-gray-900 to-indigo-900', effect: null }
      : { background: 'from-blue-50 via-sky-100 to-fuchsia-100', effect: null };
  };

  const DynamicBackgroundEffects = () => {
    const config = getDynamicBackgroundConfig();
    if (!config.effect) return null;
    if (config.effect === 'sunny')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300/25 rounded-full animate-float"
              style={{
                left: `${Math.random() * 99}%`,
                top: `${Math.random() * 99}%`,
                animationDelay: `${Math.random() * 11}s`,
                animationDuration: `${14 + Math.random() * 7}s`,
              }}
            />
          ))}
        </div>
      );
    if (config.effect === 'rainy')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(31)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-400/25 animate-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2.5}s`,
                animationDuration: `${1.1 + Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      );
    if (config.effect === 'snowy')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(17)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/60 rounded-full animate-snow"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 2.3}s`,
              }}
            />
          ))}
        </div>
      );
    if (config.effect === 'storm')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute w-full h-full bg-yellow-100/5 animate-flash pointer-events-none" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-2/3 h-40 bg-gradient-to-b from-gray-700/60 to-transparent blur-2xl rounded-full" />
        </div>
      );
    if (config.effect === 'cloudy')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-8 bg-white/20 rounded-full blur-2xl animate-cloud"
              style={{
                left: `${Math.random() * 97}%`,
                top: `${Math.random() * 63}%`,
                animationDelay: `${Math.random() * 7}s`,
                animationDuration: `${13 + Math.random() * 8}s`,
              }}
            />
          ))}
        </div>
      );
    if (config.effect === 'clearNight')
      return (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(33)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 97}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      );
    return null;
  };

  // -- Dynamic Background config for outer container
  const dynamicBgConfig = getDynamicBackgroundConfig();

  // === JSX Return ===
  return (
    <div
      className={`min-h-screen transition-all duration-700 relative z-0 bg-gradient-to-br ${dynamicBgConfig.background}`}
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      {/* Background animations */}
      <DynamicBackgroundEffects effect={dynamicBgConfig.effect} />

      {/* Main content is rendered over the background */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20">
                <CloudRain className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Weather Dashboard
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground text-sm sm:text-base font-medium">
                    Real-time weather insights and forecasts
                  </p>
                  <APIStatusIndicator status={apiStatus} onStatusChange={setApiStatus} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <Card className="w-full lg:w-auto backdrop-blur-sm bg-card/80 border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="unit-toggle" className="text-sm font-medium">
                      {unit === 'celsius' ? '°C' : '°F'}
                    </Label>
                    <Switch id="unit-toggle" checked={unit === 'fahrenheit'} onCheckedChange={toggleUnit} />
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-500" />
                    <Switch id="dark-mode-toggle" checked={darkMode} onCheckedChange={toggleDarkMode} />
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar onCitySelect={handleCitySearch} onSearch={handleCitySearch} isLoading={isLoading} />

            {/* Compact error display for search issues */}
            {error && error.type === 'invalid_input' && (
              <div className="mt-4">
                <CompactError message={error.message} onRetry={() => setError(null)} />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {isLoading ? (
            <div className="mb-8">
              <QuickStatsSkeleton />
            </div>
          ) : (
            !error &&
            weatherData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-blue-500 backdrop-blur-sm bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">Current Location</div>
                        <div className="font-semibold">{currentCity}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">Temperature</div>
                        <div className="font-semibold">
                          {unit === 'celsius' ? `${Math.round(weatherData.current.temp_c)}°C` : `${Math.round(weatherData.current.temp_f)}°F`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-purple-500 backdrop-blur-sm bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">Condition</div>
                        <div className="font-semibold">{weatherData.current.condition.text}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transition-all duration-200 hover:shadow-lg border-l-4 border-l-orange-500 backdrop-blur-sm bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-muted-foreground font-medium">Last Updated</div>
                        <div className="font-semibold text-xs sm:text-sm">{formatLocalTime(weatherData.current.last_updated, weatherData.location.tz_id)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                <Card className="h-[400px] flex items-center justify-center backdrop-blur-sm bg-card/80">
                  <div className="text-center">
                    <CloudRain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Search for a city to see weather data</p>
                  </div>
                </Card>
              )}
            </div>

            <div className="xl:col-span-1">
              {isLoading ? (
                <ForecastCardSkeleton />
              ) : !error && forecastData ? (
                <ForecastChart forecastData={forecastData} unit={unit} />
              ) : (
                <Card className="h-[400px] flex items-center justify-center backdrop-blur-sm bg-card/80">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm font-medium">Forecast will appear here</p>
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
                <span className="text-sm font-medium">
                  Powered by WeatherAPI.com • Built with React & Tailwind CSS
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <APIStatusIndicator status={apiStatus} onStatusChange={setApiStatus} />
              {currentCity && (
                <Badge variant="outline" className="text-xs font-medium">
                  Current: {currentCity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Animations CSS */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(3deg);
          }
        }
        @keyframes cloud {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-9px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes rain {
          0% {
            transform: translateY(-120vh) rotate(8deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotate(8deg);
            opacity: 0;
          }
        }
        @keyframes snow {
          0% {
            transform: translateY(-110vh) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(180deg);
            opacity: 0;
          }
        }
        @keyframes flash {
          0%,
          98%,
          100% {
            opacity: 0;
          }
          99% {
            opacity: 0.55;
          }
        }
        .animate-float {
          animation: float 16s ease-in-out infinite;
        }
        .animate-cloud {
          animation: cloud 16s ease-in-out infinite;
        }
        .animate-rain {
          animation: rain 1.2s linear infinite;
        }
        .animate-snow {
          animation: snow 6.2s linear infinite;
        }
        .animate-flash {
          animation: flash 11s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
