import React from 'react';
import Skeleton from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
	return (
		<div className="w-full space-y-8 animate-in fade-in duration-500">
			{/* Header Skeleton */}
			<div className="flex justify-between items-center mb-8">
				<Skeleton className="h-8 w-48 bg-gray-200 dark:bg-slate-700" />
				<div className="flex gap-3">
					<Skeleton className="h-9 w-32 bg-gray-200 dark:bg-slate-700" />
					<Skeleton className="h-9 w-24 bg-gray-200 dark:bg-slate-700" />
					<Skeleton className="h-9 w-32 bg-gray-200 dark:bg-slate-700" />
				</div>
			</div>

			{/* Widgets Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{[1, 2, 3].map((i) => (
					<div 
						key={i} 
						className="p-6 rounded-[var(--radius)] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex justify-between items-start mb-4">
							<Skeleton className="h-5 w-32 bg-gray-200 dark:bg-slate-700" />
							<Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700" />
						</div>
						<Skeleton className="h-10 w-20 mb-2 bg-gray-200 dark:bg-slate-700" />
						<div className="flex items-center gap-2 mt-4">
							<Skeleton className="h-4 w-16 bg-gray-200 dark:bg-slate-700" />
							<Skeleton className="h-4 w-24 bg-gray-200 dark:bg-slate-700" />
						</div>
					</div>
				))}
			</div>

			{/* Charts Skeleton */}
			<div 
				className="dark:bg-slate-800 border dark:border-slate-700 p-6 bg-white rounded-[var(--radius)] border-gray-200"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<div 
							key={i} 
							className="p-4 border border-gray-200 dark:border-slate-700 rounded-[var(--radius)]"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<div className="flex justify-between items-center mb-6">
								<Skeleton className="h-6 w-40 bg-gray-200 dark:bg-slate-700" />
								<Skeleton className="h-8 w-8 rounded-md bg-gray-200 dark:bg-slate-700" />
							</div>
							<div className="space-y-4">
								<div className="flex items-end gap-2 h-48">
									{[1, 2, 3, 4, 5, 6, 7].map((bar) => (
										<Skeleton 
											key={bar} 
											className="w-full rounded-t-sm bg-gray-200 dark:bg-slate-700" 
											style={{ height: `${Math.random() * 80 + 20}%` }} 
										/>
									))}
								</div>
								<div className="flex justify-between mt-4">
									<Skeleton className="h-3 w-12 bg-gray-200 dark:bg-slate-700" />
									<Skeleton className="h-3 w-12 bg-gray-200 dark:bg-slate-700" />
									<Skeleton className="h-3 w-12 bg-gray-200 dark:bg-slate-700" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default DashboardSkeleton;
