import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

interface GeneralSettingsSkeletonProps {
	className?: string;
}

const GeneralSettingsSkeleton: React.FC<GeneralSettingsSkeletonProps> = ({ className = '' }) => {
	return (
		<div className={`space-y-6 ${className}`}>
			<div>
				<Skeleton className="h-8 w-40 mb-2" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>

			{/* Tabs Skeleton */}
			<div className="flex gap-4 mb-6">
				<Skeleton className="h-10 w-28" />
				<Skeleton className="h-10 w-36" />
			</div>

			<div className="space-y-6">
				{/* Configuration Tab Skeleton */}
				<div
					className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)]"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center space-x-3">
						<Skeleton className="w-10 h-10 rounded-full" />
						<div>
							<Skeleton className="h-5 w-48 mb-2" />
							<Skeleton className="h-4 w-96 max-w-full" />
						</div>
					</div>
					<Skeleton className="h-12 w-24" />
				</div>
			</div>
		</div>
	);
};

export default GeneralSettingsSkeleton;
