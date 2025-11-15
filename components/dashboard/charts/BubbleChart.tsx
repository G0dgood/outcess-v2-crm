'use client';

import React from 'react';
import type { ChartProps } from './types';

export const BubbleChart: React.FC<ChartProps> = ({ data }) => {
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

export default BubbleChart;

