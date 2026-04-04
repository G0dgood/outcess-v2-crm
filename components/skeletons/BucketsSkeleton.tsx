import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BucketsSkeleton = () => {
	return (
		<div className="flex flex-col lg:flex-row gap-6 min-h-[600px] animate-in fade-in duration-500">
			{/* Left: Buckets Sidebar Skeleton */}
			<div
				className="w-full lg:w-72 shrink-0 dark:bg-gray-800 border dark:border-gray-700 flex flex-col rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
			>
				<div className="p-5 border-b dark:border-gray-700 flex items-center justify-between" style={{ borderColor: 'var(--light-gray)' }}>
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-8 rounded-full" />
				</div>
				<div className="flex-1 p-2 space-y-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="p-3 border border-transparent flex items-center justify-between">
							<div className="flex items-center gap-3 flex-1">
								<Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
								<div className="flex flex-col gap-1.5 flex-1">
									<Skeleton className="h-3 w-2/3" />
									<Skeleton className="h-2 w-1/3" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Center: Dispositions Skeleton */}
			<div className="flex-1 flex flex-col gap-6">
				<div
					className="flex-1 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden flex flex-col"
					style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				>
					<div className="p-6 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10" style={{ borderColor: 'var(--light-gray)' }}>
						<div className="space-y-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-3 w-64" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-9 w-32" />
							<Skeleton className="h-9 w-32" />
						</div>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="p-4 border dark:border-gray-700 rounded-[var(--radius)] bg-white dark:bg-gray-900/50"
									style={{ borderColor: 'var(--light-gray)' }}
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-2">
											<Skeleton className="w-3 h-3 rounded-sm" />
											<Skeleton className="h-3 w-24" />
										</div>
										<div className="flex gap-1">
											<Skeleton className="w-6 h-6 rounded" />
											<Skeleton className="w-6 h-6 rounded" />
										</div>
									</div>
									<div className="flex gap-2">
										<Skeleton className="h-4 w-16 rounded-full" />
										<Skeleton className="h-4 w-20 rounded-full" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Right: Live Preview Skeleton */}
			<div
				className="w-full lg:w-80 shrink-0 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
			>
				<div className="p-6 border-b dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<Skeleton className="h-3 w-24 mb-4" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="p-6 space-y-8">
					<div className="flex justify-center">
						<Skeleton className="h-40 w-40 rounded-full" />
					</div>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<Skeleton className="w-2.5 h-2.5 rounded-sm" />
									<Skeleton className="h-3 w-20" />
								</div>
								<Skeleton className="h-3 w-8" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BucketsSkeleton;
