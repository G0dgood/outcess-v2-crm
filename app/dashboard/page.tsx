'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import AddChartModal from '@/components/ui/AddChartModal';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WidgetCardProps {
	title: string;
	value: string | number;
	onMenuClick?: () => void;
}

interface SortableChartProps {
	chart: {
		id: string;
		title: string;
		type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
		dataSource: 'dispositions' | 'callOutcomes' | 'custom';
		timeRange: 'daily' | 'weekly' | 'monthly';
		color?: string;
		position: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	};
	pieChartData: Array<{
		label: string;
		value: number;
		color: string;
	}>;
	onRemoveChart: (chartId: string) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, value, onMenuClick }) => {
	return (
		<div className="bg-white border border-gray-200 p-6 relative">
			<div className="flex justify-between items-start mb-4">
				<h3 className="font-lato font-normal text-[18px] leading-[150%] text-[#6D7280]">{title}</h3>
				<button
					onClick={onMenuClick}
					className="text-gray-400 hover:text-gray-600 transition-colors"
					title="Widget options"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
					</svg>
				</button>
			</div>
			<div className="text-3xl font-bold text-gray-900">{value}</div>
		</div>
	);
};

interface PieChartProps {
	data: Array<{
		label: string;
		value: number;
		color: string;
	}>;
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	let cumulativePercentage = 0;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
				{data.map((item, index) => {
					const percentage = (item.value / total) * 100;
					const startAngle = cumulativePercentage * 3.6;
					const endAngle = (cumulativePercentage + percentage) * 3.6;

					const radius = 40;
					const centerX = 50;
					const centerY = 50;

					const startAngleRad = (startAngle * Math.PI) / 180;
					const endAngleRad = (endAngle * Math.PI) / 180;

					const x1 = centerX + radius * Math.cos(startAngleRad);
					const y1 = centerY + radius * Math.sin(startAngleRad);
					const x2 = centerX + radius * Math.cos(endAngleRad);
					const y2 = centerY + radius * Math.sin(endAngleRad);

					const largeArcFlag = percentage > 50 ? 1 : 0;

					const pathData = [
						`M ${centerX} ${centerY}`,
						`L ${x1} ${y1}`,
						`A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
						'Z'
					].join(' ');

					cumulativePercentage += percentage;

					return (
						<path
							key={index}
							d={pathData}
							fill={item.color}
							stroke="white"
							strokeWidth="1"
						/>
					);
				})}
			</svg>
		</div>
	);
};

const DoughnutChart: React.FC<PieChartProps> = ({ data }) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	let cumulativePercentage = 0;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
				{data.map((item, index) => {
					const percentage = (item.value / total) * 100;
					const startAngle = cumulativePercentage * 3.6;
					const endAngle = (cumulativePercentage + percentage) * 3.6;

					const outerRadius = 40;
					const innerRadius = 20;
					const centerX = 50;
					const centerY = 50;

					const startAngleRad = (startAngle * Math.PI) / 180;
					const endAngleRad = (endAngle * Math.PI) / 180;

					const x1 = centerX + outerRadius * Math.cos(startAngleRad);
					const y1 = centerY + outerRadius * Math.sin(startAngleRad);
					const x2 = centerX + outerRadius * Math.cos(endAngleRad);
					const y2 = centerY + outerRadius * Math.sin(endAngleRad);

					const x3 = centerX + innerRadius * Math.cos(endAngleRad);
					const y3 = centerY + innerRadius * Math.sin(endAngleRad);
					const x4 = centerX + innerRadius * Math.cos(startAngleRad);
					const y4 = centerY + innerRadius * Math.sin(startAngleRad);

					const largeArcFlag = percentage > 50 ? 1 : 0;

					const pathData = [
						`M ${x1} ${y1}`,
						`A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
						`L ${x3} ${y3}`,
						`A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
						'Z'
					].join(' ');

					cumulativePercentage += percentage;

					return (
						<path
							key={index}
							d={pathData}
							fill={item.color}
							stroke="white"
							strokeWidth="1"
						/>
					);
				})}
			</svg>
		</div>
	);
};

const BarChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const barWidth = 60;
	const barSpacing = 20;
	const chartHeight = 200;
	const chartWidth = data.length * (barWidth + barSpacing);

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
				{data.map((item, index) => {
					const barHeight = (item.value / maxValue) * chartHeight;
					const x = index * (barWidth + barSpacing) + barSpacing;
					const y = chartHeight - barHeight;

					return (
						<g key={index}>
							<rect
								x={x}
								y={y}
								width={barWidth}
								height={barHeight}
								fill={item.color}
								rx="4"
							/>
							<text
								x={x + barWidth / 2}
								y={chartHeight + 15}
								textAnchor="middle"
								className="text-xs fill-gray-600"
							>
								{item.label}
							</text>
							<text
								x={x + barWidth / 2}
								y={y - 5}
								textAnchor="middle"
								className="text-xs fill-gray-800 font-medium"
							>
								{item.value}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
};

const LineChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const chartHeight = 200;
	const chartWidth = 300;
	const pointSpacing = chartWidth / (data.length - 1);

	const points = data.map((item, index) => {
		const x = index * pointSpacing;
		const y = chartHeight - (item.value / maxValue) * chartHeight;
		return `${x},${y}`;
	}).join(' ');

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
				{/* Grid lines */}
				{Array.from({ length: 5 }, (_, i) => (
					<line
						key={i}
						x1="0"
						y1={(chartHeight / 4) * i}
						x2={chartWidth}
						y2={(chartHeight / 4) * i}
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}

				{/* Line */}
				<polyline
					points={points}
					fill="none"
					stroke="#3b82f6"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				{/* Points */}
				{data.map((item, index) => {
					const x = index * pointSpacing;
					const y = chartHeight - (item.value / maxValue) * chartHeight;

					return (
						<g key={index}>
							<circle
								cx={x}
								cy={y}
								r="6"
								fill="#3b82f6"
								stroke="white"
								strokeWidth="2"
							/>
							<text
								x={x}
								y={chartHeight + 15}
								textAnchor="middle"
								className="text-xs fill-gray-600"
							>
								{item.label}
							</text>
							<text
								x={x}
								y={y - 10}
								textAnchor="middle"
								className="text-xs fill-gray-800 font-medium"
							>
								{item.value}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
};

const PolarAreaChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const centerX = 50;
	const centerY = 50;
	const maxRadius = 40;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-64 h-64" viewBox="0 0 100 100">
				{data.map((item, index) => {
					const angle = (index / data.length) * 2 * Math.PI;
					const radius = (item.value / maxValue) * maxRadius;
					const nextAngle = ((index + 1) / data.length) * 2 * Math.PI;

					const x1 = centerX + radius * Math.cos(angle);
					const y1 = centerY + radius * Math.sin(angle);
					const x2 = centerX + radius * Math.cos(nextAngle);
					const y2 = centerY + radius * Math.sin(nextAngle);

					const pathData = [
						`M ${centerX} ${centerY}`,
						`L ${x1} ${y1}`,
						`A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
						'Z'
					].join(' ');

					return (
						<path
							key={index}
							d={pathData}
							fill={item.color}
							stroke="white"
							strokeWidth="1"
							opacity="0.8"
						/>
					);
				})}
			</svg>
		</div>
	);
};

const RadarChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const centerX = 50;
	const centerY = 50;
	const maxRadius = 40;
	const sides = data.length;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-64 h-64" viewBox="0 0 100 100">
				{/* Grid circles */}
				{[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
					<circle
						key={i}
						cx={centerX}
						cy={centerY}
						r={maxRadius * scale}
						fill="none"
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}

				{/* Grid lines */}
				{data.map((_, index) => {
					const angle = (index / sides) * 2 * Math.PI;
					const x = centerX + maxRadius * Math.cos(angle);
					const y = centerY + maxRadius * Math.sin(angle);

					return (
						<line
							key={index}
							x1={centerX}
							y1={centerY}
							x2={x}
							y2={y}
							stroke="#e5e7eb"
							strokeWidth="1"
						/>
					);
				})}

				{/* Data polygon */}
				<polygon
					points={data.map((item, index) => {
						const angle = (index / sides) * 2 * Math.PI;
						const radius = (item.value / maxValue) * maxRadius;
						const x = centerX + radius * Math.cos(angle);
						const y = centerY + radius * Math.sin(angle);
						return `${x},${y}`;
					}).join(' ')}
					fill="#3b82f6"
					fillOpacity="0.3"
					stroke="#3b82f6"
					strokeWidth="2"
				/>

				{/* Data points */}
				{data.map((item, index) => {
					const angle = (index / sides) * 2 * Math.PI;
					const radius = (item.value / maxValue) * maxRadius;
					const x = centerX + radius * Math.cos(angle);
					const y = centerY + radius * Math.sin(angle);

					return (
						<g key={index}>
							<circle
								cx={x}
								cy={y}
								r="3"
								fill="#3b82f6"
								stroke="white"
								strokeWidth="1"
							/>
							<text
								x={x + (x > centerX ? 5 : -5)}
								y={y + (y > centerY ? 5 : -5)}
								textAnchor={x > centerX ? 'start' : 'end'}
								className="text-xs fill-gray-600"
							>
								{item.label}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
};

const ScatterChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const chartHeight = 200;
	const chartWidth = 300;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
				{/* Grid lines */}
				{Array.from({ length: 5 }, (_, i) => (
					<line
						key={`h-${i}`}
						x1="0"
						y1={(chartHeight / 4) * i}
						x2={chartWidth}
						y2={(chartHeight / 4) * i}
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}
				{Array.from({ length: 5 }, (_, i) => (
					<line
						key={`v-${i}`}
						x1={(chartWidth / 4) * i}
						y1="0"
						x2={(chartWidth / 4) * i}
						y2={chartHeight}
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}

				{/* Scatter points */}
				{data.map((item, index) => {
					const x = (index / (data.length - 1)) * chartWidth;
					const y = chartHeight - (item.value / maxValue) * chartHeight;
					const size = Math.max(8, (item.value / maxValue) * 20);

					return (
						<g key={index}>
							<circle
								cx={x}
								cy={y}
								r={size}
								fill={item.color}
								stroke="white"
								strokeWidth="2"
								opacity="0.8"
							/>
							<text
								x={x}
								y={chartHeight + 15}
								textAnchor="middle"
								className="text-xs fill-gray-600"
							>
								{item.label}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
};

const BubbleChart: React.FC<PieChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value));
	const chartHeight = 200;
	const chartWidth = 300;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
				{/* Grid lines */}
				{Array.from({ length: 5 }, (_, i) => (
					<line
						key={`h-${i}`}
						x1="0"
						y1={(chartHeight / 4) * i}
						x2={chartWidth}
						y2={(chartHeight / 4) * i}
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}
				{Array.from({ length: 5 }, (_, i) => (
					<line
						key={`v-${i}`}
						x1={(chartWidth / 4) * i}
						y1="0"
						x2={(chartWidth / 4) * i}
						y2={chartHeight}
						stroke="#e5e7eb"
						strokeWidth="1"
					/>
				))}

				{/* Bubble points */}
				{data.map((item, index) => {
					const x = (index / (data.length - 1)) * chartWidth;
					const y = chartHeight - (item.value / maxValue) * chartHeight;
					const bubbleSize = Math.max(15, (item.value / maxValue) * 40);

					return (
						<g key={index}>
							<circle
								cx={x}
								cy={y}
								r={bubbleSize}
								fill={item.color}
								stroke="white"
								strokeWidth="2"
								opacity="0.6"
							/>
							<text
								x={x}
								y={y}
								textAnchor="middle"
								dominantBaseline="middle"
								className="text-xs fill-white font-medium"
							>
								{item.value}
							</text>
							<text
								x={x}
								y={chartHeight + 15}
								textAnchor="middle"
								className="text-xs fill-gray-600"
							>
								{item.label}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
};

const SortableChart: React.FC<SortableChartProps> = ({ chart, pieChartData, onRemoveChart }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: chart.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="bg-white border border-gray-200 select-none"
		>
			{/* Chart Header */}
			<div
				className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 cursor-move"
				{...attributes}
				{...listeners}
			>

				<h3 className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] text-[#3A4050]">
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
							onRemoveChart(chart.id);
						}}
						onPointerDown={(e) => e.stopPropagation()}
						className="text-gray-400 transition-colors cursor-pointer"
						title="Remove chart"
					>
						<Icon name="Trash_light" size="lg" className='mt-3' />
					</button>
				</div>
			</div>

			{/* Chart Content */}
			<div className="p-6 h-80">
				<div className="flex items-center justify-center h-full">
					{/* Chart based on type */}
					{chart.type === 'pie' && <PieChart data={pieChartData} />}
					{chart.type === 'doughnut' && <DoughnutChart data={pieChartData} />}
					{chart.type === 'bar' && <BarChart data={pieChartData} />}
					{chart.type === 'line' && <LineChart data={pieChartData} />}
					{chart.type === 'polarArea' && <PolarAreaChart data={pieChartData} />}
					{chart.type === 'radar' && <RadarChart data={pieChartData} />}
					{chart.type === 'scatter' && <ScatterChart data={pieChartData} />}
					{chart.type === 'bubble' && <BubbleChart data={pieChartData} />}

					{/* Legend - only show for circular charts */}
					{(chart.type === 'pie' || chart.type === 'doughnut' || chart.type === 'polarArea' || chart.type === 'radar') && (
						<div className="space-y-4 ml-8">
							{pieChartData.map((item, index) => (
								<div key={index} className="flex items-center gap-3">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: item.color }}
									></div>
									<span className="font-inter text-sm text-gray-700 whitespace-nowrap">
										{item.label}
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

const DashboardContent: React.FC = () => {
	const { setupData, addChart, removeChart, updateChartsOrder } = useSetup();
	const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Sample data - in a real app, this would come from your data source
	const widgetData = [
		{ title: 'Total Calls', value: 0 },
		{ title: 'Total Calls', value: 0 },
		{ title: 'Total Calls', value: 0 },
	];

	const pieChartData = [
		{ label: 'Already Paid', value: 45, color: '#FF6B6B' },
		{ label: 'Call Back', value: 30, color: '#4ECDC4' },
		{ label: 'Promise to pay', value: 25, color: '#A8E6CF' },
	];

	const handleWidgetMenu = (widgetTitle: string) => {
		console.log('Widget menu clicked for:', widgetTitle);
		// Implement widget menu functionality
	};

	const handleAddWidget = () => {
		console.log('Add widget clicked');
		// Implement add widget functionality
	};

	const handleAddChart = (chartData: {
		title: string;
		type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
		dataSource: 'dispositions' | 'callOutcomes' | 'custom';
		timeRange: 'daily' | 'weekly' | 'monthly';
		color?: string;
		position: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	}) => {
		addChart(chartData);
	};

	const handleRemoveChart = (chartId: string) => {
		removeChart(chartId);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = setupData.dashboardSettings.dispositionSettings.charts.findIndex(
				(chart) => chart.id === active.id
			);
			const newIndex = setupData.dashboardSettings.dispositionSettings.charts.findIndex(
				(chart) => chart.id === over?.id
			);

			const newCharts = arrayMove(
				setupData.dashboardSettings.dispositionSettings.charts,
				oldIndex,
				newIndex
			);

			// Update the charts order in the context
			updateChartsOrder(newCharts);
		}
	};

	return (
		<div>
			{/* Dashboard Title and Action Buttons */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="font-lato font-normal text-[20px] leading-[150%] text-[#3A4050]">
					{setupData.dashboardSettings.dashboardName || 'Outcess Dashboard'}
				</h1>
				<div className="flex gap-3">
					<Button
						variant="primary"
						size="md"
						onClick={handleAddWidget}
					>
						Add Widget
					</Button>
					<Button
						variant="outline"
						size="md"
						onClick={() => setIsAddChartModalOpen(true)}
						className="flex items-center gap-2"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						Add Chart
					</Button>
				</div>
			</div>

			{/* Widget Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{widgetData.map((widget, index) => (
					<WidgetCard
						key={index}
						title={widget.title}
						value={widget.value}
						onMenuClick={() => handleWidgetMenu(widget.title)}
					/>
				))}
			</div>

			{/* Charts Grid Container */}
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<div className="bg-white border border-gray-200 p-4">
					<SortableContext
						items={setupData.dashboardSettings.dispositionSettings.charts.map(chart => chart.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{setupData.dashboardSettings.dispositionSettings.charts.map((chart) => (
								<SortableChart
									key={chart.id}
									chart={chart}
									pieChartData={pieChartData}
									onRemoveChart={handleRemoveChart}
								/>
							))}
						</div>
					</SortableContext>
				</div>
			</DndContext>

			{/* Add Chart Modal */}
			<AddChartModal
				isOpen={isAddChartModalOpen}
				onClose={() => setIsAddChartModalOpen(false)}
				onSave={handleAddChart}
			/>
		</div>
	);
};

export default function DashboardPage() {
	return <DashboardContent />;
}