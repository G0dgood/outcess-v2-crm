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
			<div 
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-8"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<h2 
					className="text-xl font-semibold dark:text-gray-100 mb-6"
					style={{ color: 'var(--text-primary)' }}
				>
					Platform Growth Trend
				</h2>
				<PlatformGrowthChart />
			</div>

			{/* Registered Businesses Table */}
			<div 
				className="dark:bg-gray-800 border dark:border-gray-700 p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<h2 
					className="text-xl font-semibold dark:text-gray-100 mb-6"
					style={{ color: 'var(--text-primary)' }}
				>
					Registered Businesses
				</h2>
				<RegisteredBusinessesTable />
			</div>
		</div>
	);
}

