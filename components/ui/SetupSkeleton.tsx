import React from 'react';
import { Skeleton } from './skeleton';

export const SetupSkeleton = () => {
 return (
  <div className="w-full h-[70vh]">
   <div className="mb-8 space-y-2">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-5 w-96" />
   </div>
   <div className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full rounded-[var(--radius)]" style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}>
    <div className="border-b dark:border-gray-700 mb-6 p-6 space-y-2" style={{ borderColor: 'var(--light-gray)' }}>
     <Skeleton className="h-7 w-56" />
     <Skeleton className="h-4 w-40" />
    </div>
    <div className="p-6">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-8">
       <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
       <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      </div>
      <div className="space-y-8">
       <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
       <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
};
