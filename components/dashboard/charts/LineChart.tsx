'use client';

import React from 'react';
import type { ChartProps } from './types';

export const LineChart: React.FC<ChartProps> = ({ data }) => {
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
					stroke={data[0]?.color || '#3b82f6'}
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
								fill={item.color || '#3b82f6'}
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

export default LineChart;

