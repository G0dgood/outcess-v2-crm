'use client';

import React, { useMemo } from 'react';
import SummaryCards from '@/components/ui/SummaryCards';
import PlatformGrowthChart from '@/components/features/dashboard/PlatformGrowthChart';
import RegisteredBusinessesTable from '@/components/ui/RegisteredBusinessesTable';
import PendingReactivationsTable from '@/components/ui/PendingReactivationsTable';
import { useGetSuperAdminDashboardStatsQuery } from '@/store/services/companyApi';
import { BackpackIcon, BarChartIcon, PersonIcon } from '@radix-ui/react-icons';

export default function AdminDashboardPage() {
	const { data: statsData, isLoading } = useGetSuperAdminDashboardStatsQuery();



	const summaryCards = useMemo(() => {
		if (!statsData?.stats) return undefined;

		const { totalBusinesses, totalActiveBusinesses, totalUsers } = statsData.stats;

		return [
			{
				title: 'Total Businesses',
				value: totalBusinesses,
				icon: <BackpackIcon className="w-8 h-8" />,
				iconBgColor: 'bg-blue-50',
				iconColor: 'text-blue-600',
			},
			{
				title: 'Total Active Businesses',
				value: totalActiveBusinesses,
				icon: <BarChartIcon className="w-8 h-8" />,
				iconBgColor: 'bg-green-50',
				iconColor: 'text-green-600',
			},
			{
				title: 'Total Users',
				value: totalUsers,
				icon: <PersonIcon className="w-8 h-8" />,
				iconBgColor: 'bg-purple-50',
				iconColor: 'text-purple-600',
			},
		];
	}, [statsData]);

	return (
		<div className="">
			{/* Summary Cards */}
			<div className="mb-8">
				<SummaryCards cards={summaryCards} isLoading={isLoading} />
			</div>



			{/* Platform Growth Trend Chart */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-8"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<h2
					className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100 mb-6"
					style={{ color: 'var(--text-primary)' }}
				>
					Platform Growth Trend
				</h2>
				<PlatformGrowthChart data={statsData?.stats?.growthData} isLoading={isLoading} />
			</div>
			{/* Pending Reactivation Requests */}
			<PendingReactivationsTable />
			{/* Registered Businesses Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<h2
					className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100 mb-6"
					style={{ color: 'var(--text-primary)' }}
				>
					Registered Businesses
				</h2>
				<RegisteredBusinessesTable />
			</div>
		</div>
	);
}

