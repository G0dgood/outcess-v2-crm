'use client';

import React from 'react';
import type { ChartProps } from './types';

export const PieChart: React.FC<ChartProps> = ({ data }) => {
	const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
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

export default PieChart;

