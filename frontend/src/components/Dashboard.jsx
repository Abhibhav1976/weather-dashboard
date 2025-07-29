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
  Zap,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
  TrendingUp,
  TrendingDown,
  Calendar,
  Settings,
  Star,
  Heart,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  Activity,
  AlertTriangle,
  CheckCircle,
  Sunrise,
  Sunset,
  Snowflake,
  Umbrella,
  Navigation,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Sparkles,
  Layers,
  Filter,
  BookmarkPlus,
  History,
  Globe,
  Satellite,
  Cloud,
  CloudSnow,
  CloudLightning
} from 'lucide-react';
import weatherAPI, { WeatherAPIError } from '../services/weatherApi';
import { formatLocalTime } from '../utils/timezone';

const Dashboard = () => {
  // Core state
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [unit, setUnit] = useState('celsius');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState('unknown');
  
  // Enhanced features state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [favoriteLocations, setFavoriteLocations] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('detailed'); // compact, detailed, premium
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [customTheme, setCustomTheme] = useState('default');
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    apiResponseTime: 0,
    renderTime: 0
  });

  const { toast } = useToast();
  const intervalRef = useRef(null);
  const performanceRef = useRef({ startTime: 0, apiStartTime: 0 });

  // Enhanced dynamic background based on weather conditions and time
  const getAdvancedBackgroundClass = () => {
    if (!weatherData?.current?.condition?.code) {
      return darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden';
    }
    
    const conditionCode = weatherData.current.condition.code;
    const isDay = weatherData.current.is_day;
    const temp = weatherData.current.temp_c;
    
    if (darkMode) {
      // Enhanced dark mode backgrounds
      switch (conditionCode) {
        case 1000: // Clear/Sunny
          return 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 relative overflow-hidden';
        case 1003: // Partly cloudy
          return 'bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 relative overflow-hidden';
        case 1006: // Cloudy
          return 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700 relative overflow-hidden';
        case 1183: // Light rain
        case 1195: // Heavy rain
          return 'bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-900 relative overflow-hidden';
        case 1210: // Light snow
        case 1225: // Heavy snow
          return 'bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-800 relative overflow-hidden';
        default:
          return 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden';
      }
    }
    
    // Enhanced light mode backgrounds with temperature-based gradients
    const tempClass = temp > 25 ? 'warm' : temp > 15 ? 'mild' : temp > 5 ? 'cool' : 'cold';
    
    switch (conditionCode) {
      case 1000: // Clear/Sunny
        return isDay 
          ? `bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 relative overflow-hidden ${tempClass}`
          : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden';
      case 1003: // Partly cloudy
        return 'bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 relative overflow-hidden';
      case 1006: // Cloudy
        return 'bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100 relative overflow-hidden';
      case 1183: // Light rain
      case 1195: // Heavy rain
        return 'bg-gradient-to-br from-slate-200 via-blue-200 to-cyan-200 relative overflow-hidden';
      case 1210: // Light snow
      case 1225: // Heavy snow
        return 'bg-gradient-to-br from-blue-100 via-slate-100 to-gray-100 relative overflow-hidden';
      default:
        return 'bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 relative overflow-hidden';
    }
  };

  // Animated background effects
  const BackgroundEffects = () => {
    if (!weatherData?.current?.condition?.code) return null;
    
    const conditionCode = weatherData.current.condition.code;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating particles for clear weather */}
        {conditionCode === 1000 && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${15 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Rain drops for rainy weather */}
        {(conditionCode === 1183 || conditionCode === 1195) && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-blue-400/20 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Snow flakes for snowy weather */}
        {(conditionCode === 1210 || conditionCode === 1225) && (
          <div className="absolute inset-0">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full animate-snow"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5" />
      </div>
    );
  };

  // Performance monitoring
  useEffect(() => {
    performanceRef.current.startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: endTime - performanceRef.current.startTime
      }));
    };
  }, [weatherData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && currentCity) {
      intervalRef.current = setInterval(() => {
        handleCitySearch(currentCity);
      }, refreshInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, currentCity]);

  // Enhanced initialization
  useEffect(() => {
    const loadStoredData = () => {
      const savedUnit = localStorage.getItem('weatherUnit');
      const savedDarkMode = localStorage.getItem('weatherDarkMode');
      const savedCity = localStorage.getItem('lastSearchedCity');
      const savedFavorites = localStorage.getItem('favoriteLocations');
      const savedHistory = localStorage.getItem('searchHistory');
      const savedAutoRefresh = localStorage.getItem('autoRefresh');
      const savedNotifications = localStorage.getItem('notifications');
      const savedTheme = localStorage.getItem('customTheme');
      
      if (savedUnit) setUnit(savedUnit);
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
      if (savedFavorites) setFavoriteLocations(JSON.parse(savedFavorites));
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
      if (savedAutoRefresh) setAutoRefresh(savedAutoRefresh === 'true');
      if (savedNotifications) setNotifications(savedNotifications === 'true');
      if (savedTheme) setCustomTheme(savedTheme);
      
      // Apply theme
      if (savedDarkMode === 'true') {
        document.documentElement.classList.add('dark');
      }
      
      // Enhanced font loading with Inter
      document.body.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      document.body.style.webkitFontSmoothing = 'antialiased';
      document.body.style.mozOsxFontSmoothing = 'grayscale';
    };

    loadStoredData();
    checkAPIHealth();
    
    if (localStorage.getItem('lastSearchedCity')) {
      const savedCity = localStorage.getItem('lastSearchedCity');
      setCurrentCity(savedCity);
      handleCitySearch(savedCity);
    } else {
      getUserLocation();
    }
  }, []);

  // Enhanced preferences saving
  useEffect(() => {
    localStorage.setItem('weatherUnit', unit);
    localStorage.setItem('weatherDarkMode', darkMode.toString());
    localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    localStorage.setItem('autoRefresh', autoRefresh.toString());
    localStorage.setItem('notifications', notifications.toString());
    localStorage.setItem('customTheme', customTheme);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [unit, darkMode, favoriteLocations, searchHistory, autoRefresh, notifications, customTheme]);

  const checkAPIHealth = async () => {
    try {
      const startTime = performance.now();
      const health = await weatherAPI.healthCheck();
      const endTime = performance.now();
      
      setApiStatus(health.status === 'healthy' ? 'healthy' : 'degraded');
      setPerformanceMetrics(prev => ({
        ...prev,
        apiResponseTime: endTime - startTime
      }));
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
            
            if (notifications) {
              toast({
                title: "Location Detected! 📍",
                description: `Weather loaded for ${data.location.name}`,
              });
            }
          } catch (error) {
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
        searchQuery: cityName
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await weatherAPI.getWeather(cityName, 7); // Extended forecast
      
      setWeatherData({
        location: data.location,
        current: data.current
      });
      setForecastData(data);
      setCurrentCity(data.location.name);
      setLastUpdated(new Date());
      
      // Update search history
      const newHistory = [cityName, ...searchHistory.filter(city => city !== cityName)].slice(0, 10);
      setSearchHistory(newHistory);
      
      localStorage.setItem('lastSearchedCity', data.location.name);
      
      // Performance metrics
      const apiEndTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        apiResponseTime: apiEndTime - performanceRef.current.apiStartTime
      }));
      
      if (notifications) {
        toast({
          title: "Weather Updated! 🌤️",
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
        searchQuery: cityName
      });
      
      if (notifications) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced utility functions
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
    if (notifications) {
      toast({
        title: "Unit Changed",
        description: `Temperature unit changed to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`,
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    if (notifications) {
      toast({
        title: darkMode ? "Light Mode" : "Dark Mode",
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
          title: "Added to Favorites! ⭐",
          description: `${currentCity} has been added to your favorites`,
        });
      }
    }
  };

  const removeFromFavorites = (city) => {
    const newFavorites = favoriteLocations.filter(fav => fav !== city);
    setFavoriteLocations(newFavorites);
    if (notifications) {
      toast({
        title: "Removed from Favorites",
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
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`Weather in ${currentCity}: ${weatherData.current.condition.text}, ${Math.round(weatherData.current.temp_c)}°C`);
        toast({
          title: "Copied to Clipboard! 📋",
          description: "Weather info copied to clipboard",
        });
      }
    }
  };

  // Advanced weather metrics calculations
  const weatherMetrics = useMemo(() => {
    if (!weatherData || !forecastData) return null;
    
    const current = weatherData.current;
    const forecast = forecastData.forecast?.forecastday || [];
    
    return {
      comfort: {
        heatIndex: current.temp_c + (current.humidity * 0.1),
        uvLevel: current.uv > 8 ? 'Very High' : current.uv > 6 ? 'High' : current.uv > 3 ? 'Moderate' : 'Low',
        airQuality: current.air_quality ? 'Good' : 'Unknown'
      },
      trends: {
        tempTrend: forecast.length > 1 ? 
          (forecast[1].day.avgtemp_c > forecast[0].day.avgtemp_c ? 'rising' : 'falling') : 'stable',
        rainChance: forecast[0]?.day?.daily_chance_of_rain || 0,
        windDirection: current.wind_dir
      }
    };
  }, [weatherData, forecastData]);

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${getAdvancedBackgroundClass()}`}>
      <BackgroundEffects />
      
      {/* Premium Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button
          onClick={toggleFullscreen}
          size="sm"
          className="rounded-full w-12 h-12 shadow-xl bg-primary/90 backdrop-blur-sm hover:bg-primary transform hover:scale-110 transition-all duration-300"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        
        {currentCity && (
          <Button
            onClick={addToFavorites}
            size="sm"
            variant="outline"
            className="rounded-full w-12 h-12 shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white transform hover:scale-110 transition-all duration-300"
            disabled={favoriteLocations.includes(currentCity)}
          >
            <Heart className={`w-4 h-4 ${favoriteLocations.includes(currentCity) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}
        
        <Button
          onClick={shareWeather}
          size="sm"
          variant="outline"
          className="rounded-full w-12 h-12 shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white transform hover:scale-110 transition-all duration-300"
          disabled={!weatherData}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-8xl relative z-10">
        {/* Enhanced Header with Premium Design */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
                <CloudRain className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight leading-tight">
                WeatherPro
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-muted-foreground text-lg font-medium">
                  Ultimate Weather Experience
                </p>
                <APIStatusIndicator status={apiStatus} onStatusChange={setApiStatus} />
                <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </div>

          {/* Advanced Control Panel */}
          <Card className="w-full lg:w-auto backdrop-blur-xl bg-card/80 border-border/30 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                {/* Temperature Unit Toggle */}
                <div className="flex items-center gap-3">
                  <Label htmlFor="unit-toggle" className="text-sm font-semibold">
                    {unit === 'celsius' ? '°C' : '°F'}
                  </Label>
                  <Switch
                    id="unit-toggle"
                    checked={unit === 'fahrenheit'}
                    onCheckedChange={toggleUnit}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Thermometer className="w-5 h-5 text-muted-foreground" />
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <Switch
                    id="dark-mode-toggle"
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Moon className="w-5 h-5 text-blue-500" />
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Auto-refresh Toggle */}
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  <Switch
                    id="auto-refresh-toggle"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className="text-sm font-medium">Auto</span>
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 font-semibold px-4 py-2 hover:scale-105 transition-transform duration-200"
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

        {/* Enhanced Search Section */}
        <div className="mb-8 space-y-4">
          <SearchBar
            onCitySelect={handleCitySearch}
            onSearch={handleCitySearch}
            isLoading={isLoading}
          />
          
          {/* Quick Access: Favorites & History */}
          {(favoriteLocations.length > 0 || searchHistory.length > 0) && (
            <div className="flex flex-wrap gap-4">
              {favoriteLocations.length > 0 && (
                <Card className="backdrop-blur-sm bg-card/60 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold">Favorites</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {favoriteLocations.map((city, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCitySearch(city)}
                            className="text-xs px-3 py-1 hover:scale-105 transition-transform"
                          >
                            {city}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromFavorites(city)}
                            className="p-1 h-6 w-6 text-red-500 hover:bg-red-100"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {searchHistory.length > 0 && (
                <Card className="backdrop-blur-sm bg-card/60 border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">Recent</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 5).map((city, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleCitySearch(city)}
                          className="text-xs px-3 py-1 hover:scale-105 transition-transform"
                        >
                          {city}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {error && error.type === 'invalid_input' && (
            <div className="mt-4">
              <CompactError message={error.message} onRetry={() => setError(null)} />
            </div>
          )}
        </div>

        {/* Premium Stats Grid */}
        {isLoading ? (
          <div className="mb-8">
            <QuickStatsSkeleton />
          </div>
        ) : !error && weatherData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {/* Location Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-blue-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Location</div>
                    <div className="font-bold text-sm truncate">{currentCity}</div>
                    <div className="text-xs text-muted-foreground">
                      {weatherData.location.country}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Thermometer className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Temperature</div>
                    <div className="font-bold text-lg">
                      {unit === 'celsius' 
                        ? `${Math.round(weatherData.current.temp_c)}°C`
                        : `${Math.round(weatherData.current.temp_f)}°F`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Feels like {unit === 'celsius' 
                        ? `${Math.round(weatherData.current.feelslike_c)}°C`
                        : `${Math.round(weatherData.current.feelslike_f)}°F`
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condition Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-purple-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10">
                    <Zap className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Condition</div>
                    <div className="font-bold text-sm truncate">
                      {weatherData.current.condition.text}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      UV Index: {weatherData.current.uv}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Humidity Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-cyan-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Humidity</div>
                    <div className="font-bold text-lg">{weatherData.current.humidity}%</div>
                    <div className="mt-1">
                      <Progress value={weatherData.current.humidity} className="h-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wind Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-indigo-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    <Wind className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Wind</div>
                    <div className="font-bold text-sm">
                      {Math.round(weatherData.current.wind_kph)} km/h
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Compass className="w-3 h-3" />
                      {weatherData.current.wind_dir}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated Card */}
            <Card className="group transition-all duration-300 hover:shadow-2xl border-l-4 border-l-orange-500 backdrop-blur-sm bg-card/80 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Updated</div>
                    <div className="font-bold text-xs">
                      {formatLocalTime(weatherData.current.last_updated, weatherData.location.tz_id)}
                    </div>
                    {autoRefresh && (
                      <Badge variant="outline" className="text-xs mt-1 px-1 py-0">
                        <Activity className="w-2 h-2 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit backdrop-blur-sm bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm font-medium">Forecast will appear here</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            {weatherData && weatherMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Comfort Index */}
                <Card className="backdrop-blur-sm bg-card/80 border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Comfort Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Heat Index</span>
                      <span className="font-semibold">{Math.round(weatherMetrics.comfort.heatIndex)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">UV Level</span>
                      <Badge variant={weatherData.current.uv > 6 ? "destructive" : weatherData.current.uv > 3 ? "default" : "secondary"}>
                        {weatherMetrics.comfort.uvLevel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Air Quality */}
                <Card className="backdrop-blur-sm bg-card/80 border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Visibility & Air
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Visibility</span>
                      <span className="font-semibold">{weatherData.current.vis_km} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pressure</span>
                      <span className="font-semibold">{weatherData.current.pressure_mb} mb</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="backdrop-blur-sm bg-card/80 border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">API Response</span>
                      <Badge variant="outline">
                        {Math.round(performanceMetrics.apiResponseTime)}ms
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={apiStatus === 'healthy' ? 'default' : apiStatus === 'degraded' ? 'secondary' : 'destructive'}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {apiStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            {forecastData?.forecast?.forecastday && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {forecastData.forecast.forecastday.map((day, index) => (
                  <Card key={index} className="backdrop-blur-sm bg-card/80 border-border/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="text-sm font-semibold">
                          {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : 
                            new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          }
                        </div>
                        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                          <img 
                            src={day.day.condition.icon} 
                            alt={day.day.condition.text}
                            className="w-8 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-lg">
                            {unit === 'celsius' 
                              ? `${Math.round(day.day.maxtemp_c)}°`
                              : `${Math.round(day.day.maxtemp_f)}°`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {unit === 'celsius' 
                              ? `${Math.round(day.day.mintemp_c)}°`
                              : `${Math.round(day.day.mintemp_f)}°`
                            }
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.day.condition.text}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Droplets className="w-3 h-3" />
                          {day.day.daily_chance_of_rain}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Temperature Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weatherMetrics && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Trend Direction</span>
                        <div className="flex items-center gap-1">
                          {weatherMetrics.trends.tempTrend === 'rising' ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-semibold capitalize">
                            {weatherMetrics.trends.tempTrend}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-card/80 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Weather Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rain Probability</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={weatherMetrics?.trends.rainChance || 0} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-semibold">
                          {weatherMetrics?.trends.rainChance || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Footer */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/30">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">
                    WeatherPro • Powered by WeatherAPI.com
                  </span>
                </div>
                <Badge variant="outline" className="px-2 py-1">
                  <Globe className="w-3 h-3 mr-1" />
                  Global Coverage
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <APIStatusIndicator status={apiStatus} onStatusChange={setApiStatus} />
                {currentCity && (
                  <Badge variant="outline" className="px-3 py-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {currentCity}
                  </Badge>
                )}
                <Badge variant="outline" className="px-3 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {Math.round(performanceMetrics.apiResponseTime)}ms
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes rain {
          0% { transform: translateY(-100vh) rotate(15deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(15deg); opacity: 0; }
        }
        @keyframes snow {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-rain {
          animation: rain 1s linear infinite;
        }
        .animate-snow {
          animation: snow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
