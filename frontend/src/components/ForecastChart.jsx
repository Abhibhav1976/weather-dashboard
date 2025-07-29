import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  Calendar, 
  Droplets, 
  Wind,
  ChevronRight,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { formatLocalTime } from '../utils/timezone';

const ForecastChart = ({ forecastData, unit }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [chartType, setChartType] = useState('temperature'); // temperature, humidity, wind

  if (!forecastData?.forecast?.forecastday) return null;

  const { forecastday } = forecastData.forecast;
  const timezoneId = forecastData.location?.tz_id;

  const getTemperature = (tempC, tempF) => {
    return unit === 'celsius' ? Math.round(tempC) : Math.round(tempF);
  };

  const getWindSpeed = (mph, kph) => {
    return unit === 'celsius' ? Math.round(kph) : Math.round(mph);
  };

  const getUnitLabel = (type) => {
    switch (type) {
      case 'temperature':
        return `Temp (${unit === 'celsius' ? '°C' : '°F'})`;
      case 'humidity':
        return 'Humidity (%)';
      case 'wind':
        return `Wind Speed (${unit === 'celsius' ? 'km/h' : 'mph'})`;
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const formatHour = (timeString) => {
    return formatLocalTime(timeString, timezoneId);
  };

  const getRainChance = (day) => {
    return day.daily_chance_of_rain || 0;
  };

  // Prepare chart data for 24-hour view
  const getChartData = () => {
    if (!forecastday[0]?.hour) return [];
    
    return forecastday[0].hour.slice(0, 24).map((hour, index) => ({
      time: formatHour(hour.time),
      fullTime: hour.time,
      temperature: getTemperature(hour.temp_c, hour.temp_f),
      humidity: hour.humidity,
      windSpeed: getWindSpeed(hour.wind_mph, hour.wind_kph),
      condition: hour.condition.text,
      icon: hour.condition.icon
    }));
  };

  // Prepare 3-day summary data
  const getDailySummaryData = () => {
    return forecastday.slice(0, 3).map((day, index) => ({
      day: formatDate(day.date),
      date: day.date,
      maxTemp: getTemperature(day.day.maxtemp_c, day.day.maxtemp_f),
      minTemp: getTemperature(day.day.mintemp_c, day.day.mintemp_f),
      avgTemp: getTemperature(day.day.avgtemp_c, day.day.avgtemp_f),
      humidity: Math.round(day.day.avghumidity),
      windSpeed: getWindSpeed(day.day.maxwind_mph, day.day.maxwind_kph),
      rainChance: getRainChance(day.day),
      condition: day.day.condition.text
    }));
  };

  const chartData = getChartData();
  const dailyData = getDailySummaryData();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {entry.value}
                {entry.dataKey === 'temperature' ? (unit === 'celsius' ? '°C' : '°F') :
                 entry.dataKey === 'humidity' ? '%' :
                 entry.dataKey === 'windSpeed' ? (unit === 'celsius' ? ' km/h' : ' mph') : ''}
              </span>
            </div>
          ))}
          {data.condition && (
            <p className="text-xs text-muted-foreground mt-1 border-t pt-1">
              {data.condition}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const HourlyChart = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Chart Type Selector - Mobile Responsive */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={chartType === 'temperature' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('temperature')}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Temperature</span>
          <span className="sm:hidden">Temp</span>
        </Button>
        <Button
          variant={chartType === 'humidity' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('humidity')}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Humidity</span>
          <span className="sm:hidden">Humidity</span>
        </Button>
        <Button
          variant={chartType === 'wind' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('wind')}
          className="flex items-center gap-2 text-xs sm:text-sm"
        >
          <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Wind Speed</span>
          <span className="sm:hidden">Wind</span>
        </Button>
      </div>

      {/* Chart Display */}
      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'temperature' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{ value: getUnitLabel('temperature'), angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#temperatureGradient)"
                name="Temperature"
              />
            </AreaChart>
          ) : chartType === 'humidity' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={[0, 100]}
                label={{ value: getUnitLabel('humidity'), angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="humidity" 
                fill="#3b82f6"
                name="Humidity"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                domain={['dataMin - 1', 'dataMax + 1']}
                label={{ value: getUnitLabel('wind'), angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="Wind Speed"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );

  const DailyChart = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* 3-Day Temperature Comparison */}
      <div className="h-48 sm:h-64 w-full">
        <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          3-Day Temperature Overview
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10 }} 
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              label={{ value: getUnitLabel('temperature'), angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="maxTemp" fill="#ef4444" name="Max Temp" radius={[2, 2, 0, 0]} />
            <Bar dataKey="minTemp" fill="#3b82f6" name="Min Temp" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily forecast items - Mobile Optimized */}
      <div className="space-y-3">
        {forecastday.slice(0, 3).map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedDay(index)}
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[60px] sm:min-w-[80px]">
                {formatDate(day.date)}
              </div>
              
              <img
                src={`https:${day.day.condition.icon}`}
                alt={day.day.condition.text}
                className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-200 group-hover:scale-110 animate-pulse flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base truncate">{day.day.condition.text}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {getRainChance(day.day)}% chance of rain
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Wind className="w-4 h-4" />
                <span className="text-sm">
                  {getWindSpeed(day.day.maxwind_mph, day.day.maxwind_kph)}
                  {unit === 'celsius' ? ' km/h' : ' mph'}
                </span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-base sm:text-lg font-semibold text-red-500">
                  {getTemperature(day.day.maxtemp_c, day.day.maxtemp_f)}°
                </span>
                <span className="text-sm sm:text-base text-muted-foreground text-blue-500">
                  {getTemperature(day.day.mintemp_c, day.day.mintemp_f)}°
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Details - Mobile Responsive */}
      {forecastday[selectedDay] && (
        <div className="mt-6 p-3 sm:p-4 bg-accent/20 rounded-lg border">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-4 h-4" />
            {formatDate(forecastday[selectedDay].date)} Details
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Temp</div>
              <div className="font-medium text-sm sm:text-base">
                {getTemperature(
                  forecastday[selectedDay].day.avgtemp_c,
                  forecastday[selectedDay].day.avgtemp_f
                )}°{unit === 'celsius' ? 'C' : 'F'}
              </div>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Humidity</div>
              <div className="font-medium text-sm sm:text-base">{forecastday[selectedDay].day.avghumidity}%</div>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">UV Index</div>
              <Badge variant="outline" className="w-fit text-xs">
                {forecastday[selectedDay].day.uv}
              </Badge>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Precipitation</div>
              <div className="font-medium text-xs sm:text-sm">
                {unit === 'celsius' 
                  ? `${forecastday[selectedDay].day.totalprecip_mm} mm`
                  : `${forecastday[selectedDay].day.totalprecip_in} in`
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="hidden sm:inline">Weather Forecast & Analytics</span>
          <span className="sm:hidden">Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Daily View</span>
              <span className="sm:hidden">Daily</span>
            </TabsTrigger>
            <TabsTrigger value="hourly" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">24H Charts</span>
              <span className="sm:hidden">Hourly</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4 mt-6">
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
