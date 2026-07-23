'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const BubbleChart: React.FC<ChartProps> = ({ data }) => {
	const { ref, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;
	const maxValue = hasData ? Math.max(...data.map((item) => item.value)) || 1 : 1;

	const topPad = 20;
	const bottomPad = 24;
	const n = hasData ? data.length : 0;

	// Keep bubbles inside the plot: cap radius by the horizontal space per point too.
	const rawMaxR = Math.min(28, Math.max(0, (Math.min(W, H) - topPad - bottomPad) / 3));
	const perPoint = n > 0 ? (W - 24) / n / 2 : rawMaxR;
	const maxBubble = Math.max(6, Math.min(rawMaxR, perPoint));

	const sidePad = maxBubble + 4;
	const plotWidth = Math.max(0, W - sidePad * 2);
	const plotHeight = Math.max(0, H - topPad - bottomPad);
	const baselineY = topPad + plotHeight;
	const ready = W > 0 && H > 0 && plotHeight > 0;

	const getX = (i: number) => (n > 1 ? sidePad + (i / (n - 1)) * plotWidth : sidePad + plotWidth / 2);
	const getY = (v: number) => baselineY - (v / maxValue) * plotHeight;
	const dataKey = hasData ? `${data.length}:${data.reduce((s, d) => s + d.value, 0)}` : 'empty';

	const band = n > 0 ? (W - sidePad * 2) / n : 0;
	const maxChars = Math.max(3, Math.floor((band || W) / 5));
	const truncate = (text: string) => {
		const t = String(text ?? '');
		return t.length > maxChars ? `${t.slice(0, Math.max(1, maxChars - 1))}…` : t;
	};

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
					{Array.from({ length: 5 }, (_, i) => {
						const gy = topPad + (plotHeight / 4) * i;
						return <line key={`h-${i}`} x1={8} y1={gy} x2={W - 8} y2={gy} stroke="var(--light-gray)" strokeWidth={1} />;
					})}

					{data.map((item, index) => {
						const x = getX(index);
						const y = getY(item.value);
						const r = Math.max(6, (item.value / maxValue) * maxBubble);
						return (
							<g key={`${dataKey}-${index}`} className="chart-pop" style={{ animationDelay: `${index * 55}ms` }}>
								<circle cx={x} cy={y} r={r} fill={item.color} stroke="var(--accent-white)" strokeWidth={2} opacity={0.65}>
									<title>{`${item.label}: ${item.value}`}</title>
								</circle>
								<text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={600} style={{ fill: 'var(--accent-white)' }}>
									{item.value}
								</text>
								<text x={x} y={baselineY + 15} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-tertiary)' }}>
									{truncate(item.label)}
									<title>{item.label}</title>
								</text>
							</g>
						);
					})}
				</svg>
			) : null}
		</div>
	);
};

export default BubbleChart;
