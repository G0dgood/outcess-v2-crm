'use client';

import React, { useState, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import Icon from './Icon';
import { ColorPicker } from './ColorPicker';
import { useSocket } from '@/contexts/SocketContext';
// import { useSetup } from '@/contexts/SetupContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDashboardDispositionsByLineOfBusinessAndAgentIdReportQuery, useGetAllDashboardDispositionsByLineOfBusinessReportQuery } from '@/store/services/dispositionApi';

interface AddChartModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (chartData: {
		title: string;
		type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
		dataSource: string | string[]; // Support both single and multiple data sources
		timeRange: 'daily' | 'weekly' | 'monthly';
		color?: string;
		colors?: Record<string, string>; // Map of data source to color
		position: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	}) => void;
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

export const AddChartModal: React.FC<AddChartModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const { isOffline } = useSocket();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { user } = useUserInfo();

	const agentId = user?.id || user?._id || '';
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';
	const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = new Date().toISOString().split('T')[0];

	const { isAdmin } = usePrivilege();

	const { data: reportDataAgent } = useGetDashboardDispositionsByLineOfBusinessAndAgentIdReportQuery(
		{ lineOfBusinessId: lobId, agentId, startDate, endDate },
		{ skip: !lobId || !agentId || !isOpen || isAdmin }
	);

	const { data: reportDataAdmin } = useGetAllDashboardDispositionsByLineOfBusinessReportQuery(
		{ lineOfBusinessId: lobId, startDate, endDate },
		{ skip: !lobId || !isOpen || !isAdmin }
	);

	const reportData = isAdmin ? reportDataAdmin : reportDataAgent;

	const [formData, setFormData] = useState({
		title: '',
		type: 'pie' as const,
		dataSource: [] as string[], // Changed to array to support multiple data sources
		timeRange: 'daily' as const,
		color: '#050711',
		colors: {} as Record<string, string>, // Map of data source to color
		position: {
			x: 20,
			y: 20,
			width: 400,
			height: 300
		}
	});

	// Build data source options
	const dataSourceOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();
		optionsMap.set('Total Calls', { value: 'Total Calls', label: 'Total Calls' });

		// Add API report keys
		if (reportData?.data?.breakdown) {
			Object.keys(reportData.data.breakdown).forEach(key => {
				optionsMap.set(key, { value: key, label: key });
			});
		}

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

		return Array.from(optionsMap.values());
	}, [lineOfBusinessData, reportData]);

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
					newColors[source] = prev.color || '#050711';
				}
			});
			// Remove colors for deselected data sources
			Object.keys(newColors).forEach(source => {
				if (!dataSourceArray?.includes(source)) {
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
				...prev.colors,
				[dataSource]: color
			}
		}));
	};

	const handleSave = () => {
		if (formData.title.trim() && formData.dataSource.length > 0) {
			// Convert to single string if only one source selected (for backward compatibility)
			const dataSource = formData.dataSource.length === 1
				? formData.dataSource[0]
				: formData.dataSource;

			// If multiple data sources, use colors map; otherwise use single color
			const chartData = {
				...formData,
				dataSource
			};

			if (formData.dataSource.length > 1) {
				chartData.colors = formData.colors;
			} else {
				chartData.color = formData.colors[formData.dataSource[0]] || formData.color;
			}

			onSave(chartData);
			setFormData({
				title: '',
				type: 'pie',
				dataSource: [],
				timeRange: 'daily',
				color: '#050711',
				colors: {},
				position: {
					x: 20,
					y: 20,
					width: 400,
					height: 300
				}
			});
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			title: '',
			type: 'pie',
			dataSource: [],
			timeRange: 'daily',
			color: '#050711',
			colors: {},
			position: {
				x: 20,
				y: 20,
				width: 400,
				height: 300
			}
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 shadow-lg flex flex-col max-h-[85vh]"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<h2
							className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Add New Chart
						</h2>
						{isOffline && (
							<span
								className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] md:text-[10px] font-medium"
								style={{
									backgroundColor: 'rgba(220, 53, 69, 0.1)',
									color: '#DC3545',
									border: '1px solid rgba(220, 53, 69, 0.2)'
								}}
							>
								<svg
									className="w-3 h-3"
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
								Offline
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0">
					<Input
						label="Chart Title"
						placeholder="Enter chart title"
						value={formData.title}
						onChange={handleInputChange('title')}
						required
					/>

					<Dropdown
						label="Chart Type"
						placeholder="Select chart type"
						options={chartTypeOptions}
						value={formData.type}
						onChange={handleInputChange('type')}
						required
					/>

					<Dropdown
						label="Data Sources"
						placeholder="Select data sources"
						options={dataSourceOptions}
						value={formData.dataSource}
						onChange={handleDataSourceChange}
						required
						multiple={true}
					/>

					{/* Color pickers for each selected data source */}
					{formData.dataSource.length > 0 && (
						<div className="space-y-3">
							<label
								className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Data Source Colors
							</label>
							{formData.dataSource.map((source) => {
								const sourceLabel = dataSourceOptions.find(opt => opt.value === source)?.label || source;
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
												value={formData.colors[source] || formData.color}
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

				{/* Modal Footer */}
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
							disabled={!formData.title.trim() || formData.dataSource.length === 0}
						>
							{isOffline ? 'Save Offline' : 'Add Chart'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddChartModal;
