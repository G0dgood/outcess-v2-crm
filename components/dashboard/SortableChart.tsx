'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import type { Chart } from '@/contexts/SetupContext';
import type { ChartDataItem } from './charts/types';
import {
	PieChart,
	DoughnutChart,
	BarChart,
	LineChart,
	PolarAreaChart,
	RadarChart,
	ScatterChart,
	BubbleChart,
} from './charts';

interface SortableChartProps {
	chart: Chart;
	onRemoveChart: (chartId: string) => void;
	onEditChart: (chartId: string) => void;
	generateChartData: (dataSource: string | string[], chartColor?: string, colors?: Record<string, string>) => ChartDataItem[];
}

export const SortableChart: React.FC<SortableChartProps> = ({ 
	chart, 
	onRemoveChart, 
	onEditChart, 
	generateChartData 
}) => {
	const chartData = generateChartData(chart.dataSource, chart.color, chart.colors);
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: chart.id });

	const sortableStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// Check if chart has no data (empty array or all values are 0)
	const hasNoData = chartData.length === 0 || chartData.every(item => item.value === 0);

	const renderChart = () => {
		switch (chart.type) {
			case 'pie':
				return <PieChart data={chartData} />;
			case 'doughnut':
				return <DoughnutChart data={chartData} />;
			case 'bar':
				return <BarChart data={chartData} />;
			case 'line':
				return <LineChart data={chartData} />;
			case 'polarArea':
				return <PolarAreaChart data={chartData} />;
			case 'radar':
				return <RadarChart data={chartData} />;
			case 'scatter':
				return <ScatterChart data={chartData} />;
			case 'bubble':
				return <BubbleChart data={chartData} />;
			default:
				return <PieChart data={chartData} />;
		}
	};

	const showLegend = !hasNoData && ['pie', 'doughnut', 'polarArea', 'radar'].includes(chart.type);

	return (
		<div
			ref={setNodeRef}
			className="select-none"
			style={{
				...sortableStyle,
				backgroundColor: 'var(--accent-white)',
				border: `1px solid var(--light-gray)`,
			}}
		>
			{/* Chart Header */}
			<div
				className="flex justify-between items-center p-4 cursor-move"
				{...attributes}
				{...listeners}
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderBottom: `1px solid var(--light-gray)`,
				}}
			>
				<h3
					className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px]"
					style={{ color: 'var(--text-primary)' }}
				>
					{chart.title}
				</h3>
				<div className="flex items-center gap-3 justify-center z-20">
					<div onPointerDown={(e) => e.stopPropagation()}>
						<Dropdown
							label=""
							value={chart.timeRange}
							onChange={(value) => {
								// Update chart time range
								console.log('Update chart time range:', chart.id, value);
							}}
							options={[
								{ value: 'daily', label: 'Daily' },
								{ value: 'weekly', label: 'Weekly' },
								{ value: 'monthly', label: 'Monthly' },
							]}
							className="min-w-[100px]"
							inputClassName="h-8"
						/>
					</div>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEditChart(chart.id);
						}}
						onPointerDown={(e) => e.stopPropagation()}
						className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
						title="Edit chart"
					>
						<Icon name="Edit_duotone_line" size="sm" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onRemoveChart(chart.id);
						}}
						onPointerDown={(e) => e.stopPropagation()}
						className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
						title="Remove chart"
					>
						<Icon name="Trash_light" size="lg" className='mt-3' />
					</button>
				</div>
			</div>

			{/* Chart Content */}
			{hasNoData ? (
				<div className="p-6 h-80 flex items-center justify-center">
					<div className="flex flex-col items-center justify-center">
						<svg
							width="64"
							height="64"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="mb-4"
							style={{ color: 'var(--text-tertiary)' }}
						>
							<path
								d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M12 8V12M12 16H12.01"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<p
							className="font-inter text-sm font-medium"
							style={{ color: 'var(--text-tertiary)' }}
						>
							No data available
						</p>
						<p
							className="font-inter text-xs mt-1"
							style={{ color: 'var(--text-tertiary)' }}
						>
							Chart data will appear here
						</p>
					</div>
				</div>
			) : (
				<div className="p-6 h-80">
					<div className="flex items-center justify-center h-full">
						{renderChart()}

						{/* Legend - only show for circular charts */}
						{showLegend && (
							<div className="space-y-4 ml-8">
								{chartData.map((item, index) => (
									<div key={index} className="flex items-center gap-3">
										<div
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: item.color }}
										></div>
										<span
											className="font-inter text-sm whitespace-nowrap"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{item.label}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default SortableChart;

