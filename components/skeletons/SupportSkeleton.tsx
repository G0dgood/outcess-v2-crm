import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SupportSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between mb-6">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Filters & Search Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="w-full max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg hidden sm:block" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b flex items-center gap-10 overflow-x-auto no-scrollbar pb-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 mb-2" />
        ))}
      </div>

      {/* Ticket List Skeleton (Row Style) */}
      <div className="flex flex-col border rounded-xl overflow-hidden dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0 dark:border-gray-700">
            {/* Left section skeleton */}
            <div className="flex items-center gap-4 flex-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32 opacity-60" />
              </div>
            </div>

            {/* Middle section skeleton */}
            <div className="hidden md:flex items-center gap-12 lg:gap-16 flex-1 justify-center">
              {/* User skeleton */}
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 w-20 opacity-50" />
              </div>
              
              {/* Date skeleton */}
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 w-16 opacity-50" />
              </div>

              {/* Priority skeleton */}
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 w-10 opacity-50" />
              </div>
            </div>

            {/* Right section skeleton */}
            <div className="ml-4 shrink-0">
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportSkeleton;
