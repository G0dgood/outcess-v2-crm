'use client';

import React from 'react';
import type { ChartProps } from './types';

export const RadarChart: React.FC<ChartProps> = ({ data }) => {
	const maxValue = Math.max(...data.map(item => item.value)) || 1;
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
					fill={data[0]?.color || '#3b82f6'}
					fillOpacity="0.3"
					stroke={data[0]?.color || '#3b82f6'}
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
								fill={item.color || '#3b82f6'}
								stroke="white"
								strokeWidth="1"
							/>
							<text
								x={x + (x > centerX ? 5 : -5)}
								y={y + (y > centerY ? 5 : -5)}
								textAnchor={x > centerX ? 'start' : 'end'}
								className="text-[8px] md:text-[10px] fill-gray-600"
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

export default RadarChart;

