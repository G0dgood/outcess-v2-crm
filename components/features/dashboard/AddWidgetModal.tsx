'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Modal } from '@/components/ui/Modal';
import { getOfflineDispositions, getSyncedDispositions, DispositionFieldEntry } from '@/utils/offlineDispositions';
import { Widget, DispositionCategory, NestedOption } from '@/types/dashboard';
import { resolveMultiDropdownLevels, getAllCampaignDispositions } from '@/utils/dispositionMultiDropdown';
import { useCampaign } from '@/contexts/CampaignContext';
import { useSocket } from '@/contexts/SocketContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDashboardDispositionsByCampaignAndAgentIdReportQuery, useGetAllDashboardDispositionsByCampaignReportQuery } from '@/store/services/dispositionApi';

interface AddWidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (widget: Omit<Widget, 'id'>) => void;
}

// Disposition field mappings removed


export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const { isOffline } = useSocket();
	const { campaignData } = useCampaign();
	const { user } = useUserInfo();
	const primaryColor = campaignData?.primaryColor || '#050711';
	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: primaryColor,
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

	// Calculate value based on selected disposition field / sub-option checkboxes
	useEffect(() => {
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
				// Single option
				const singleKey = selectedKeys[0];
				compositeSubKey = `${lookupKey}:::${singleKey}`;

				if (reportData?.data?.breakdown?.[lookupKey]) {
					const reportValue = reportData.data.breakdown[lookupKey];
					if (typeof reportValue === 'object' && reportValue !== null) {
						calculatedValue = Number(reportValue[singleKey]) || 0;
					}
				} else {
					// Offline count
					calculatedValue = getCountForKeys(lookupKey, [singleKey]);
				}
			} else {
				// Multi-option sum
				compositeSubKey = `${lookupKey}:::sum:::${selectedKeys.join(',')}`;

				if (reportData?.data?.breakdown?.[lookupKey]) {
					const reportValue = reportData.data.breakdown[lookupKey];
					if (typeof reportValue === 'object' && reportValue !== null) {
						calculatedValue = selectedKeys.reduce((acc, k) => acc + (Number(reportValue[k]) || 0), 0);
					}
				} else {
					// Offline count
					calculatedValue = getCountForKeys(lookupKey, selectedKeys);
				}
			}
		} else {
			// No sub-keys selected: sum all options
			if (reportData?.data?.breakdown?.[lookupKey]) {
				const reportValue = reportData.data.breakdown[lookupKey];
				if (typeof reportValue === 'object' && reportValue !== null) {
					calculatedValue = Object.values(reportValue).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
				} else {
					calculatedValue = Number(reportValue) || 0;
				}
			} else {
				// Sum all options of the category
				const matchingDisp = allConfigured.find(d => d.name === lookupKey);
				const optionsList = matchingDisp?.dropdownOptions || (matchingDisp as any)?.options || [];
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
	}, [selectedCategory, selectedKeys, reportData, isTitleManual, campaignData]);

	// Build dropdown options from available data
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

	const isValueAutoCalculated = useMemo(() => {
		const dashboardSettings = campaignData?.dashboardSettings;
		const source = formData.dataSourceName;
		const isDisposition = dashboardSettings?.dispositions?.some((d: { name: string }) => d.name === source);
		const isOutcome = dashboardSettings?.callOutcomes?.some((o: { name: string }) => o.name === source);

		return isDisposition || isOutcome || source === 'Total Dispositions' || source === 'Total Calls' || (reportData?.data?.breakdown && reportData.data.breakdown[source!] !== undefined);
	}, [formData.dataSourceName, campaignData, reportData]);

	const handleSave = () => {
		if (formData.title.trim()) {
			onSave(formData);
			setFormData({
				title: '',
				value: 0,
				color: primaryColor,
				subKey: '',
				dataSourceName: '',
			});
			setSelectedSubKey('');
			setSelectedCategory('');
			setSelectedKeys([]);
			setIsTitleManual(false);
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			title: '',
			value: 0,
			color: primaryColor,
			subKey: '',
			dataSourceName: '',
		});
		setSelectedSubKey('');
		setSelectedCategory('');
		setSelectedKeys([]);
		setIsTitleManual(false);
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
			title="Add New Widget"
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
						<div className="max-h-48 overflow-y-auto border dark:border-gray-700 rounded-[var(--radius)] p-3 space-y-2" style={{ backgroundColor: 'var(--card-bg)' }}>
							{subKeyOptions.map(opt => (
								<label key={opt.value} className="flex items-center gap-2 text-sm font-medium cursor-pointer text-white">
									<input
										type="checkbox"
										checked={selectedKeys.includes(opt.value)}
										onChange={(e) => handleCheckboxChange(opt.value, e.target.checked)}
										className="rounded dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-[var(--accent)] focus:ring-[var(--accent)]"
									/>
									<span>{opt.label}</span>
								</label>
							))}
						</div>
					</div>
				)}

				<Input
					label="Display Title"
					value={formData.title}
					onChange={handleTitleChange}
					placeholder="Enter widget title"
				/>

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
					{isOffline ? 'Save Offline' : 'Add Widget'}
				</Button>
			</div>
		</Modal>
	);
};

export default AddWidgetModal;