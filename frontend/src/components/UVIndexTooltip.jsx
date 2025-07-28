import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info, Sun } from 'lucide-react';
import { Badge } from './ui/badge';

const UVIndexTooltip = ({ uvIndex, className = "" }) => {
  const getUVLevel = (uv) => {
    if (uv <= 2) return { level: 'Low', color: 'bg-green-500', description: 'No protection needed' };
    if (uv <= 5) return { level: 'Moderate', color: 'bg-yellow-500', description: 'Some protection required' };
    if (uv <= 7) return { level: 'High', color: 'bg-orange-500', description: 'Protection essential' };
    if (uv <= 10) return { level: 'Very High', color: 'bg-red-500', description: 'Extra protection needed' };
    return { level: 'Extreme', color: 'bg-purple-600', description: 'Avoid being outside' };
  };

  const uvData = getUVLevel(uvIndex);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 cursor-help ${className}`}>
            <Sun className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">UV {uvIndex}</span>
            <Info className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${uvData.color}`} />
              <span className="font-semibold">{uvData.level} ({uvIndex})</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {uvData.description}
            </p>
            
            <div className="space-y-2 text-xs">
              <div className="font-medium">UV Index Scale:</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-green-500" />
                  <span>0-2: Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-yellow-500" />
                  <span>3-5: Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-orange-500" />
                  <span>6-7: High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-red-500" />
                  <span>8-10: Very High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-purple-600" />
                  <span>11+: Extreme</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UVIndexTooltip;