'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import Checkbox from '@/components/ui/Checkbox';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useSocket } from '@/contexts/SocketContext';
// import { useSetup } from '@/contexts/SetupContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDashboardDispositionsByCampaignAndAgentIdReportQuery, useGetAllDashboardDispositionsByCampaignReportQuery } from '@/store/services/dispositionApi';
import { DispositionCategory, NestedOption } from '@/types/dashboard';
import { Cross2Icon } from '@radix-ui/react-icons';
import { getAllCampaignDispositions } from '@/utils/dispositionMultiDropdown';

interface AddChartModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (chartData: {
		title: string;
		type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
		dataSource: string | string[]; // Support both single and multiple data sources
		timeRange: 'daily' | 'weekly' | 'monthly';
		size: 'small' | 'medium' | 'large';
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

const sizeOptions = [
	{ value: 'small', label: 'Small' },
	{ value: 'medium', label: 'Medium' },
	{ value: 'large', label: 'Large' },
];

export const AddChartModal: React.FC<AddChartModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const { isOffline } = useSocket();
	const { campaignData } = useCampaign();
	const { user } = useUserInfo();

	const agentId = user?.id || user?._id || '';
	const campaignId = campaignData?._id || campaignData?.id || '';
	const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = new Date().toISOString().split('T')[0];

	const { isAdmin } = usePrivilege();

	const { data: reportDataAgent } = useGetDashboardDispositionsByCampaignAndAgentIdReportQuery(
		{ campaignId, agentId, startDate, endDate },
		{ skip: !campaignId || !agentId || !isOpen || isAdmin }
	);

	const { data: reportDataAdmin } = useGetAllDashboardDispositionsByCampaignReportQuery(
		{ campaignId, startDate, endDate },
		{ skip: !campaignId || !isOpen || !isAdmin }
	);

	const reportData = isAdmin ? reportDataAdmin : reportDataAgent;

	const [formData, setFormData] = useState({
		title: '',
		type: 'pie' as const,
		dataSource: [] as string[], // Changed to array to support multiple data sources
		timeRange: 'daily' as const,
		size: 'small' as const,
		color: '#050711',
		colors: {} as Record<string, string>, // Map of data source to color
		position: {
			x: 20,
			y: 20,
			width: 400,
			height: 300
		}
	});

	// State for custom aggregation builder
	const [customCategory, setCustomCategory] = useState<string>('');
	const [customCheckedKeys, setCustomCheckedKeys] = useState<string[]>([]);
	const [customTitle, setCustomTitle] = useState<string>('');
	const [showCustomBuilder, setShowCustomBuilder] = useState<boolean>(false);

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

		const dashboardSettings = campaignData?.dashboardSettings;

		// Add disposition categories if available (direct and bucketed)
		const allDispositions: DispositionCategory[] = [...(dashboardSettings?.dispositions || [])];
		if (dashboardSettings?.buckets && Array.isArray(dashboardSettings.buckets)) {
			dashboardSettings.buckets.forEach((bucket: { dispositions?: DispositionCategory[] }) => {
				if (bucket && Array.isArray(bucket.dispositions)) {
					bucket.dispositions.forEach((disp: DispositionCategory) => {
						if (disp && disp.name && !allDispositions.some(d => d.name === disp.name)) {
							allDispositions.push(disp);
						}
					});
				}
			});
		}

		if (allDispositions.length > 0) {
			allDispositions.forEach((disposition: DispositionCategory) => {
				if (disposition?.name) {
					optionsMap.set(disposition.name, { value: disposition.name, label: disposition.name });

					const collectNested = (opts?: NestedOption[]) => {
						if (!opts || !Array.isArray(opts)) return;
						opts.forEach(opt => {
							if (opt.value) {
								optionsMap.set(opt.value, { value: opt.value, label: `${disposition.name} -> ${opt.value}` });
							}
							if (opt.subLabel && !optionsMap.has(opt.subLabel)) {
								optionsMap.set(opt.subLabel, { value: opt.subLabel, label: `${disposition.name} Label: ${opt.subLabel}` });
							}
							if (opt.subOptions) {
								collectNested(opt.subOptions);
							}
						});
					};

					collectNested(disposition.nestedOptions);

					if (disposition.dropdownOptions && Array.isArray(disposition.dropdownOptions)) {
						disposition.dropdownOptions.forEach(opt => {
							if (opt && opt.trim()) {
								optionsMap.set(opt.trim(), { value: opt.trim(), label: `${disposition.name} -> ${opt.trim()}` });
							}
						});
					}
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
	}, [campaignData, reportData]);

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

	const handleRemoveDataSource = (sourceToRemove: string) => {
		setFormData(prev => {
			const dataSourceArray = Array.isArray(prev.dataSource) ? prev.dataSource : [];
			const newDataSource = dataSourceArray.filter(source => source !== sourceToRemove);
			const newColors = { ...prev.colors };
			delete newColors[sourceToRemove];
			return { ...prev, dataSource: newDataSource, colors: newColors };
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

	const customCategoryOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();

		if (reportData?.data?.breakdown) {
			Object.entries(reportData.data.breakdown).forEach(([key, val]) => {
				if (typeof val === 'object' && val !== null) {
					optionsMap.set(key, { value: key, label: key });
				}
			});
		}

		const dashboardSettings = campaignData?.dashboardSettings;
		const allDispositions = getAllCampaignDispositions(dashboardSettings);

		allDispositions.forEach((disposition: DispositionCategory) => {
			if (disposition?.name) {
				const hasOptions = 
					(disposition.dropdownOptions && disposition.dropdownOptions.length > 0) || 
					(disposition.nestedOptions && disposition.nestedOptions.length > 0) ||
					(disposition.optionSubFields && Object.keys(disposition.optionSubFields).length > 0);
				
				if (hasOptions) {
					optionsMap.set(disposition.name, { value: disposition.name, label: disposition.name });
				}
			}
		});

		return Array.from(optionsMap.values());
	}, [campaignData, reportData]);

	const customSubKeyOptions = useMemo(() => {
		if (!customCategory) return [];

		const optionsMap = new Map<string, { value: string; label: string }>();

		if (reportData?.data?.breakdown?.[customCategory]) {
			const reportValue = reportData.data.breakdown[customCategory];
			if (typeof reportValue === 'object' && reportValue !== null) {
				Object.keys(reportValue).forEach(key => {
					optionsMap.set(key, { value: key, label: key });
				});
			}
		}

		const dashboardSettings = campaignData?.dashboardSettings;
		const allDispositions = getAllCampaignDispositions(dashboardSettings);

		const matchingDisp = allDispositions.find(d => d.name === customCategory);
		if (matchingDisp) {
			const collectNested = (opts?: NestedOption[]) => {
				if (!opts || !Array.isArray(opts)) return;
				opts.forEach(opt => {
					if (opt.value) {
						optionsMap.set(opt.value, { value: opt.value, label: opt.value });
					}
					if (opt.subLabel && !optionsMap.has(opt.subLabel)) {
						optionsMap.set(opt.subLabel, { value: opt.subLabel, label: opt.subLabel });
					}
					if (opt.subOptions) {
						collectNested(opt.subOptions);
					}
				});
			};

			collectNested(matchingDisp.nestedOptions);

			if (matchingDisp.dropdownOptions && Array.isArray(matchingDisp.dropdownOptions)) {
				matchingDisp.dropdownOptions.forEach(opt => {
					if (opt && opt.trim()) {
						optionsMap.set(opt.trim(), { value: opt.trim(), label: opt.trim() });
					}
				});
			}

			if (matchingDisp.optionSubFields && typeof matchingDisp.optionSubFields === 'object') {
				Object.keys(matchingDisp.optionSubFields).forEach(optKey => {
					optionsMap.set(optKey, { value: optKey, label: optKey });
				});
			}
		}

		return Array.from(optionsMap.values());
	}, [customCategory, campaignData, reportData]);

	const handleAddCustomSeries = () => {
		if (!customCategory || customCheckedKeys.length === 0 || !customTitle.trim()) return;

		const customSourceString = `${customCategory}:::sum:::${customCheckedKeys.join(',')}:::${customTitle.trim()}`;
		
		setFormData(prev => {
			const dataSourceArray = Array.isArray(prev.dataSource) ? prev.dataSource : [];
			if (dataSourceArray.includes(customSourceString)) return prev;

			const newDataSource = [...dataSourceArray, customSourceString];
			const newColors = { ...prev.colors };
			newColors[customSourceString] = prev.color || '#050711';

			return {
				...prev,
				dataSource: newDataSource,
				colors: newColors
			};
		});

		setCustomCategory('');
		setCustomCheckedKeys([]);
		setCustomTitle('');
		setShowCustomBuilder(false);
	};

	const getSourceLabel = (source: string) => {
		if (source.includes(':::')) {
			const parts = source.split(':::');
			if (parts[1] === 'sum') {
				return parts[3] || `${parts[0]} (Sum)`;
			} else {
				return parts[2] || parts[1];
			}
		}
		return dataSourceOptions.find(opt => opt.value === source)?.label || source;
	};

	const handleSave = () => {
		if (formData.title.trim() && formData.dataSource.length > 0) {
			const dataSource = formData.dataSource.length === 1
				? formData.dataSource[0]
				: formData.dataSource;

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
				size: 'small',
				color: '#050711',
				colors: {},
				position: {
					x: 20,
					y: 20,
					width: 400,
					height: 300
				}
			});
			setCustomCategory('');
			setCustomCheckedKeys([]);
			setCustomTitle('');
			setShowCustomBuilder(false);
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			title: '',
			type: 'pie',
			dataSource: [],
			timeRange: 'daily',
			size: 'small',
			color: '#050711',
			colors: {},
			position: {
				x: 20,
				y: 20,
				width: 400,
				height: 300
			}
		});
		setCustomCategory('');
		setCustomCheckedKeys([]);
		setCustomTitle('');
		setShowCustomBuilder(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 shadow-lg flex flex-col max-h-[85vh] rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6 rounded-t-[var(--radius)]"
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
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6 overflow-y-auto flex-1 min-h-0 max-h-[60vh] no-scrollbar">
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
						onChange={(values) => {
							const dataSourceArray = Array.isArray(values) ? values : [values];
							setFormData(prev => {
								const newColors = { ...prev.colors };
								dataSourceArray.forEach(source => {
									if (!newColors[source]) {
										newColors[source] = prev.color || '#050711';
									}
								});
								Object.keys(newColors).forEach(source => {
									if (!dataSourceArray?.includes(source)) {
										delete newColors[source];
									}
								});
								return { ...prev, dataSource: dataSourceArray, colors: newColors };
							});
						}}
						required
						multiple={true}
					/>

					{/* Custom Aggregation Builder */}
					<div className="border dark:border-gray-700 rounded-[var(--radius)] p-4 space-y-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
						{!showCustomBuilder ? (
							<Button
								variant="outline"
								size="sm"
								type="button"
								className="w-full flex items-center justify-center gap-1 text-xs"
								onClick={() => setShowCustomBuilder(true)}
							>
								<Icon name="Add_round_light" size="sm" />
								Create Custom Category Sum
							</Button>
						) : (
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-xs font-bold text-[var(--text-primary)]">Create Custom Category Sum</span>
									<Button
										variant="ghost"
										size="sm"
										type="button"
										onClick={() => {
											setShowCustomBuilder(false);
											setCustomCategory('');
											setCustomCheckedKeys([]);
											setCustomTitle('');
										}}
										className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0 h-auto"
									>
										Cancel
									</Button>
								</div>

								<Dropdown
									label="Select Category"
									placeholder="Select category"
									options={customCategoryOptions}
									value={customCategory}
									onChange={(value) => {
										const val = Array.isArray(value) ? value[0] : value;
										setCustomCategory(val);
										setCustomCheckedKeys([]);
									}}
								/>

								{customSubKeyOptions.length > 0 && (
									<div className="space-y-2">
										<label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
											Select Options to Sum
										</label>
										<div className="max-h-36 overflow-y-auto border dark:border-gray-700 rounded-[var(--radius)] p-3 flex flex-col gap-3" style={{ backgroundColor: 'var(--card-bg)' }}>
											{customSubKeyOptions.map(opt => (
												<Checkbox
													key={opt.value}
													size="small"
													label={opt.label}
													checked={customCheckedKeys.includes(opt.value)}
													onChange={(checked) => {
														if (checked) {
															setCustomCheckedKeys(prev => [...prev, opt.value]);
														} else {
															setCustomCheckedKeys(prev => prev.filter(k => k !== opt.value));
														}
													}}
												/>
											))}
										</div>
									</div>
								)}

								<Input
									label="Custom Title"
									placeholder="e.g. Positive Outcomes"
									value={customTitle}
									onChange={(val) => setCustomTitle(val)}
								/>

								<Button
									variant="primary"
									size="sm"
									type="button"
									className="w-full text-xs"
									onClick={handleAddCustomSeries}
									disabled={!customCategory || customCheckedKeys.length === 0 || !customTitle.trim()}
								>
									Add to Chart Data Sources
								</Button>
							</div>
						)}
					</div>

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
								const sourceLabel = getSourceLabel(source);
								return (
									<div key={source} className="flex items-center gap-3">
										<span
											className="text-[10px] md:text-[12px] flex-1 dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{sourceLabel}
										</span>
										<div className="flex items-center gap-2 w-48">
											<div className="flex-1">
												<ColorPicker
													label=""
													value={formData.colors[source] || formData.color}
													onChange={(color) => handleColorChange(source, color)}
												/>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveDataSource(source)}
												className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
												title={`Remove ${sourceLabel}`}
											>
												<Cross2Icon className="w-3 h-3" />
											</button>
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
					<Dropdown
						label="Size"
						placeholder="Select size"
						options={sizeOptions}
						value={formData.size}
						onChange={handleInputChange('size')}
						required
					/>
				</div>

				{/* Modal Footer */}
				<div
					className="flex items-center gap-3 p-6 border-t dark:border-gray-700 rounded-b-[var(--radius)]"
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
