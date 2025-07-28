import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, AlertTriangle, Activity } from 'lucide-react';
import weatherAPI from '../services/weatherApi';

const APIStatusIndicator = ({ status, onStatusChange }) => {
  const [apiHealth, setApiHealth] = useState(null);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const health = await weatherAPI.healthCheck();
        setApiHealth(health);
        setLastCheck(new Date());
        if (onStatusChange) {
          onStatusChange(health.status);
        }
      } catch (error) {
        setApiHealth({ status: 'error', error: error.message });
        setLastCheck(new Date());
        if (onStatusChange) {
          onStatusChange('error');
        }
      }
    };

    // Initial check
    checkAPIHealth();

    // Check every 30 seconds
    const interval = setInterval(checkAPIHealth, 30000);

    return () => clearInterval(interval);
  }, [onStatusChange]);

  const getStatusConfig = () => {
    const currentStatus = status || apiHealth?.status || 'unknown';
    
    switch (currentStatus) {
      case 'healthy':
        return {
          icon: <Wifi className="w-3 h-3" />,
          color: 'bg-green-500',
          variant: 'default',
          text: 'Online',
          pulse: false
        };
      case 'degraded':
        return {
          icon: <AlertTriangle className="w-3 h-3" />,
          color: 'bg-yellow-500',
          variant: 'secondary',
          text: 'Limited',
          pulse: true
        };
      case 'error':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          color: 'bg-red-500',
          variant: 'destructive',
          text: 'Offline',
          pulse: true
        };
      default:
        return {
          icon: <Activity className="w-3 h-3" />,
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Checking',
          pulse: true
        };
    }
  };

  const statusConfig = getStatusConfig();

  const getTooltipContent = () => {
    const currentStatus = status || apiHealth?.status || 'unknown';
    
    return (
      <div className="space-y-2 max-w-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
          <span className="font-semibold">
            API Status: {statusConfig.text}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {currentStatus === 'healthy' && (
            <div>
              <p>✅ Weather API is responding normally</p>
              <p>🕒 All services operational</p>
            </div>
          )}
          
          {currentStatus === 'degraded' && (
            <div>
              <p>⚠️ Some API features may be limited</p>
              <p>🔄 Service is partially available</p>
            </div>
          )}
          
          {currentStatus === 'error' && (
            <div>
              <p>❌ Cannot connect to weather services</p>
              <p>📶 Check your internet connection</p>
            </div>
          )}
          
          {currentStatus === 'unknown' && (
            <div>
              <p>🔄 Checking API status...</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>Last checked: {lastCheck.toLocaleTimeString()}</p>
          {apiHealth?.weather_api && (
            <p>WeatherAPI: {apiHealth.weather_api}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={statusConfig.variant} 
            className={`flex items-center gap-1 text-xs cursor-help ${
              statusConfig.pulse ? 'animate-pulse' : ''
            }`}
          >
            {statusConfig.icon}
            <span className="hidden sm:inline">{statusConfig.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default APIStatusIndicator;