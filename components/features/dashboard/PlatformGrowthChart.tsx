'use client';

import React from 'react';
import Skeleton from '@/components/ui/skeleton';

interface MonthlyData {
	month: string;
	businesses: number;
	users: number;
}

interface PlatformGrowthChartProps {
	data?: MonthlyData[];
	isLoading?: boolean;
}

const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({
	data,
	isLoading
}) => {
	if (!data && !isLoading) return null;

	const maxValue = Math.max(100, ...(data || []).map(d => Math.max(d.businesses, d.users)));
	const chartHeight = 300;
	const chartWidth = 1000;
	const barWidth = 25;
	const barGap = 8;
	const groupWidth = barWidth * 2 + barGap;
	const groupSpacing = 15;
	const startX = 60;
	const yAxisWidth = 40;
	const bottomPadding = 60;
	const topPadding = 20;

	const maxBarHeight = chartHeight - bottomPadding - topPadding;

	// Calculate positions for each month group
	const getXPosition = (index: number) => {
		return startX + yAxisWidth + index * (groupWidth + groupSpacing);
	};

	const getYPosition = (value: number) => {
		return topPadding + (maxValue - value) / maxValue * maxBarHeight;
	};

	const getBarHeight = (value: number) => {
		return (value / maxValue) * maxBarHeight;
	};

	if (isLoading) {
		return (
			<div className="w-full h-[300px] flex flex-col justify-end gap-4 p-4">
				<div className="flex items-end justify-between h-full gap-2">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="flex flex-col items-center flex-1 gap-2">
							<div className="flex items-end gap-1 w-full justify-center">
								<Skeleton className="w-3" style={{ height: `${Math.random() * 60 + 20}%` }} />
								<Skeleton className="w-3" style={{ height: `${Math.random() * 60 + 20}%` }} />
							</div>
							<Skeleton className="h-3 w-8" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-auto">
			<svg
				width={chartWidth}
				height={chartHeight}
				className="w-full"
				viewBox={`0 0 ${chartWidth} ${chartHeight}`}
				preserveAspectRatio="xMinYMin meet"
			>
				{/* Grid lines */}
				{[0, 20, 40, 60, 80, 100].map((v, index) => {
					const value = (v / 100) * maxValue;
					const y = topPadding + (maxValue - value) / maxValue * maxBarHeight;
					return (
						<g key={index}>
							<line
								x1={startX + yAxisWidth}
								y1={y}
								x2={chartWidth - 20}
								y2={y}
								stroke="#E5E7EB"
								strokeWidth="1"
								strokeDasharray="4 4"
							/>
							<text
								x={startX}
								y={y + 4}
								textAnchor="end"
								className="text-[8px] md:text-[10px] fill-gray-600"
								fontSize="12"
							>
								{Math.round(value)}
							</text>
						</g>
					);
				})}

				{/* Bars for each month */}
				{data?.map((item, index) => {
					const groupX = getXPosition(index);
					const businessesY = getYPosition(item.businesses);
					const usersY = getYPosition(item.users);
					const businessesHeight = getBarHeight(item.businesses);
					const usersHeight = getBarHeight(item.users);

					return (
						<g key={index}>
							{/* Businesses bar (reddish-pink) */}
							<rect
								x={groupX}
								y={businessesY}
								width={barWidth}
								height={businessesHeight}
								fill="#EC4899"
								rx="6"
							/>
							{/* Users bar (light blue) */}
							<rect
								x={groupX + barWidth + barGap}
								y={usersY}
								width={barWidth}
								height={usersHeight}
								fill="#60A5FA"
								rx="6"
							/>
							{/* Month label */}
							<text
								x={groupX + groupWidth / 2}
								y={chartHeight - 20}
								textAnchor="middle"
								className="text-[8px] md:text-[10px] fill-gray-600"
								fontSize="12"
							>
								{item.month}
							</text>
						</g>
					);
				})}
			</svg>

			{/* Legend */}
			<div className="flex items-center justify-center gap-6 mt-6">
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded bg-[#EC4899]"></div>
					<span className="text-[10px] md:text-[12px] text-gray-700">Businesses</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded bg-[#60A5FA]"></div>
					<span className="text-[10px] md:text-[12px] text-gray-700">Users</span>
				</div>
			</div>
		</div>
	);
};

export default PlatformGrowthChart;

