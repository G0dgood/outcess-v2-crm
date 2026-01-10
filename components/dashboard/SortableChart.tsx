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
	canEdit?: boolean;
	canDelete?: boolean;
}

export const SortableChart: React.FC<SortableChartProps> = ({
	chart,
	onRemoveChart,
	onEditChart,
	generateChartData,
	canEdit = true,
	canDelete = true,
}) => {
	const chartData = generateChartData(chart.dataSource, chart.color, chart.colors);
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: chart.id, disabled: !canEdit });

	const sortableStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// Always render chart, even if values are zero

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

	const showLegend = ['pie', 'doughnut', 'polarArea', 'radar', 'scatter', 'bubble', 'bar', 'line'].includes(chart.type);

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
				suppressHydrationWarning
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderBottom: `1px solid var(--light-gray)`,
				}}
			>
				<h3
					className="font-inter font-medium text-[14px] leading-5 tracking-[-0.5px]"
					style={{ color: 'var(--text-primary)' }}
				>
					{chart.title}
				</h3>
				<div className="flex items-center gap-3 justify-center z-20">
					<div onPointerDown={(e) => e.stopPropagation()}>
						<Dropdown
							label=""
							value={chart.timeRange}
							onChange={(_value) => {
								// Update chart time range 
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
					{canEdit && (
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
					)}
					{canDelete && (
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
					)}
				</div>
			</div>

			{/* Chart Content */}
			<div className="p-6 h-80">
				<div className="flex items-center justify-center h-full">
					{renderChart()}

					{/* Legend - only show for circular charts */}
					{showLegend && (
						<div className="space-y-4 ml-8">
							{chartData?.map((item, index) => (
								<div key={index} className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: item.color }}
									></div>
									<span
										className="font-inter text-sm whitespace-nowrap"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{item?.label}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SortableChart;
