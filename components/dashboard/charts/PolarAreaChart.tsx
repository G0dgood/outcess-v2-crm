'use client';

import React from 'react';
import type { ChartProps } from './types';

export const PolarAreaChart: React.FC<ChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value)) || 1;
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

export default PolarAreaChart;

