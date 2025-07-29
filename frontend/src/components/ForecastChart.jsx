import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  TrendingUp, 
  Calendar, 
  Droplets, 
  Wind,
  ChevronRight,
  BarChart3,
  Activity,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Zap,
  Eye,
  Thermometer,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Target,
  Layers,
  PieChart,
  LineChart,
  AreaChart as AreaChartIcon,
  Filter,
  RefreshCw,
  Download,
  Share2,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { formatLocalTime } from '../utils/timezone';

const ForecastChart = ({ forecastData, unit }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [chartType, setChartType] = useState('temperature');
  const [viewMode, setViewMode] = useState('detailed'); // compact, detailed, premium
  const [isInteractive, setIsInteractive] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h'); // 12h, 24h, 3d
  const [animationEnabled, setAnimationEnabled] = useState(true);

  if (!forecastData?.forecast?.forecastday) return null;

  const { forecastday } = forecastData.forecast;
  const timezoneId = forecastData.location?.tz_id;

  // Enhanced utility functions
  const getTemperature = (tempC, tempF) => unit === 'celsius' ? Math.round(tempC) : Math.round(tempF);
  const getWindSpeed = (mph, kph) => unit === 'celsius' ? Math.round(kph) : Math.round(mph);
  const getUnitLabel = (type) => {
    switch (type) {
      case 'temperature': return `Temp (${unit === 'celsius' ? '°C' : '°F'})`;
      case 'humidity': return 'Humidity (%)';
      case 'wind': return `Wind Speed (${unit === 'celsius' ? 'km/h' : 'mph'})`;
      case 'pressure': return 'Pressure (mb)';
      case 'uv': return 'UV Index';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatHour = (timeString) => formatLocalTime(timeString, timezoneId);
  const getRainChance = (day) => day.daily_chance_of_rain || 0;

  // Weather condition icons mapping
  const getWeatherIcon = (conditionCode, isDay = true) => {
    const iconMap = {
      1000: Sun, // Sunny
      1003: Cloud, // Partly cloudy
      1006: Cloud, // Cloudy
      1009: Cloud, // Overcast
      1030: Cloud, // Mist
      1183: CloudRain, // Light rain
      1195: CloudRain, // Heavy rain
      1210: Snowflake, // Light snow
      1225: Snowflake, // Heavy snow
      1276: Zap, // Thunderstorm
    };
    return iconMap[conditionCode] || (isDay ? Sun : Moon);
  };

  // Enhanced chart data with more metrics
  const getChartData = useMemo(() => {
    if (!forecastday[0]?.hour) return [];
    
    const hours = selectedTimeRange === '12h' 
      ? forecastday[0].hour.slice(0, 12)
      : forecastday[0].hour.slice(0, 24);
    
    return hours.map((hour, index) => ({
      time: formatHour(hour.time),
      fullTime: hour.time,
      temperature: getTemperature(hour.temp_c, hour.temp_f),
      humidity: hour.humidity,
      windSpeed: getWindSpeed(hour.wind_mph, hour.wind_kph),
      pressure: Math.round(hour.pressure_mb),
      uv: hour.uv || 0,
      condition: hour.condition.text,
      icon: hour.condition.icon,
      conditionCode: hour.condition.code,
      feelsLike: getTemperature(hour.feelslike_c, hour.feelslike_f),
      dewPoint: getTemperature(hour.dewpoint_c, hour.dewpoint_f),
      heatIndex: getTemperature(hour.heatindex_c, hour.heatindex_f)
    }));
  }, [forecastday, unit, selectedTimeRange]);

  // Enhanced daily summary with trend analysis
  const getDailySummaryData = useMemo(() => {
    return forecastday.slice(0, 7).map((day, index) => {
      const prevDay = index > 0 ? forecastday[index - 1] : null;
      const tempTrend = prevDay ? 
        (day.day.avgtemp_c > prevDay.day.avgtemp_c ? 'up' : 
         day.day.avgtemp_c < prevDay.day.avgtemp_c ? 'down' : 'stable') : 'stable';
      
      return {
        day: formatDate(day.date),
        date: day.date,
        maxTemp: getTemperature(day.day.maxtemp_c, day.day.maxtemp_f),
        minTemp: getTemperature(day.day.mintemp_c, day.day.mintemp_f),
        avgTemp: getTemperature(day.day.avgtemp_c, day.day.avgtemp_f),
        humidity: Math.round(day.day.avghumidity),
        windSpeed: getWindSpeed(day.day.maxwind_mph, day.day.maxwind_kph),
        rainChance: getRainChance(day.day),
        condition: day.day.condition.text,
        conditionCode: day.day.condition.code,
        uv: day.day.uv || 0,
        tempTrend,
        precipitation: unit === 'celsius' ? day.day.totalprecip_mm : day.day.totalprecip_in
      };
    });
  }, [forecastday, unit]);

  // Advanced tooltip with premium styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 min-w-[250px] max-w-[300px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
            <Clock className="w-4 h-4 text-primary" />
            <p className="font-semibold text-base">{label}</p>
          </div>
          
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground text-sm">{entry.name}:</span>
                </div>
                <span className="font-semibold text-sm">
                  {entry.value}
                  {entry.dataKey === 'temperature' ? (unit === 'celsius' ? '°C' : '°F') :
                   entry.dataKey === 'humidity' ? '%' :
                   entry.dataKey === 'windSpeed' ? (unit === 'celsius' ? ' km/h' : ' mph') :
                   entry.dataKey === 'pressure' ? ' mb' :
                   entry.dataKey === 'uv' ? ' UV' : ''}
                </span>
              </div>
            ))}
          </div>
          
          {data.condition && (
            <div className="mt-3 pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Cloud className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{data.condition}</p>
              </div>
              {data.feelsLike && (
                <p className="text-xs text-muted-foreground mt-1">
                  Feels like {data.feelsLike}°{unit === 'celsius' ? 'C' : 'F'}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Premium Chart Types Component
  const ChartTypeSelector = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { type: 'temperature', icon: Thermometer, label: 'Temperature', color: 'text-red-500' },
        { type: 'humidity', icon: Droplets, label: 'Humidity', color: 'text-blue-500' },
        { type: 'wind', icon: Wind, label: 'Wind Speed', color: 'text-green-500' },
        { type: 'pressure', icon: Gauge, label: 'Pressure', color: 'text-purple-500' },
        { type: 'uv', icon: Sun, label: 'UV Index', color: 'text-orange-500' }
      ].map(({ type, icon: Icon, label, color }) => (
        <Button
          key={type}
          variant={chartType === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType(type)}
          className={`flex items-center gap-2 text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
            chartType === type ? 'shadow-lg' : ''
          }`}
        >
          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${chartType === type ? 'text-white' : color}`} />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  );

  // Premium Hourly Chart with multiple chart types
  const HourlyChart = () => {
    const getChartComponent = () => {
      const commonProps = {
        data: getChartData(),
        margin: { top: 20, right: 30, left: 20, bottom: 60 }
      };

      switch (chartType) {
        case 'temperature':
          return (
            <RechartsAreaChart {...commonProps}>
              <defs>
                <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                domain={['dataMin - 3', 'dataMax + 3']}
                label={{ 
                  value: getUnitLabel('temperature'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#temperatureGradient)"
                name="Temperature"
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                animationDuration={animationEnabled ? 2000 : 0}
              />
            </RechartsAreaChart>
          );

        case 'humidity':
          return (
            <RechartsBarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                domain={[0, 100]}
                label={{ 
                  value: getUnitLabel('humidity'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="humidity" 
                fill="#3b82f6"
                name="Humidity"
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 1500 : 0}
              />
            </RechartsBarChart>
          );

        case 'wind':
          return (
            <RechartsLineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{ 
                  value: getUnitLabel('wind'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                name="Wind Speed"
                animationDuration={animationEnabled ? 2000 : 0}
              />
            </RechartsLineChart>
          );

        case 'pressure':
          return (
            <RechartsAreaChart {...commonProps}>
              <defs>
                <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                label={{ 
                  value: getUnitLabel('pressure'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#pressureGradient)"
                name="Pressure"
                animationDuration={animationEnabled ? 2000 : 0}
              />
            </RechartsAreaChart>
          );

        case 'uv':
          return (
            <RechartsBarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={70}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                domain={[0, 12]}
                label={{ 
                  value: getUnitLabel('uv'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="uv" 
                fill="#f97316"
                name="UV Index"
                radius={[4, 4, 0, 0]}
                animationDuration={animationEnabled ? 1500 : 0}
              />
            </RechartsBarChart>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        {/* Enhanced Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ChartTypeSelector />
          
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTimeRange === '12h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('12h')}
              className="text-xs"
            >
              12H
            </Button>
            <Button
              variant={selectedTimeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange('24h')}
              className="text-xs"
            >
              24H
            </Button>
          </div>
        </div>

        {/* Premium Chart Display */}
        <div className="relative">
          <div className="h-72 sm:h-80 w-full bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <ResponsiveContainer width="100%" height="100%">
              {getChartComponent()}
            </ResponsiveContainer>
          </div>
          
          {/* Chart overlay info */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>

        {/* Quick Stats for current chart type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {chartType === 'temperature' && getChartData().length > 0 && (
            <>
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUp className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-muted-foreground">Max</span>
                </div>
                <div className="font-semibold text-sm">
                  {Math.max(...getChartData().map(d => d.temperature))}°
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDown className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Min</span>
                </div>
                <div className="font-semibold text-sm">
                  {Math.min(...getChartData().map(d => d.temperature))}°
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Avg</span>
                </div>
                <div className="font-semibold text-sm">
                  {Math.round(getChartData().reduce((sum, d) => sum + d.temperature, 0) / getChartData().length)}°
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Range</span>
                </div>
                <div className="font-semibold text-sm">
                  {Math.max(...getChartData().map(d => d.temperature)) - Math.min(...getChartData().map(d => d.temperature))}°
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Daily Chart with premium features
  const DailyChart = () => (
    <div className="space-y-6">
      {/* Premium 7-Day Temperature Comparison */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            7-Day Temperature Trends
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Forecast
            </Badge>
          </div>
        </div>
        
        <div className="h-64 w-full bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/30">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getDailySummaryData()}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                stroke="currentColor"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'currentColor' }}
                label={{ 
                  value: getUnitLabel('temperature'), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fontSize: '10px', fill: 'currentColor' } 
                }}
                stroke="currentColor"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="maxTemp" fill="#ef4444" name="Max Temp" radius={[2, 2, 0, 0]} />
              <Bar dataKey="minTemp" fill="#3b82f6" name="Min Temp" radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="avgTemp"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="Average"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Daily forecast cards */}
      <div className="space-y-3">
        <h4 className="text-base font-semibold flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          Extended Forecast
        </h4>
        
        {getDailySummaryData().map((day, index) => {
          const WeatherIcon = getWeatherIcon(day.conditionCode);
          const isSelected = selectedDay === index;
          
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'bg-primary/10 border-primary/30 shadow-lg scale-[1.02]' 
                  : 'bg-card/60 backdrop-blur-sm border-border/30 hover:bg-card/80 hover:shadow-xl hover:scale-[1.01]'
              }`}
              onClick={() => setSelectedDay(index)}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="text-sm font-semibold text-muted-foreground min-w-[80px]">
                    {day.day}
                  </div>
                  
                  <div className="relative">
                    <WeatherIcon className="w-10 h-10 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-50 -z-10" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate flex items-center gap-2">
                      {day.condition}
                      {day.tempTrend === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                      {day.tempTrend === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                      {day.tempTrend === 'stable' && <Minus className="w-3 h-3 text-gray-500" />}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {day.rainChance}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Wind className="w-3 h-3" />
                        {day.windSpeed}{unit === 'celsius' ? ' km/h' : ' mph'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        UV {day.uv}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-500">
                        {day.maxTemp}°
                      </span>
                      <span className="text-base text-blue-500 font-medium">
                        {day.minTemp}°
                      </span>
                    </div>
                    <div className="mt-1">
                      <Progress 
                        value={day.humidity} 
                        className="w-16 h-1.5" 
                        aria-label={`Humidity: ${day.humidity}%`}
                      />
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 transition-all duration-300 ${
                    isSelected ? 'text-primary rotate-90' : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-1'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Selected Day Details */}
      {forecastday[selectedDay] && (
        <div className="mt-6 p-6 bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm rounded-xl border border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {formatDate(forecastday[selectedDay].date)} Details
            </h4>
            <Badge variant="secondary" className="px-3 py-1">
              <Info className="w-3 h-3 mr-1" />
              Detailed View
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Average Temp',
                value: `${getTemperature(forecastday[selectedDay].day.avgtemp_c, forecastday[selectedDay].day.avgtemp_f)}°${unit === 'celsius' ? 'C' : 'F'}`,
                icon: Thermometer,
                color: 'text-orange-500'
              },
              {
                label: 'Humidity',
                value: `${forecastday[selectedDay].day.avghumidity}%`,
                icon: Droplets,
                color: 'text-blue-500'
              },
              {
                label: 'UV Index',
                value: forecastday[selectedDay].day.uv,
                icon: Sun,
                color: 'text-yellow-500'
              },
              {
                label: 'Precipitation',
                value: unit === 'celsius' 
                  ? `${forecastday[selectedDay].day.totalprecip_mm} mm`
                  : `${forecastday[selectedDay].day.totalprecip_in} in`,
                icon: CloudRain,
                color: 'text-cyan-500'
              },
              {
                label: 'Max Wind',
                value: `${getWindSpeed(forecastday[selectedDay].day.maxwind_mph, forecastday[selectedDay].day.maxwind_kph)} ${unit === 'celsius' ? 'km/h' : 'mph'}`,
                icon: Wind,
                color: 'text-green-500'
              },
              {
                label: 'Visibility',
                value: `${Math.round(forecastday[selectedDay].day.avgvis_km)} km`,
                icon: Eye,
                color: 'text-purple-500'
              }
            ].map((item, index) => (
              <div key={index} className="bg-card/60 backdrop-blur-sm rounded-lg p-4 border border-border/20 hover:bg-card/80 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <div className="font-bold text-base">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl group bg-transparent">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple/5 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Weather Analytics & Forecasting
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 border-primary/20">
              <Layers className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className="p-2"
            >
              {animationEnabled ? <Zap className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2 backdrop-blur-sm bg-muted/50 rounded-xl">
            <TabsTrigger value="daily" className="flex items-center gap-2 text-sm rounded-lg">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Daily Forecast</span>
              <span className="sm:hidden">Daily</span>
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-2 text-sm rounded-lg">
              <AreaChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Hourly Analysis</span>
              <span className="sm:hidden">Hourly</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6 mt-6">
            <DailyChart />
          </TabsContent>

          <TabsContent value="hourly" className="mt-6">
            <HourlyChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
