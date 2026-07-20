'use client';

import React from 'react';
import type { ChartProps } from './types';
import { useChartSize } from './useChartSize';

export const BarChart: React.FC<ChartProps> = ({ data }) => {
	const { ref: containerRef, width: W, height: H } = useChartSize<HTMLDivElement>();

	const hasData = data && data.length > 0;

	const maxValue = hasData ? Math.max(...data.map((item) => item.value)) || 1 : 1;

	const topPad = 20; // room for value labels above bars
	const sidePad = 8;
	const n = hasData ? data.length : 0;

	const plotWidth = Math.max(0, W - sidePad * 2);
	const band = n > 0 ? plotWidth / n : 0;

	// Slim, adaptive bars: a fraction of the band, hard-capped in px.
	const barWidth = Math.max(3, Math.min(band * 0.45, 18));

	// Rotate labels only when bands get too narrow for horizontal text.
	const rotate = band > 0 && band < 46;
	const bottomPad = rotate ? 40 : 24;
	const plotHeight = Math.max(0, H - topPad - bottomPad);
	const baselineY = topPad + plotHeight;

	// Truncate horizontal labels to what the band can fit (~5px per char at 9px).
	const maxChars = Math.max(3, Math.floor(band / 5));
	const truncate = (text: string) => {
		const t = String(text ?? '');
		return t.length > maxChars ? `${t.slice(0, Math.max(1, maxChars - 1))}…` : t;
	};

	const ready = W > 0 && H > 0 && plotHeight > 0;

	// Changes with the data so the entrance animation replays on filter/update.
	const dataKey = hasData ? `${data.length}:${data.reduce((s, d) => s + d.value, 0)}` : 'empty';

	return (
		<div ref={containerRef} className="flex-1 w-full min-h-0 relative overflow-hidden">
			{!hasData ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-[10px] italic" style={{ color: 'var(--text-tertiary)' }}>
						No data
					</span>
				</div>
			) : ready ? (
				<svg width={W} height={H} className="block">
					{/* baseline */}
					<line
						x1={sidePad}
						y1={baselineY}
						x2={W - sidePad}
						y2={baselineY}
						stroke="var(--light-gray)"
						strokeWidth={1}
					/>

					<g key={dataKey}>
						{data.map((item, index) => {
							const barHeight = Math.max(2, (item.value / maxValue) * plotHeight);
							const cx = sidePad + index * band + band / 2;
							const x = cx - barWidth / 2;
							const y = baselineY - barHeight;
							const delay = `${index * 45}ms`;
							const labelDelay = `${index * 45 + 260}ms`;

							return (
								<g key={index}>
									<rect
										x={x}
										y={y}
										width={barWidth}
										height={barHeight}
										fill={item.color}
										rx={Math.min(3, barWidth / 2)}
										className="chart-bar"
										style={{ animationDelay: delay }}
									>
										<title>{`${item.label}: ${item.value}`}</title>
									</rect>

									{/* value label */}
									<text
										x={cx}
										y={y - 5}
										textAnchor="middle"
										fontSize={10}
										fontWeight={600}
										className="chart-fade"
										style={{ fill: 'var(--text-secondary)', animationDelay: labelDelay }}
									>
										{item.value}
									</text>

									{/* category label */}
									{rotate ? (
										<text
											x={cx}
											y={baselineY + 12}
											textAnchor="end"
											fontSize={9}
											transform={`rotate(-40 ${cx} ${baselineY + 12})`}
											className="chart-fade"
											style={{ fill: 'var(--text-tertiary)', animationDelay: labelDelay }}
										>
											{truncate(item.label)}
											<title>{item.label}</title>
										</text>
									) : (
										<text
											x={cx}
											y={baselineY + 15}
											textAnchor="middle"
											fontSize={9}
											className="chart-fade"
											style={{ fill: 'var(--text-tertiary)', animationDelay: labelDelay }}
										>
											{truncate(item.label)}
											<title>{item.label}</title>
										</text>
									)}
								</g>
							);
						})}
					</g>
				</svg>
			) : null}
		</div>
	);
};

export default BarChart;
