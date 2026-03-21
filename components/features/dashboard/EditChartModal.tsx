'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Modal } from '@/components/ui/Modal';
import { useSocket } from '@/contexts/SocketContext';
import type { Chart } from '@/contexts/SetupContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface EditChartModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (chart: Chart) => void;
	chart: Chart | null;
}

const chartTypeOptions = [
	{ value: 'bar', label: 'Bar Chart' },
	{ value: 'line', label: 'Line Chart' },
	{ value: 'pie', label: 'Pie Chart' },
	{ value: 'doughnut', label: 'Doughnut Chart' },
	{ value: 'polarArea', label: 'Polar Area Chart' },
	{ value: 'radar', label: 'Radar Chart' },
	{ value: 'scatter', label: 'Scatter Chart' },
	{ value: 'bubble', label: 'Bubble Chart' },
];

const timeRangeOptions = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'monthly', label: 'Monthly' },
];

export const EditChartModal: React.FC<EditChartModalProps> = ({
	isOpen,
	onClose,
	onSave,
	chart,
}) => {
	const { isOffline } = useSocket();
	const { lineOfBusinessData } = useLineOfBusiness();
	const [formData, setFormData] = useState<Omit<Chart, 'id'>>({
		title: '',
		type: 'pie',
		dataSource: [] as string[],
		timeRange: 'daily',
		color: '#050711',
		colors: {} as Record<string, string>,
		position: {
			x: 20,
			y: 20,
			width: 400,
			height: 300
		}
	});

	// Update form data when chart changes
	useEffect(() => {
		if (chart) {
			// Convert single string to array for backward compatibility
			const dataSource = Array.isArray(chart.dataSource)
				? chart?.dataSource
				: chart?.dataSource ? [chart?.dataSource] : [];

			// Initialize colors from chart.colors or create from chart.color
			const colors: Record<string, string> = {};
			if (chart.colors) {
				// Use existing colors map
				Object.assign(colors, chart?.colors);
			} else if (chart?.color && dataSource?.length > 0) {
				// Initialize colors from single color for all data sources
				dataSource.forEach(source => {
					colors[source] = chart.color || '#050711';
				});
			}

			setFormData({
				title: chart?.title || '',
				type: chart?.type || 'pie',
				dataSource,
				timeRange: chart?.timeRange || 'daily',
				color: chart?.color || '#050711',
				colors,
				position: chart?.position || {
					x: 20,
					y: 20,
					width: 400,
					height: 300
				}
			});
		}
	}, [chart]);

	// Build data source options
	const dataSourceOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;

		// Add disposition categories if available
		if (dashboardSettings?.dispositions && dashboardSettings.dispositions.length > 0) {
			dashboardSettings.dispositions.forEach((disposition: { name: string }) => {
				if (disposition?.name) {
					optionsMap.set(disposition.name, { value: disposition.name, label: disposition.name });
				}
			});
		}

		// Add call outcomes if available
		if (dashboardSettings?.callOutcomes && dashboardSettings.callOutcomes.length > 0) {
			dashboardSettings.callOutcomes.forEach((outcome: { name: string }) => {
				if (outcome?.name) {
					optionsMap.set(outcome.name, { value: outcome.name, label: outcome.name });
				}
			});
		}

		// Add custom data option at the end
		optionsMap.set('custom', { value: 'custom', label: 'Custom Data' });

		return Array.from(optionsMap.values());
	}, [lineOfBusinessData]);

	const handleInputChange = (field: string) => (value: string | string[]) => {
		// For non-multiple fields, ensure we only use string values
		if (field === 'dataSource') {
			const dataSourceArray = Array.isArray(value) ? value : [value];
			setFormData(prev => ({ ...prev, [field]: dataSourceArray }));
		} else {
			// For other fields (type, timeRange, color), use string value
			const stringValue = Array.isArray(value) ? value[0] : value;
			setFormData(prev => ({ ...prev, [field]: stringValue }));
		}
	};

	const handleDataSourceChange = (values: string | string[]) => {
		const dataSourceArray = Array.isArray(values) ? values : [values];
		setFormData(prev => {
			// Initialize colors for new data sources with default color
			const newColors = { ...prev.colors };
			dataSourceArray.forEach(source => {
				if (!newColors[source]) {
					newColors[source] = prev?.color || '#050711';
				}
			});
			// Remove colors for deselected data sources
			Object.keys(newColors).forEach(source => {
				if (!dataSourceArray.includes(source)) {
					delete newColors[source];
				}
			});
			return { ...prev, dataSource: dataSourceArray, colors: newColors };
		});
	};

	const handleColorChange = (dataSource: string, color: string) => {
		setFormData(prev => ({
			...prev,
			colors: {
				...prev?.colors,
				[dataSource]: color
			}
		}));
	};

	const handleSave = () => {
		const dataSourceArray = Array.isArray(formData.dataSource) ? formData.dataSource : [];
		if (formData.title.trim() && dataSourceArray.length > 0 && chart) {
			// Convert to single string if only one source selected (for backward compatibility)
			const dataSource = dataSourceArray.length === 1
				? dataSourceArray[0]
				: dataSourceArray;

			// If multiple data sources, use colors map; otherwise use single color
			const chartData: Chart = {
				...chart,
				...formData,
				dataSource
			};

			if (dataSourceArray.length > 1) {
				chartData.colors = formData.colors || {};
			} else {
				chartData.color = formData.colors?.[dataSourceArray[0]] || formData.color;
				delete chartData.colors; // Remove colors for single source
			}

			onSave(chartData);
			onClose();
		}
	};

	const handleCancel = () => {
		if (chart) {
			// Convert single string to array for backward compatibility
			const dataSource = Array.isArray(chart.dataSource)
				? chart.dataSource
				: chart.dataSource ? [chart.dataSource] : [];

			// Initialize colors from chart.colors or create from chart.color
			const colors: Record<string, string> = {};
			if (chart.colors) {
				Object.assign(colors, chart.colors);
			} else if (chart.color && dataSource.length > 0) {
				dataSource.forEach(source => {
					colors[source] = chart.color || '#050711';
				});
			}

			setFormData({
				title: chart?.title || '',
				type: chart?.type || 'pie',
				dataSource,
				timeRange: chart?.timeRange || 'daily',
				color: chart?.color || '#050711',
				colors,
				position: chart?.position || {
					x: 20,
					y: 20,
					width: 400,
					height: 300
				}
			});
		}
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title="Edit Chart"
			size="md"
		>
			<div className="p-6 space-y-4">
				<Input
					label="Chart Title"
					placeholder="Enter chart title"
					value={formData?.title}
					onChange={handleInputChange('title')}
					required
				/>

				<Dropdown
					label="Chart Type"
					placeholder="Select chart type"
					options={chartTypeOptions}
					value={formData?.type}
					onChange={handleInputChange('type')}
					required
				/>

				<Dropdown
					label="Data Sources"
					placeholder="Select data sources"
					options={dataSourceOptions}
					value={Array.isArray(formData?.dataSource)
						? formData.dataSource
						: (typeof formData?.dataSource === 'string' && formData?.dataSource)
							? [formData?.dataSource]
							: []}
					onChange={handleDataSourceChange}
					required
					multiple={true}
				/>

				{/* Color pickers for each selected data source */}
				{Array.isArray(formData?.dataSource) && formData?.dataSource?.length > 0 && (
					<div className="space-y-3">
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300"
							style={{ color: 'var(--text-secondary)' }}
						>
							Data Source Colors
						</label>
						{formData?.dataSource?.map((source: string) => {
							const sourceLabel = dataSourceOptions?.find(opt => opt.value === source)?.label || source;
							return (
								<div key={source} className="flex items-center gap-3">
									<span
										className="text-[10px] md:text-[12px] flex-1 dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{sourceLabel}
									</span>
									<div className="w-48">
										<ColorPicker
											label=""
											value={formData.colors?.[source] || formData.color || '#050711'}
											onChange={(color) => handleColorChange(source, color)}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}

				<Dropdown
					label="Time Range"
					placeholder="Select time range"
					options={timeRangeOptions}
					value={formData.timeRange}
					onChange={handleInputChange('timeRange')}
					required
				/>
			</div>

			{/* Footer */}
			<div
				className="flex items-center gap-3 p-6 border-t dark:border-gray-700"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				{isOffline && (
					<span className="text-[8px] md:text-[10px] flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
							/>
						</svg>
						Will sync when online
					</span>
				)}
				<div className="flex items-center gap-3 ml-auto">
					<Button
						variant="outline"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
						disabled={!formData.title.trim() || (Array.isArray(formData.dataSource) ? formData.dataSource.length === 0 : false)}
					>
						{isOffline ? 'Save Offline' : 'Save Changes'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default EditChartModal;

