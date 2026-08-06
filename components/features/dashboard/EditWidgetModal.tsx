'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Dropdown from '@/components/ui/Dropdown';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Modal } from '@/components/ui/Modal';
import { Widget, DispositionCategory, NestedOption } from '@/types/dashboard';
import { useCampaign } from '@/contexts/CampaignContext';
import { resolveMultiDropdownLevels, getAllCampaignDispositions } from '@/utils/dispositionMultiDropdown';
// import { useSocket } from '@/contexts/SocketContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDashboardDispositionsByCampaignAndAgentIdReportQuery, useGetAllDashboardDispositionsByCampaignReportQuery } from '@/store/services/dispositionApi';
import { getOfflineDispositions, getSyncedDispositions, DispositionFieldEntry } from '@/utils/offlineDispositions';

interface EditWidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (widget: Widget) => void;
	widget: Widget | null;
}

export const EditWidgetModal: React.FC<EditWidgetModalProps> = ({
	isOpen,
	onClose,
	onSave,
	widget,
}) => {
	const { campaignData } = useCampaign();
	const { user } = useUserInfo();
	const { isAdmin } = usePrivilege();

	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: '#050711',
		subKey: '',
		dataSourceName: '',
	});
	const [selectedSubKey, setSelectedSubKey] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [isTitleManual, setIsTitleManual] = useState(false);

	// API Data Fetching
	const agentId = user?.id || user?._id || '';
	const campaignId = campaignData?._id || campaignData?.id || '';
	const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = new Date().toISOString().split('T')[0];

	const { data: reportDataAgent } = useGetDashboardDispositionsByCampaignAndAgentIdReportQuery(
		{ campaignId, agentId, startDate, endDate },
		{ skip: !campaignId || !agentId || !isOpen || isAdmin }
	);

	const { data: reportDataAdmin } = useGetAllDashboardDispositionsByCampaignReportQuery(
		{ campaignId, startDate, endDate },
		{ skip: !campaignId || !isOpen || !isAdmin }
	);

	const reportData = isAdmin ? reportDataAdmin : reportDataAgent;

	// Update form data when widget changes
	useEffect(() => {
		if (widget && isOpen) {
			const sourceName = widget.dataSourceName || widget.title;
			setFormData({
				title: widget.title || '',
				value: widget.value || 0,
				color: widget.color || '#050711',
				callOutcome: widget.callOutcome,
				subKey: widget.subKey || '',
				dataSourceName: sourceName,
			});

			if (widget.subKey && widget.subKey.includes(':::')) {
				const parts = widget.subKey.split(':::');
				const category = parts[0];
				if (parts[1] === 'sum') {
					const keys = parts[2] ? parts[2].split(',') : [];
					setSelectedCategory(category);
					setSelectedKeys(keys);
					setSelectedSubKey('');
					setIsTitleManual(widget.title !== `${category} (Sum)`);
				} else {
					const key = parts[1];
					setSelectedCategory(category);
					setSelectedSubKey(key);
					setSelectedKeys([key]);
					setIsTitleManual(widget.title !== key);
				}
			} else {
				setSelectedCategory(sourceName);
				setSelectedSubKey('');
				setSelectedKeys([]);
				setIsTitleManual(widget.title !== sourceName);
			}
		}
	}, [widget, isOpen]);

	// Supplementary sync for late-loading report data
	useEffect(() => {
		if (isOpen && widget && !selectedCategory && reportData?.data?.breakdown) {
			const sourceName = widget.dataSourceName || widget.title;
			if (widget.subKey && widget.subKey.includes(':::')) {
				const parts = widget.subKey.split(':::');
				setSelectedCategory(parts[0]);
			} else {
				setSelectedCategory(sourceName);
			}
		}
	}, [isOpen, widget, reportData, selectedCategory]);

	// Calculate value based on selected disposition field / sub-option checkboxes
	useEffect(() => {
		// Avoid running calculation during the initial load of the widget to prevent title overrides
		if (!isOpen || !widget) return;
		const lookupKey = selectedCategory || formData.dataSourceName;
		if (!lookupKey) return;

		const dashboardSettings = campaignData?.dashboardSettings;
		const allConfigured = getAllCampaignDispositions(dashboardSettings);

		// If "Total Dispositions" or "Total Calls" is selected
		if (lookupKey === 'Total Dispositions' || lookupKey === 'Total Calls') {
			const apiTotal = reportData?.data?.totalDispositions !== undefined ? Number(reportData.data.totalDispositions) : 0;
			setFormData(prev => ({
				...prev,
				title: isTitleManual ? prev.title : lookupKey,
				value: apiTotal,
				subKey: '',
				dataSourceName: lookupKey,
			}));
			return;
		}

		// Helper to calculate count for offline/synced dispositions
		const getCountForKeys = (category: string, keys: string[]) => {
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];

			return allDispositions.filter(disp => {
				const fields = disp.dispositionData || disp.fillDisposition;
				if (fields && Array.isArray(fields)) {
					return fields.some((f: DispositionFieldEntry) => {
						if (!f.fieldName || f.fieldValue === undefined || f.fieldValue === null) return false;
						if (f.fieldName.toLowerCase() !== category.toLowerCase()) return false;
						const dispDef = allConfigured.find(d => d.name === f.fieldName);
						const levels = resolveMultiDropdownLevels(f.fieldName, String(f.fieldValue), dispDef);
						return levels.some(lvl =>
							keys.some(k => 
								lvl.header.toLowerCase() === k.toLowerCase() ||
								lvl.value.toLowerCase() === k.toLowerCase()
							)
						);
					});
				}
				return false;
			}).length;
		};

		// Calculate value
		let calculatedValue = 0;
		let compositeSubKey = '';

		if (selectedKeys.length > 0) {
			if (selectedKeys.length === 1) {
				const singleKey = selectedKeys[0];
				compositeSubKey = `${lookupKey}:::${singleKey}`;

				if (reportData?.data?.breakdown?.[lookupKey]) {
					const reportValue = reportData.data.breakdown[lookupKey];
					if (typeof reportValue === 'object' && reportValue !== null) {
						calculatedValue = Number(reportValue[singleKey]) || 0;
					}
				} else {
					calculatedValue = getCountForKeys(lookupKey, [singleKey]);
				}
			} else {
				compositeSubKey = `${lookupKey}:::sum:::${selectedKeys.join(',')}`;

				if (reportData?.data?.breakdown?.[lookupKey]) {
					const reportValue = reportData.data.breakdown[lookupKey];
					if (typeof reportValue === 'object' && reportValue !== null) {
						calculatedValue = selectedKeys.reduce((acc, k) => acc + (Number(reportValue[k]) || 0), 0);
					}
				} else {
					calculatedValue = getCountForKeys(lookupKey, selectedKeys);
				}
			}
		} else {
			if (reportData?.data?.breakdown?.[lookupKey]) {
				const reportValue = reportData.data.breakdown[lookupKey];
				if (typeof reportValue === 'object' && reportValue !== null) {
					calculatedValue = Object.values(reportValue).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
				} else {
					calculatedValue = Number(reportValue) || 0;
				}
			} else {
				const matchingDisp = allConfigured.find(d => d.name === lookupKey);
				const optionsList = matchingDisp?.dropdownOptions || (matchingDisp as { options?: string[] })?.options || [];
				calculatedValue = getCountForKeys(lookupKey, optionsList);
			}
		}

		const defaultTitle = selectedKeys.length > 0 
			? (selectedKeys.length === 1 ? selectedKeys[0] : `${lookupKey} (Sum)`) 
			: lookupKey;

		setFormData(prev => ({
			...prev,
			title: isTitleManual ? prev.title : defaultTitle,
			value: calculatedValue,
			subKey: compositeSubKey,
			dataSourceName: lookupKey,
		}));
	}, [selectedCategory, selectedKeys, reportData, isTitleManual, campaignData, isOpen, widget, formData.dataSourceName]);

	const subKeyOptions = useMemo(() => {
		const lookupKey = selectedCategory || formData.dataSourceName;
		if (!lookupKey) return [];

		const optionsMap = new Map<string, { value: string; label: string }>();

		// 1. From API breakdown data
		if (reportData?.data?.breakdown?.[lookupKey]) {
			const reportValue = reportData.data.breakdown[lookupKey];
			if (typeof reportValue === 'object' && reportValue !== null) {
				Object.keys(reportValue).forEach(key => {
					optionsMap.set(key, { value: key, label: key });
				});
			}
		}

		// 2. From Campaign Dashboard Settings (Direct dispositions and Buckets)
		const dashboardSettings = campaignData?.dashboardSettings;
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

		const matchingDisp = allDispositions.find(d => d.name === lookupKey);
		if (matchingDisp) {
			const collectNested = (opts?: NestedOption[]) => {
				if (!opts || !Array.isArray(opts)) return;
				opts.forEach(opt => {
					if (opt.value) {
						optionsMap.set(opt.value, { value: opt.value, label: opt.value });
					}
					if (opt.subLabel && !optionsMap.has(opt.subLabel)) {
						optionsMap.set(opt.subLabel, { value: opt.subLabel, label: `Label: ${opt.subLabel}` });
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
	}, [reportData, formData.dataSourceName, selectedCategory, campaignData?.dashboardSettings]);

	const handleDataSourceChange = (value: string) => {
		setSelectedCategory(value);
		setSelectedSubKey('');
		setSelectedKeys([]);
		setFormData(prev => ({
			...prev,
			dataSourceName: value,
			title: isTitleManual ? prev.title : value,
		}));
	};

	const handleTitleChange = (value: string) => {
		setIsTitleManual(true);
		setFormData(prev => ({ ...prev, title: value }));
	};

	const handleResetTitle = () => {
		const defaultTitle = selectedSubKey || selectedCategory || formData.dataSourceName || '';
		setIsTitleManual(false);
		setFormData(prev => ({ ...prev, title: defaultTitle }));
	};

	const widgetTitleOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();
		optionsMap.set('Total Dispositions', { value: 'Total Dispositions', label: 'Total Dispositions (Overall)' });
		optionsMap.set('Total Calls', { value: 'Total Calls', label: 'Total Calls (Overall)' });

		if (reportData?.data?.breakdown) {
			Object.keys(reportData.data.breakdown).forEach(key => {
				optionsMap.set(key, { value: key, label: key });
			});
		}

		if (campaignData?.dashboardSettings?.callOutcomes) {
			campaignData.dashboardSettings.callOutcomes.forEach((outcome: { name: string }) => {
				if (outcome?.name) {
					optionsMap.set(outcome.name, { value: outcome.name, label: outcome.name });
				}
			});
		}

		const dashboardSettings = campaignData?.dashboardSettings;
		const allDispositions = getAllCampaignDispositions(dashboardSettings);

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
								optionsMap.set(opt.subLabel, { value: opt.subLabel, label: `${disposition.name} Header: ${opt.subLabel}` });
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

		return Array.from(optionsMap.values());
	}, [campaignData?.dashboardSettings, reportData]);



	const isValueAutoCalculated = useMemo(() => {
		const source = formData.dataSourceName;
		const dashboardSettings = campaignData?.dashboardSettings;
		// Find in both direct and bucketed dispositions
		const allDispositions: Array<{ name: string; color?: string }> = [...(dashboardSettings?.dispositions || [])];
		if (dashboardSettings?.buckets && Array.isArray(dashboardSettings.buckets)) {
			dashboardSettings.buckets.forEach((bucket: { dispositions?: Array<{ name: string; color?: string }> }) => {
				if (bucket && Array.isArray(bucket.dispositions)) {
					bucket.dispositions.forEach((disp: { name: string; color?: string }) => {
						if (disp && disp.name && !allDispositions.some(d => d.name === disp.name)) {
							allDispositions.push(disp);
						}
					});
				}
			});
		}
		const isDisposition = allDispositions.some((d: { name: string }) => d.name === source);
		const isOutcome = dashboardSettings?.callOutcomes?.some((o: { name: string }) => o.name === source);
		return isDisposition || isOutcome || (reportData?.data?.breakdown && reportData.data.breakdown[source!] !== undefined);
	}, [formData.dataSourceName, campaignData, reportData]);

	const handleSave = () => {
		if (formData.title.trim() && widget) {
			onSave({
				...widget,
				...formData,
			});
			onClose();
		}
	};

	const handleCancel = () => {
		if (widget) {
			const sourceName = widget.dataSourceName || widget.title;
			setFormData({
				title: widget.title || '',
				value: widget.value || 0,
				color: widget.color || '#050711',
				callOutcome: widget.callOutcome,
				subKey: widget.subKey || '',
				dataSourceName: sourceName,
			});
			setSelectedKeys([]);
		}
		onClose();
	};

	const handleCheckboxChange = (key: string, checked: boolean) => {
		if (checked) {
			setSelectedKeys(prev => [...prev, key]);
		} else {
			setSelectedKeys(prev => prev.filter(k => k !== key));
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			title="Edit Widget"
			size="md"
		>
			<div className="p-6 space-y-4">
				<Dropdown
					label="Data Source"
					value={selectedCategory || formData.dataSourceName}
					onChange={(value) => handleDataSourceChange(Array.isArray(value) ? value[0] : value)}
					options={widgetTitleOptions}
					placeholder="Select data source"
				/>

				{subKeyOptions.length > 0 && (
					<div className="space-y-2">
						<label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
							Aggregation Options (Select to sum)
						</label>
						<div className="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-[var(--radius)] p-3 flex flex-col gap-3" style={{ backgroundColor: 'var(--card-bg)' }}>
							{subKeyOptions.map(opt => (
								<Checkbox
									key={opt.value}
									size="small"
									label={opt.label}
									checked={selectedKeys.includes(opt.value)}
									onChange={(checked) => handleCheckboxChange(opt.value, checked)}
								/>
							))}
						</div>
					</div>
				)}

				<div className="space-y-1">
					<div className="flex justify-between items-center">
						<label className="block text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
							Display Title
						</label>
						{isTitleManual && (
							<button
								onClick={handleResetTitle}
								className="text-[8px] md:text-[10px] text-blue-500 hover:text-blue-700 font-medium"
							>
								Reset to source name
							</button>
						)}
					</div>
					<Input
						value={formData.title}
						onChange={handleTitleChange}
						placeholder="Enter widget title"
					/>
				</div>

				<Input
					label="Widget Value"
					type="number"
					value={formData.value.toString()}
					onChange={(value) => setFormData(prev => ({ ...prev, value: Number(value) }))}
					placeholder="Enter widget value"
					disabled={isValueAutoCalculated}
					className={isValueAutoCalculated ? 'opacity-60 cursor-not-allowed' : ''}
				/>
				{isValueAutoCalculated && (
					<p className="text-[8px] md:text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
						Value is automatically calculated from data source
					</p>
				)}

				<ColorPicker
					label="Widget Color"
					value={formData.color}
					onChange={(color) => setFormData(prev => ({ ...prev, color }))}
				/>
			</div>

			{/* Footer */}
			<div
				className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 rounded-b-[var(--radius)]"
				style={{ borderColor: 'var(--light-gray)' }}
			>
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
					disabled={!formData.title.trim()}
				>
					Save Changes
				</Button>
			</div>
		</Modal>
	);
};

export default EditWidgetModal;
