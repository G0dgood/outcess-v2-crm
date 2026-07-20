'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const DoughnutChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const total = hasData ? data.reduce((sum, item) => sum + item.value, 0) || 1 : 1;

	const cx = W / 2;
	const cy = H / 2;
	const outerRadius = Math.max(0, Math.min(W, H) / 2 - 6);
	const innerRadius = outerRadius * 0.58;
	const ready = W > 0 && H > 0 && outerRadius > 0;
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
						const startAngle = (cumulative * 3.6 - 90) * (Math.PI / 180);
						const endAngle = ((cumulative + percentage) * 3.6 - 90) * (Math.PI / 180);
						cumulative += percentage;

						// A single full-circle segment: draw two concentric circles instead of an arc.
						if (percentage >= 100) {
							return (
								<g key={index}>
									<circle cx={cx} cy={cy} r={outerRadius} fill={item.color}>
										<title>{`${item.label}: ${item.value}`}</title>
									</circle>
									<circle cx={cx} cy={cy} r={innerRadius} fill="var(--accent-white)" />
								</g>
							);
						}

						const x1 = cx + outerRadius * Math.cos(startAngle);
						const y1 = cy + outerRadius * Math.sin(startAngle);
						const x2 = cx + outerRadius * Math.cos(endAngle);
						const y2 = cy + outerRadius * Math.sin(endAngle);
						const x3 = cx + innerRadius * Math.cos(endAngle);
						const y3 = cy + innerRadius * Math.sin(endAngle);
						const x4 = cx + innerRadius * Math.cos(startAngle);
						const y4 = cy + innerRadius * Math.sin(startAngle);
						const largeArc = percentage > 50 ? 1 : 0;

						const d = [
							`M ${x1} ${y1}`,
							`A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
							`L ${x3} ${y3}`,
							`A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
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

export default DoughnutChart;
