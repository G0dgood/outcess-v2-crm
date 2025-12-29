import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessDetailSkeleton = () => {
    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
                <Skeleton className="h-8 w-48" />
            </div>

            {/* Tabs and Deactivate Button */}
            <div 
                className="flex items-center justify-between mb-6 border-b dark:border-gray-700" 
                style={{ borderColor: 'var(--light-gray)' }}
            >
                <div className="flex items-center gap-6 pb-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-40 mb-4" />
            </div>

            {/* Overview Content Skeleton (Grid of 4 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="dark:bg-gray-800 border dark:border-gray-700 p-6"
                        style={{
                            backgroundColor: 'var(--accent-white)',
                            borderColor: 'var(--light-gray)'
                        }}
                    >
                        <Skeleton className="h-6 w-40 mb-4" />
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessDetailSkeleton;
