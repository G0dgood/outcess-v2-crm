'use client';

import React from 'react';
import type { ChartProps } from './types';

export const DoughnutChart: React.FC<ChartProps> = ({ data }) => {
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

export default DoughnutChart;

