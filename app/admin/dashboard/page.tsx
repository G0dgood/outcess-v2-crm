'use client';

import React from 'react';
import SummaryCards from '@/components/ui/SummaryCards';
import PlatformGrowthChart from '@/components/ui/PlatformGrowthChart';
import RegisteredBusinessesTable from '@/components/ui/RegisteredBusinessesTable';

export default function AdminDashboardPage() {
	return (
		<div className="">
			{/* Summary Cards */}
			<div className="mb-8">
				<SummaryCards />
			</div>

			{/* Platform Growth Trend Chart */}
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 mb-8">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Platform Growth Trend</h2>
				<PlatformGrowthChart />
			</div>

			{/* Registered Businesses Table */}
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Registered Businesses</h2>
				<RegisteredBusinessesTable />
			</div>
		</div>
	);
}

