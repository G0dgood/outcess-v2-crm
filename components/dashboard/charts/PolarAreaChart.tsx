'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const PolarAreaChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const maxValue = hasData ? Math.max(...data.map((item) => item.value)) || 1 : 1;

	const cx = W / 2;
	const cy = H / 2;
	const maxRadius = Math.max(0, Math.min(W, H) / 2 - 6);
	const ready = W > 0 && H > 0 && maxRadius > 0;
	const n = hasData ? data.length : 0;
	const dataKey = hasData ? `${data.length}:${data.reduce((s, d) => s + d.value, 0)}` : 'empty';

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
						const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
						const nextAngle = ((index + 1) / n) * 2 * Math.PI - Math.PI / 2;
						const radius = (item.value / maxValue) * maxRadius;

						const x1 = cx + radius * Math.cos(angle);
						const y1 = cy + radius * Math.sin(angle);
						const x2 = cx + radius * Math.cos(nextAngle);
						const y2 = cy + radius * Math.sin(nextAngle);

						const d = [
							`M ${cx} ${cy}`,
							`L ${x1} ${y1}`,
							`A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
							'Z',
						].join(' ');

						return (
							<path key={index} d={d} fill={item.color} stroke="var(--accent-white)" strokeWidth={1} opacity={0.85}>
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

export default PolarAreaChart;
