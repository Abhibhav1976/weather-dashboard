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
  
  const getTemperature = (tempC, tempF) => {
    return unit === 'celsius' ? `${Math.round(tempC)}°C` : `${Math.round(tempF)}°F`;
  };

  const getWindSpeed = (mph, kph) => {
    return unit === 'celsius' ? `${Math.round(kph)} km/h` : `${Math.round(mph)} mph`;
  };

  const getVisibility = (km, miles) => {
    return unit === 'celsius' ? `${Math.round(km)} km` : `${Math.round(miles)} mi`;
  };

  const getBackgroundGradient = (conditionCode) => {
    const gradients = {
      1000: 'from-yellow-400 via-orange-400 to-orange-500', // Sunny
      1003: 'from-blue-400 via-blue-500 to-blue-600', // Partly cloudy
      1006: 'from-gray-400 via-gray-500 to-gray-600', // Cloudy
      1183: 'from-gray-600 via-blue-700 to-gray-800', // Light rain
      1195: 'from-gray-700 via-gray-800 to-gray-900', // Heavy rain
    };
    return gradients[conditionCode] || 'from-blue-400 via-blue-500 to-blue-600';
  };

  // Weather icon animation keyframes
  const getIconAnimation = (conditionCode) => {
    const animations = {
      1000: 'animate-spin-slow', // Sunny - slow rotation
      1003: 'animate-float', // Partly cloudy - floating
      1006: 'animate-pulse', // Cloudy - pulsing
      1183: 'animate-bounce-subtle', // Light rain - subtle bounce
      1195: 'animate-bounce-subtle', // Heavy rain - subtle bounce
    };
    return animations[conditionCode] || 'animate-float';
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
      
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(current.condition.code)} opacity-10 group-hover:opacity-15 transition-opacity duration-300`} />
        
        <CardContent className="relative p-4 sm:p-8">
          {/* Location Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {location.name}
                </h2>
                <p className="text-muted-foreground text-sm truncate">
                  {location.region}, {location.country}
                </p>
              </div>
            </div>
          </div>

          {/* Current Time with Local Timezone */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                Last updated: {formatLocalTime(current.last_updated, location.tz_id)}
              </span>
            </div>
            <div className="text-xs ml-6 sm:ml-2">
              ({getTimezoneAbbreviation(location.tz_id)} Local Time)
            </div>
          </div>

          {/* Main Weather Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={`https:${current.condition.icon}`}
                  alt={current.condition.text}
                  className={`w-16 h-16 sm:w-20 sm:h-20 transform transition-transform duration-300 group-hover:scale-110 ${getIconAnimation(current.condition.code)}`}
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl opacity-50 -z-10" />
              </div>
              
              <div className="min-w-0">
                <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                  {getTemperature(current.temp_c, current.temp_f)}
                </div>
                <div className="text-base sm:text-lg text-muted-foreground mt-1">
                  Feels like {getTemperature(current.feelslike_c, current.feelslike_f)}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-2">
              <Badge variant="secondary" className="text-sm sm:text-base px-3 py-1 mb-2 animate-pulse">
                {current.condition.text}
              </Badge>
              <div className="flex items-center gap-1 text-orange-500">
                <UVIndexTooltip uvIndex={current.uv} />
              </div>
            </div>
          </div>

          {/* Weather Details Grid - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:bg-card/70 hover:shadow-md hover:scale-105 group/card">
              <div className="flex items-center gap-2 sm:gap-3">
                <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover/card:animate-spin flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Wind</div>
                  <div className="font-semibold text-sm sm:text-base truncate">
                    {getWindSpeed(current.wind_mph, current.wind_kph)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {current.wind_dir}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:bg-card/70 hover:shadow-md hover:scale-105 group/card">
              <div className="flex items-center gap-2 sm:gap-3">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover/card:animate-bounce flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Humidity</div>
                  <div className="font-semibold text-sm sm:text-base">{current.humidity}%</div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:bg-card/70 hover:shadow-md hover:scale-105 group/card">
              <div className="flex items-center gap-2 sm:gap-3">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover/card:animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Visibility</div>
                  <div className="font-semibold text-sm sm:text-base truncate">
                    {getVisibility(current.vis_km, current.vis_miles)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 border transition-all duration-200 hover:bg-card/70 hover:shadow-md hover:scale-105 group/card">
              <div className="flex items-center gap-2 sm:gap-3">
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 group-hover/card:animate-spin flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground">Pressure</div>
                  <div className="font-semibold text-sm sm:text-base">
                    {Math.round(current.pressure_mb)} mb
                  </div>
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