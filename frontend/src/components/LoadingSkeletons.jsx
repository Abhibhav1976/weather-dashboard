import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export const WeatherCardSkeleton = () => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-8">
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-5 h-5 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-16 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-24 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ForecastCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        
        {/* Daily forecast items */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const QuickStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-l-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const SearchSkeleton = () => (
  <div className="w-full max-w-md mx-auto">
    <div className="relative">
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);