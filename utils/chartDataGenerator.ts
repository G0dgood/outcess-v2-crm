/**
 * Chart Data Generator Utility
 * Generates chart data based on data source and chart color
 */

import { getOfflineDispositions, getSyncedDispositions } from './offlineDispositions';
import type { ChartDataItem } from '@/components/dashboard/charts/types';

// Disposition field mappings (same as AddWidgetModal)
export const DISPOSITION_FIELDS = [
	{ value: 'Call Answered', label: 'Call Answered', fieldKey: 'callAnswered' },
	{ value: 'Reason For Non Payment', label: 'Reason For Non Payment', fieldKey: 'reasonForNonPayment' },
	{ value: 'Commitment Date', label: 'Commitment Date', fieldKey: 'commitmentDate' },
	{ value: 'Amount To Pay', label: 'Amount To Pay', fieldKey: 'amountToPay' },
	{ value: 'Reason For Not Watching', label: 'Reason For Not Watching', fieldKey: 'reasonForNotWatching' },
];

/**
 * Generate color variations from a base color
 */
export const generateColorVariations = (baseColor: string, count: number): string[] => {
	if (!baseColor || !baseColor.startsWith('#')) {
		// Default colors if no valid color provided
		const defaultColors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#FFD93D', '#6BCF7F', '#95A5A6', '#E74C3C', '#3498DB'];
		return defaultColors.slice(0, count);
	}

	// Convert hex to HSL
	const hexToHsl = (hex: string) => {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0, s = 0, l = (max + min) / 2;
		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return { h: h * 360, s: s * 100, l: l * 100 };
	};

	// Convert HSL to hex
	const hslToHex = (h: number, s: number, l: number) => {
		h /= 360; s /= 100; l /= 100;
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		let r, g, b;
		if (s === 0) {
			r = g = b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		const toHex = (c: number) => {
			const hex = Math.round(c * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	const baseHsl = hexToHsl(baseColor);
	const colors: string[] = [];
	
	// Generate variations by adjusting lightness and saturation
	for (let i = 0; i < count; i++) {
		const lightness = Math.max(20, Math.min(80, baseHsl.l + (i % 3 - 1) * 15));
		const saturation = Math.max(30, Math.min(100, baseHsl.s + (i % 2) * 10));
		const hue = (baseHsl.h + (i * 30)) % 360; // Rotate hue for variety
		colors.push(hslToHex(hue, saturation, lightness));
	}
	
	return colors;
};

/**
 * Generate chart data based on dataSource(s)
 * Supports both single string and array of strings for multiple data sources
 */
export const generateChartData = (
	dataSource: string | string[],
	chartColor: string | undefined,
	setupData: {
		dashboardSettings: {
			dispositions?: Array<{ name: string; color?: string }>;
			callOutcomes?: Array<{ name: string }>;
		};
	},
	pendingDispositionsCount: number,
	colors?: Record<string, string> // Map of data source to color
): ChartDataItem[] => {
	// Handle multiple data sources
	if (Array.isArray(dataSource) && dataSource.length > 1) {
		const labelMap = new Map<string, { value: number; color: string }>();

		// Generate data for each source
		dataSource.forEach((source, index) => {
			// Get color for this specific data source
			const sourceColor = colors?.[source] || chartColor;
			// Call the internal function to generate data for a single source
			const sourceData = generateSingleSourceData(source, sourceColor, setupData, pendingDispositionsCount);
			
			// Combine data by label, summing values
			sourceData.forEach(item => {
				const existing = labelMap.get(item.label);
				if (existing) {
					existing.value += item.value;
				} else {
					// Use color from the data source's color map, or generate variations
					let itemColor = item.color;
					if (colors?.[source]) {
						// Use the specific color for this data source
						itemColor = colors[source];
					} else if (chartColor) {
						// Generate color variations based on base color
						const colorVariations = generateColorVariations(chartColor, dataSource.length);
						itemColor = colorVariations[index % colorVariations.length] || item.color;
					} else {
						// Use default colors
						const defaultColors = ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#FFD93D', '#6BCF7F', '#95A5A6', '#E74C3C', '#3498DB'];
						itemColor = defaultColors[index % defaultColors.length] || item.color;
					}
					labelMap.set(item.label, {
						value: item.value,
						color: itemColor
					});
				}
			});
		});

		// Convert map to array
		return Array.from(labelMap.entries()).map(([label, data]) => ({
			label,
			value: data.value,
			color: data.color
		}));
	}

	// Handle single data source (backward compatibility)
	const singleSource = Array.isArray(dataSource) ? dataSource[0] : dataSource;
	const sourceColor = colors?.[singleSource] || chartColor;
	return generateSingleSourceData(singleSource, sourceColor, setupData, pendingDispositionsCount);
};

/**
 * Generate chart data for a single data source
 * This is the internal implementation that handles one data source at a time
 */
const generateSingleSourceData = (
	dataSource: string,
	chartColor: string | undefined,
	setupData: {
		dashboardSettings: {
			dispositions?: Array<{ name: string; color?: string }>;
			callOutcomes?: Array<{ name: string }>;
		};
	},
	pendingDispositionsCount: number
): ChartDataItem[] => {
	const allOfflineDispositions = getOfflineDispositions();
	const allSyncedDispositions = getSyncedDispositions();
	const allDispositions = [...allOfflineDispositions, ...allSyncedDispositions];

	// Handle disposition fields
	const dispositionField = DISPOSITION_FIELDS.find(f => f.value === dataSource);
	if (dispositionField) {
		// Count unique values for this field
		const valueCounts: Record<string, number> = {};
		allDispositions.forEach(disp => {
			const fieldValue = disp[dispositionField.fieldKey as keyof typeof disp];
			if (fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-') {
				const value = fieldValue.toString();
				valueCounts[value] = (valueCounts[value] || 0) + 1;
			}
		});

		// Convert to chart data format
		const entries = Object.entries(valueCounts);
		const colors = chartColor
			? generateColorVariations(chartColor, entries.length)
			: ['#FF6B6B', '#4ECDC4', '#A8E6CF', '#FFD93D', '#6BCF7F', '#95A5A6', '#E74C3C', '#3498DB'];
		return entries.map(([label, value], index) => ({
			label,
			value,
			color: colors[index % colors.length]
		}));
	}

		// Handle disposition categories
		if (setupData.dashboardSettings.dispositions) {
			const disposition = setupData.dashboardSettings.dispositions.find((d: { name: string; color?: string }) => d.name === dataSource);
		if (disposition) {
			// Count dispositions with this category
			// Note: dispositionCategory may not exist in the disposition data structure
			// This is a placeholder that would need to be adjusted based on actual data structure
			const count = allDispositions.length; // Placeholder - adjust based on actual category matching
			return [{ label: disposition.name, value: count, color: chartColor || disposition.color || '#FF6B6B' }];
		}
	}

		// Handle call outcomes
		if (setupData.dashboardSettings.callOutcomes) {
			const outcome = setupData.dashboardSettings.callOutcomes.find((o: { name: string }) => o.name === dataSource);
		if (outcome) {
			// Count call outcomes
			// Note: callOutcome may not exist in the disposition data structure
			// This is a placeholder that would need to be adjusted based on actual data structure
			const count = allDispositions.length; // Placeholder - adjust based on actual outcome matching
			return [{ label: outcome.name, value: count, color: chartColor || '#4ECDC4' }];
		}
	}

	// Handle special cases
	if (dataSource === 'Pending Dispositions') {
		return [{ label: 'Pending', value: pendingDispositionsCount, color: chartColor || '#FFD93D' }];
	}

	if (dataSource === 'Total Dispositions') {
		return [{ label: 'Total', value: allDispositions.length, color: chartColor || '#6BCF7F' }];
	}

	if (dataSource === 'Total Calls') {
		// Count all calls (dispositions represent calls)
		return [{ label: 'Total Calls', value: allDispositions.length, color: chartColor || '#3498DB' }];
	}

	if (dataSource === 'Completed Calls') {
		// Count completed calls (dispositions that are not pending)
		// Only OfflineDisposition has status, SyncedDisposition doesn't
		const completed = allDispositions.filter(disp => {
			return 'status' in disp && disp.status !== 'pending';
		}).length;
		return [{ label: 'Completed', value: completed, color: chartColor || '#6BCF7F' }];
	}

	if (dataSource === 'Active Agents') {
		// This would need to come from a different data source
		// For now, return a placeholder
		return [{ label: 'Active Agents', value: 0, color: chartColor || '#9B59B6' }];
	}

	if (dataSource === 'Average Call Duration') {
		// This would need call duration data
		// For now, return a placeholder
		return [{ label: 'Average Duration', value: 0, color: chartColor || '#E67E22' }];
	}

	if (dataSource === 'Custom Data') {
		// Return empty or placeholder data for custom
		const colors = chartColor 
			? generateColorVariations(chartColor, 3)
			: ['#FF6B6B', '#4ECDC4', '#A8E6CF'];
		return [
			{ label: 'Custom 1', value: 0, color: colors[0] },
			{ label: 'Custom 2', value: 0, color: colors[1] },
			{ label: 'Custom 3', value: 0, color: colors[2] },
		];
	}

	// Default fallback data
	const colors = chartColor 
		? generateColorVariations(chartColor, 3)
		: ['#FF6B6B', '#4ECDC4', '#A8E6CF'];
	return [
		{ label: 'Data 1', value: 0, color: colors[0] },
		{ label: 'Data 2', value: 0, color: colors[1] },
		{ label: 'Data 3', value: 0, color: colors[2] },
	];
};

