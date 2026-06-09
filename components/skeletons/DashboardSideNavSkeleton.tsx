import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

const DashboardSideNavSkeleton = () => {
	return (
		<nav
			id="side-nav"
			className="dark:bg-gray-900 w-64 border-r dark:border-gray-700 md:flex flex-col relative h-full transition-all duration-300"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
				<div className="mb-6 flex items-center px-4 gap-2">
					<Skeleton className="h-8 w-8 rounded" />
					<Skeleton className="h-5 w-28 rounded" />
				</div>

				<div className="space-y-2">
					{Array.from({ length: 11 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 px-4 py-3">
							<Skeleton className="w-5 h-5 rounded shrink-0" />
							<Skeleton className="h-5 w-32 rounded flex-1" />
						</div>
					))}

					<div
						className="ml-4 mt-1 space-y-1 border-l-2 pl-2"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="flex items-center gap-3 px-4 py-2">
								<Skeleton className="w-4 h-4 rounded shrink-0" />
								<Skeleton className="h-4 w-24 rounded" />
							</div>
						))}
					</div>

					<div
						className="border-t dark:border-gray-700 my-4"
						style={{ borderColor: 'var(--light-gray)' }}
					></div>
				</div>
			</div>

			<div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--light-gray)' }}>
				<Skeleton className="w-8 h-8 rounded" />
			</div>
		</nav>
	);
};

export default DashboardSideNavSkeleton;
