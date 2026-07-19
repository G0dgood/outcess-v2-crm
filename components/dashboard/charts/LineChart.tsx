'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const LineChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const maxValue = hasData ? Math.max(...data.map((item) => item.value)) || 1 : 1;

	const topPad = 20;
	const bottomPad = 24;
	const sidePad = 12;
	const plotWidth = Math.max(0, W - sidePad * 2);
	const plotHeight = Math.max(0, H - topPad - bottomPad);
	const baselineY = topPad + plotHeight;
	const ready = W > 0 && H > 0 && plotHeight > 0;

	const n = hasData ? data.length : 0;
	const step = n > 1 ? plotWidth / (n - 1) : 0;
	const getX = (i: number) => (n > 1 ? sidePad + i * step : sidePad + plotWidth / 2);
	const getY = (v: number) => baselineY - (v / maxValue) * plotHeight;

	const band = n > 0 ? plotWidth / n : 0;
	const maxChars = Math.max(3, Math.floor((band || plotWidth) / 5));
	const truncate = (text: string) => {
		const t = String(text ?? '');
		return t.length > maxChars ? `${t.slice(0, Math.max(1, maxChars - 1))}…` : t;
	};

	const lineColor = data[0]?.color || 'var(--primary)';
	const points = hasData ? data.map((item, i) => `${getX(i)},${getY(item.value)}`).join(' ') : '';
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
					{/* gridlines */}
					{Array.from({ length: 5 }, (_, i) => {
						const gy = topPad + (plotHeight / 4) * i;
						return (
							<line
								key={i}
								x1={sidePad}
								y1={gy}
								x2={W - sidePad}
								y2={gy}
								stroke="var(--light-gray)"
								strokeWidth={1}
							/>
						);
					})}

					<g key={dataKey}>
						<polyline
							points={points}
							fill="none"
							stroke={lineColor}
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
							pathLength={1}
							className="chart-line"
						/>

						{data.map((item, index) => {
							const x = getX(index);
							const y = getY(item.value);
							const delay = `${index * 60 + 500}ms`;
							return (
								<g key={index} className="chart-fade" style={{ animationDelay: delay }}>
									<circle cx={x} cy={y} r={4} fill={item.color || lineColor} stroke="var(--accent-white)" strokeWidth={2}>
										<title>{`${item.label}: ${item.value}`}</title>
									</circle>
									<text x={x} y={y - 9} textAnchor="middle" fontSize={10} fontWeight={600} style={{ fill: 'var(--text-secondary)' }}>
										{item.value}
									</text>
									<text x={x} y={baselineY + 15} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-tertiary)' }}>
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

export default LineChart;
