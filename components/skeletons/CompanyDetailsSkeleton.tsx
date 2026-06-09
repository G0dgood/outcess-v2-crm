import React from 'react';
import Skeleton from '@/components/ui/skeleton';

interface CompanyDetailsSkeletonProps {
    className?: string;
}

const CompanyDetailsSkeleton: React.FC<CompanyDetailsSkeletonProps> = ({ className = '' }) => {
    return (
        <div className={`w-full h-full pb-8 ${className}`}>
            {/* Header Skeleton */}
            <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-20" />
            </div>

            <div
                className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
                style={{
                    backgroundColor: 'var(--accent-white)',
                    borderColor: 'var(--light-gray)'
                }}
            >
                {/* Tabs Skeleton */}
                <div
                    className="mb-6 border-b dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                >
                    <div className="flex gap-8">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>

                {/* Form Fields Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>

                {/* Logo Upload Skeleton */}
                <div className="mt-6">
                    <Skeleton className="h-5 w-20 mb-2" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailsSkeleton;
