import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RolesSkeletonProps {
	className?: string;
}

const RolesSkeleton: React.FC<RolesSkeletonProps> = ({ className = '' }) => {
	return (
		<div className={`w-full h-full ${className}`}>
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<Skeleton className="h-8 w-32 mb-2" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="flex justify-end">
					<Skeleton className="h-9 w-40" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="dark:bg-gray-800 border dark:border-gray-700 p-6 rounded-lg"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<Skeleton className="h-6 w-1/2 mb-3" />
						<Skeleton className="h-4 w-1/4" />
					</div>
				))}
			</div>
		</div>
	);
};

export default RolesSkeleton;
