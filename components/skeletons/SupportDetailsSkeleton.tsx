import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SupportDetailsSkeleton = () => {
  return (
    <div className="p-0 flex flex-col" style={{ height: 'calc(95vh - 100px)' }}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-[var(--radius)]" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-[var(--radius)]" />
          <Skeleton className="h-10 w-32 rounded-[var(--radius)]" />
        </div>
      </div>

      {/* Main Two-Column Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* Left Column: Chat Area Skeleton */}
        <div className="flex flex-col flex-1 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden shadow-md bg-white dark:bg-gray-800">
          <div className="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <Skeleton className="h-5 w-48" />
          </div>

          <div className="flex-1 p-5 space-y-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[70%] ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className={`space-y-2 ${i % 2 === 0 ? 'items-end' : ''}`}>
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className={`h-16 w-64 rounded-2xl ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-end gap-3">
              <Skeleton className="h-12 flex-1 rounded-[var(--radius)]" />
              <Skeleton className="h-12 w-16 rounded-[var(--radius)]" />
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Skeleton */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border dark:border-gray-700 rounded-[var(--radius)] p-6 shadow-sm space-y-4 bg-white dark:bg-gray-800">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportDetailsSkeleton;
