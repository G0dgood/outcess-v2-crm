import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionSkeletonProps {
	className?: string;
}

const PermissionSkeleton: React.FC<PermissionSkeletonProps> = ({ className = '' }) => {
	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6 flex justify-between items-end">
				<div>
					<Skeleton className="h-8 w-32 mb-2" />
					<Skeleton className="h-4 w-96 max-w-full" />
				</div>
			</div>

			{/* Content: List of Role Accordions Skeleton */}
			<div className="space-y-4 pb-20">
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<div
							className="w-full px-6 py-4 flex justify-between items-center"
							style={{ backgroundColor: 'var(--accent-white)' }}
						>
							<div className="flex-1 flex items-center">
								<Skeleton className="h-6 w-48" />
							</div>

							<div className="flex items-center gap-4">
								<Skeleton className="h-9 w-20 rounded-[var(--radius)]" />
								<Skeleton className="h-5 w-5 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PermissionSkeleton;
