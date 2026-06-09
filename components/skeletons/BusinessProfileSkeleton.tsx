import React from 'react';
import Skeleton from '@/components/ui/skeleton';

const BusinessProfileSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-[var(--radius)]"
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
    );
};

export default BusinessProfileSkeleton;
