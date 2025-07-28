import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CloudOff, 
  Wifi, 
  Search, 
  AlertTriangle, 
  RefreshCw,
  MapPin
} from 'lucide-react';

const ErrorDisplay = ({ 
  type = 'general', 
  message, 
  onRetry, 
  onSearch,
  searchQuery 
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'city_not_found':
        return {
          icon: <MapPin className="w-12 h-12 text-orange-500" />,
          title: 'City Not Found',
          description: searchQuery 
            ? `We couldn't find weather data for "${searchQuery}". Please check the spelling or try a different city.`
            : 'The city you searched for could not be found.',
          actionText: 'Try Another City',
          actionIcon: <Search className="w-4 h-4" />,
          bgColor: 'from-orange-50 to-yellow-50',
          borderColor: 'border-orange-200'
        };
      
      case 'network_error':
        return {
          icon: <Wifi className="w-12 h-12 text-red-500" />,
          title: 'Connection Problem',
          description: 'Unable to connect to weather services. Please check your internet connection and try again.',
          actionText: 'Retry',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          bgColor: 'from-red-50 to-pink-50',
          borderColor: 'border-red-200'
        };
      
      case 'api_error':
        return {
          icon: <CloudOff className="w-12 h-12 text-blue-500" />,
          title: 'Weather Service Unavailable',
          description: 'The weather service is temporarily unavailable. Please try again in a few moments.',
          actionText: 'Retry',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200'
        };
      
      case 'invalid_input':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          title: 'Invalid Search',
          description: 'Please enter a valid city name with at least 2 characters.',
          actionText: 'Search Again',
          actionIcon: <Search className="w-4 h-4" />,
          bgColor: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-200'
        };
      
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-gray-500" />,
          title: 'Something Went Wrong',
          description: message || 'An unexpected error occurred. Please try again.',
          actionText: 'Retry',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          bgColor: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Card className={`${config.borderColor} border-2 bg-gradient-to-br ${config.bgColor} transition-all duration-300 hover:shadow-lg`}>
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon with subtle animation */}
          <div className="animate-pulse">
            {config.icon}
          </div>

          {/* Error Content */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-xl font-semibold text-foreground">
              {config.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="flex items-center gap-2"
                variant="default"
              >
                {config.actionIcon}
                {config.actionText}
              </Button>
            )}
            
            {onSearch && (
              <Button 
                onClick={onSearch}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                New Search
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compact error for smaller spaces
export const CompactError = ({ message, onRetry }) => (
  <Alert className="border-red-200 bg-red-50">
    <AlertTriangle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">
      <div className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        {onRetry && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onRetry}
            className="h-6 px-2 text-red-600 hover:text-red-800 hover:bg-red-100"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);

export default ErrorDisplay;