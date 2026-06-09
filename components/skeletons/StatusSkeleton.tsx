import React from 'react';
import Skeleton from '@/components/ui/skeleton';

interface StatusSkeletonProps {
	className?: string;
}

const StatusSkeleton: React.FC<StatusSkeletonProps> = ({ className = '' }) => {
	return (
		<div className={`w-full h-full ${className}`}>
			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<Skeleton className="h-8 w-32 mb-2" />
					<Skeleton className="h-4 w-96 max-w-full" />
				</div>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<Skeleton className="h-10 w-32" />
				</div>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y dark:divide-gray-700">
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th className="px-6 py-3 text-left">
									<Skeleton className="h-4 w-24" />
								</th>
								<th className="px-6 py-3 text-left">
									<Skeleton className="h-4 w-32" />
								</th>
								<th className="px-6 py-3 text-left">
									<Skeleton className="h-4 w-20" />
								</th>
								<th className="px-6 py-3 text-left">
									<Skeleton className="h-4 w-16" />
								</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{[1, 2, 3, 4, 5].map((i) => (
								<tr key={i} style={{ borderColor: 'var(--light-gray)' }}>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center gap-3">
											<Skeleton className="w-8 h-8 rounded-full" />
											<Skeleton className="h-4 w-32" />
										</div>
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-48" />
									</td>
									<td className="px-6 py-4">
										<Skeleton className="h-4 w-24" />
									</td>
									<td className="px-6 py-4">
										<div className="flex gap-2">
											<Skeleton className="h-8 w-8 rounded" />
											<Skeleton className="h-8 w-8 rounded" />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default StatusSkeleton;
