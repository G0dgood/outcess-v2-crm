'use client';

import React, { useState, useRef, useCallback } from 'react';
import Dropdown from './Dropdown';
import Icon from './Icon';

interface DraggableChartProps {
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
	onRemove: (chartId: string) => void;
	onUpdatePosition: (chartId: string, position: { x: number; y: number; width: number; height: number }) => void;
	children: React.ReactNode;
}

const DraggableChart: React.FC<DraggableChartProps> = ({
	chart,
	onRemove,
	onUpdatePosition,
	children,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [isResizing, setIsResizing] = useState(false);
	const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const chartRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.chart-header')) {
			setIsDragging(true);
			setDragStart({
				x: e.clientX - chart.position.x,
				y: e.clientY - chart.position.y,
			});
		}
	};

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (isDragging) {
			const newX = e.clientX - dragStart.x;
			const newY = e.clientY - dragStart.y;

			// Keep chart within bounds
			const maxX = window.innerWidth - chart.position.width;
			const maxY = window.innerHeight - chart.position.height;

			const boundedX = Math.max(0, Math.min(newX, maxX));
			const boundedY = Math.max(0, Math.min(newY, maxY));

			onUpdatePosition(chart.id, {
				...chart.position,
				x: boundedX,
				y: boundedY,
			});
		} else if (isResizing) {
			const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
			const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));

			onUpdatePosition(chart.id, {
				...chart.position,
				width: newWidth,
				height: newHeight,
			});
		}
	}, [isDragging, dragStart.x, dragStart.y, chart.id, chart.position, isResizing, resizeStart.width, resizeStart.height, resizeStart.x, resizeStart.y, onUpdatePosition]);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setIsResizing(false);
	}, []);

	const handleResizeMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsResizing(true);
		setResizeStart({
			x: e.clientX,
			y: e.clientY,
			width: chart.position.width,
			height: chart.position.height,
		});
	};

	React.useEffect(() => {
		if (isDragging || isResizing) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [isDragging, isResizing, dragStart, resizeStart, handleMouseMove, handleMouseUp]);

	return (
		<div
			ref={chartRef}
			className={`absolute bg-white border border-gray-200 shadow-lg transition-shadow duration-200 ${isDragging ? 'shadow-xl z-50' : 'hover:shadow-lg'
				}`}
			style={{
				left: chart.position.x,
				top: chart.position.y,
				width: chart.position.width,
				height: chart.position.height,
				cursor: isDragging ? 'grabbing' : 'grab',
			}}
			onMouseDown={handleMouseDown}
		>
			{/* Chart Header */}
			<div className="chart-header flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 cursor-grab">
				<h3 className="font-inter text-[12px] md:text-[14px] font-semibold text-gray-900">
					{chart.title}
				</h3>
				<div className="flex items-center gap-2">
					<Dropdown
						label=""
						value={chart.timeRange}
						onChange={(_value) => {
							console.log("Time range changed:", _value);
						}}
						options={[
							{ value: 'daily', label: 'Daily' },
							{ value: 'weekly', label: 'Weekly' },
							{ value: 'monthly', label: 'Monthly' },
						]}
						className="min-w-[100px]"
					/>
					<button
						onClick={() => onRemove(chart.id)}
						className="text-gray-400 hover:text-red-600 transition-colors p-1"
						title="Remove chart"
					>
						<Icon name="Trash_light" size="sm" />
					</button>
				</div>
			</div>

			{/* Chart Content */}
			<div className="  h-full w-full">
				{children}
			</div>

			{/* Resize Handle */}
			<div
				className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 hover:bg-gray-400 transition-colors"
				onMouseDown={handleResizeMouseDown}
				style={{
					clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
				}}
			/>
		</div>
	);
};

export default DraggableChart;
