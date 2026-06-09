import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import BusinessProfileSkeleton from './BusinessProfileSkeleton';

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

            {/* Overview Content Skeleton */}
            <BusinessProfileSkeleton />
        </div>
    );
};

export default BusinessDetailSkeleton;
