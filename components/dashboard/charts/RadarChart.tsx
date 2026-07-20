'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const RadarChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const maxValue = hasData ? Math.max(...data.map((item) => item.value)) || 1 : 1;

	const cx = W / 2;
	const cy = H / 2;
	// Leave room around the ring for vertex labels.
	const maxRadius = Math.max(0, Math.min(W, H) / 2 - 26);
	const ready = W > 0 && H > 0 && maxRadius > 0;
	const sides = hasData ? data.length : 0;
	const color = data[0]?.color || 'var(--primary)';
	const dataKey = hasData ? `${data.length}:${data.reduce((s, d) => s + d.value, 0)}` : 'empty';

	const truncate = (text: string) => {
		const t = String(text ?? '');
		return t.length > 10 ? `${t.slice(0, 9)}…` : t;
	};

	const angleAt = (i: number) => (i / sides) * 2 * Math.PI - Math.PI / 2;

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
					{/* grid rings */}
					{[0.25, 0.5, 0.75, 1].map((scale, i) => (
						<circle key={i} cx={cx} cy={cy} r={maxRadius * scale} fill="none" stroke="var(--light-gray)" strokeWidth={1} />
					))}

					{/* spokes */}
					{data.map((_, index) => {
						const a = angleAt(index);
						return (
							<line
								key={index}
								x1={cx}
								y1={cy}
								x2={cx + maxRadius * Math.cos(a)}
								y2={cy + maxRadius * Math.sin(a)}
								stroke="var(--light-gray)"
								strokeWidth={1}
							/>
						);
					})}

					<g key={dataKey} className="chart-pop">
					{/* data polygon */}
					<polygon
						points={data
							.map((item, index) => {
								const a = angleAt(index);
								const r = (item.value / maxValue) * maxRadius;
								return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
							})
							.join(' ')}
						fill={color}
						fillOpacity={0.25}
						stroke={color}
						strokeWidth={2}
					/>

					{/* points + labels */}
					{data.map((item, index) => {
						const a = angleAt(index);
						const r = (item.value / maxValue) * maxRadius;
						const px = cx + r * Math.cos(a);
						const py = cy + r * Math.sin(a);
						const lx = cx + (maxRadius + 12) * Math.cos(a);
						const ly = cy + (maxRadius + 12) * Math.sin(a);
						const anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';

						return (
							<g key={index}>
								<circle cx={px} cy={py} r={3} fill={item.color || color} stroke="var(--accent-white)" strokeWidth={1}>
									<title>{`${item.label}: ${item.value}`}</title>
								</circle>
								<text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize={9} style={{ fill: 'var(--text-tertiary)' }}>
									{truncate(item.label)}
									<title>{item.label}</title>
								</text>
							</g>
						);
					})}
					</g>
				</svg>
			) : null}
		</div>
	);
};

export default RadarChart;
