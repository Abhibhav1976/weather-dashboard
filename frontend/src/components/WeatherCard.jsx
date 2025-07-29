import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge, 
  MapPin,
  Clock
} from 'lucide-react';
import UVIndexTooltip from './UVIndexTooltip';
import { formatLocalTime, getTimezoneAbbreviation } from '../utils/timezone';

const WeatherCard = ({ weatherData, unit }) => {
  if (!weatherData) return null;

  const { location, current } = weatherData;
  
  const getTemperature = (tempC, tempF) => unit === 'celsius' 
    ? `${Math.round(tempC)}°C` 
    : `${Math.round(tempF)}°F`;

  const getWindSpeed = (mph, kph) => unit === 'celsius' 
    ? `${Math.round(kph)} km/h` 
    : `${Math.round(mph)} mph`;

  const getVisibility = (km, miles) => unit === 'celsius' 
    ? `${Math.round(km)} km` 
    : `${Math.round(miles)} mi`;

  // Animated dynamic gradient by condition
  const getBackgroundGradient = (conditionCode) => {
    const gradients = {
      1000: 'from-yellow-300 via-orange-400 to-pink-400',    // Sunny
      1003: 'from-blue-300 via-blue-400 to-blue-500',        // Partly cloudy
      1006: 'from-slate-400 via-gray-500 to-gray-700',       // Cloudy
      1183: 'from-cyan-500 via-blue-700 to-gray-800',        // Light rain
      1195: 'from-indigo-900 via-gray-900 to-indigo-800',    // Heavy rain
    };
    return gradients[conditionCode] || 'from-blue-400 via-blue-500 to-blue-600';
  };

  const getIconAnimation = (conditionCode) => {
    const animations = {
      1000: 'animate-spin-slow',          // Sunny
      1003: 'animate-float',              // Partly cloudy
      1006: 'animate-pulse',              // Cloudy
      1183: 'animate-bounce-subtle',      // Light rain
      1195: 'animate-bounce-subtle',      // Heavy rain
    };
    return animations[conditionCode] || 'animate-float';
  };

  // Weather-themed highlights
  const detailedConditionEmoji = (code) => {
    if ([1210, 1225].includes(code)) return '❄️';
    if (code === 1183 || code === 1195) return '💧';
    if (code === 1000) return '☀️';
    if (code === 1003) return '⛅';
    if (code === 1006) return '☁️';
    return '';
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-float { animation: float 3.3s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 1.8s ease-in-out infinite; }
      `}</style>
      
      <Card className="relative overflow-hidden transition-all duration-500 hover:shadow-3xl rounded-3xl group bg-transparent">
        {/* Glassmorphism gradient background */}
        <div
          className={`absolute inset-0 
            bg-gradient-to-br ${getBackgroundGradient(current.condition.code)} 
            opacity-20 group-hover:opacity-30 pointer-events-none transition-opacity duration-500`}
        />
        {/* Subtle animated blur ellipses */}
        <div className="absolute -top-8 -right-12 w-48 h-48 bg-pink-300/10 rounded-full blur-3xl pointer-events-none hidden md:block" />
        <div className="absolute -bottom-8 -left-12 w-48 h-48 bg-blue-300/10 rounded-full blur-3xl pointer-events-none hidden md:block" />

        <CardContent className="relative z-10 p-6 sm:p-10">
          {/* Location */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary animate-pulse flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-none tracking-tight truncate">{location.name}</h2>
              <span className="ml-2 px-3 py-0.5 text-xs bg-primary/10 rounded-lg text-primary font-semibold">{detailedConditionEmoji(current.condition.code)} {current.country}</span>
            </div>
            <p className="ml-1 text-muted-foreground text-sm  truncate">
              {location.region}
            </p>
          </div>

          {/* Current Time */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Last updated: {formatLocalTime(current.last_updated, location.tz_id)}
              </span>
            </span>
            <span className="ml-6 text-xs font-semibold tracking-widest">
              ({getTimezoneAbbreviation(location.tz_id)})
            </span>
          </div>

          {/* Main Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 mb-10">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="relative">
                <img
                  src={`https:${current.condition.icon}`}
                  alt={current.condition.text}
                  className={`w-20 h-20 sm:w-28 sm:h-28 shadow-xl bg-gradient-to-b from-primary/20 to-transparent rounded-full p-1.5 transition-transform duration-300 group-hover:scale-110 ${getIconAnimation(current.condition.code)}`}
                  loading="lazy"
                />
                {/* Subtle glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent blur-xl rounded-full opacity-25 -z-10" />
              </div>
              <div>
                <div className="text-5xl sm:text-6xl font-black bg-gradient-to-br from-primary via-blue-600 to-primary/70 bg-clip-text text-transparent">
                  {getTemperature(current.temp_c, current.temp_f)}
                </div>
                <div className="text-base sm:text-lg text-muted-foreground font-semibold mt-1">
                  Feels like {getTemperature(current.feelslike_c, current.feelslike_f)}
                </div>
              </div>
            </div>

            {/* Weather Condition */}
            <div className="text-right space-y-2 flex flex-col items-end">
              <Badge variant="secondary" className="text-base sm:text-lg px-4 py-1.5 tracking-tight shadow-sm bg-primary/10 border-primary/20 animate-pulse rounded-xl">
                {current.condition.text}
              </Badge>
              <div className="flex items-center gap-2 text-orange-500">
                <UVIndexTooltip uvIndex={current.uv} />
              </div>
            </div>
          </div>

          {/* Premium Weather Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className="bg-card/60 backdrop-blur-xl rounded-xl p-4 border border-border/20 transition-all duration-300 hover:bg-card/80 hover:drop-shadow-xl hover:scale-[1.03] group/card"
              aria-label="Wind Info"
            >
              <div className="flex items-center gap-3">
                <Wind className="w-6 h-6 text-blue-500 group-hover/card:animate-spin" />
                <div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="font-bold text-base truncate">
                    {getWindSpeed(current.wind_mph, current.wind_kph)}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{current.wind_dir}</span>
                </div>
              </div>
            </div>

            <div
              className="bg-card/60 backdrop-blur-xl rounded-xl p-4 border border-border/20 transition-all duration-300 hover:bg-card/80 hover:drop-shadow-xl hover:scale-[1.03] group/card"
              aria-label="Humidity Info"
            >
              <div className="flex items-center gap-3">
                <Droplets className="w-6 h-6 text-blue-400 group-hover/card:animate-bounce" />
                <div>
                  <div className="text-xs text-muted-foreground">Humidity</div>
                  <div className="font-bold text-base">{current.humidity}%</div>
                </div>
              </div>
            </div>

            <div
              className="bg-card/60 backdrop-blur-xl rounded-xl p-4 border border-border/20 transition-all duration-300 hover:bg-card/80 hover:drop-shadow-xl hover:scale-[1.03] group/card"
              aria-label="Visibility Info"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-green-500 group-hover/card:animate-pulse" />
                <div>
                  <div className="text-xs text-muted-foreground">Visibility</div>
                  <div className="font-bold text-base truncate">
                    {getVisibility(current.vis_km, current.vis_miles)}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-card/60 backdrop-blur-xl rounded-xl p-4 border border-border/20 transition-all duration-300 hover:bg-card/80 hover:drop-shadow-xl hover:scale-[1.03] group/card"
              aria-label="Pressure Info"
            >
              <div className="flex items-center gap-3">
                <Gauge className="w-6 h-6 text-purple-500 group-hover/card:animate-spin" />
                <div>
                  <div className="text-xs text-muted-foreground">Pressure</div>
                  <div className="font-bold text-base">{Math.round(current.pressure_mb)} mb</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default WeatherCard;
