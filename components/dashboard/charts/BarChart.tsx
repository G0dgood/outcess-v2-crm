'use client';

import React from 'react';
import type { ChartProps } from './types';

export const BarChart: React.FC<ChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value)) || 1;
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
								className="text-[8px] md:text-[10px] fill-gray-600"
							>
								{item.label}
							</text>
							<text
								x={x + barWidth / 2}
								y={y - 5}
								textAnchor="middle"
								className="text-[8px] md:text-[10px] fill-gray-800 font-medium"
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

export default BarChart;

