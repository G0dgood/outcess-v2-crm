import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSideNavSkeleton = () => {
	return (
		<nav
			className="w-64 border-r dark:border-gray-700 hidden md:block relative h-auto p-4 transition-colors duration-300"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="space-y-2">
				{[...Array(9)].map((_, i) => (
					<div key={i} className="flex items-center gap-3 px-4 py-3">
						<Skeleton className="w-5 h-5 rounded flex-shrink-0" />
						<Skeleton className="h-5 w-32 rounded flex-1" />
					</div>
				))}
			</div>
			{/* Separator */}
			<div
				className="border-t dark:border-gray-700 my-4"
				style={{ borderColor: 'var(--light-gray)' }}
			></div>
		</nav>
	);
};

export default DashboardSideNavSkeleton;
