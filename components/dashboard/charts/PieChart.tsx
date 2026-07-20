'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const PieChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const total = hasData ? data.reduce((sum, item) => sum + item.value, 0) || 1 : 1;

	const cx = W / 2;
	const cy = H / 2;
	const radius = Math.max(0, Math.min(W, H) / 2 - 6);
	const ready = W > 0 && H > 0 && radius > 0;
	const dataKey = hasData ? `${data.length}:${total}` : 'empty';

	let cumulative = 0;

	return (
		<div ref={ref} className="flex-1 w-full min-h-0 relative overflow-hidden">
			{!hasData ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-[10px] italic" style={{ color: 'var(--text-tertiary)' }}>
						No data
					</span>
				</div>
			) : ready ? (
				<svg width={W} height={H} className="block">
					<g key={dataKey} className="chart-pop">
					{data.map((item, index) => {
						const percentage = (item.value / total) * 100;
						// Start at the top (-90°) and sweep clockwise.
						const startAngle = (cumulative * 3.6 - 90) * (Math.PI / 180);
						const endAngle = ((cumulative + percentage) * 3.6 - 90) * (Math.PI / 180);
						cumulative += percentage;

						// A single full-circle slice can't be drawn as an arc path.
						if (percentage >= 100) {
							return (
								<circle key={index} cx={cx} cy={cy} r={radius} fill={item.color}>
									<title>{`${item.label}: ${item.value}`}</title>
								</circle>
							);
						}

						const x1 = cx + radius * Math.cos(startAngle);
						const y1 = cy + radius * Math.sin(startAngle);
						const x2 = cx + radius * Math.cos(endAngle);
						const y2 = cy + radius * Math.sin(endAngle);
						const largeArc = percentage > 50 ? 1 : 0;

						const d = [
							`M ${cx} ${cy}`,
							`L ${x1} ${y1}`,
							`A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
							'Z',
						].join(' ');

						return (
							<path key={index} d={d} fill={item.color} stroke="var(--accent-white)" strokeWidth={1.5}>
								<title>{`${item.label}: ${item.value}`}</title>
							</path>
						);
					})}
					</g>
				</svg>
			) : null}
		</div>
	);
};

export default PieChart;
