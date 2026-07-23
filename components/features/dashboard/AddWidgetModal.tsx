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

	// Calculate value based on selected disposition field / sub-option
	useEffect(() => {
		const lookupKey = selectedCategory || formData.dataSourceName;
		if (!lookupKey) return;

		const dashboardSettings = campaignData?.dashboardSettings;
		const allConfigured = getAllCampaignDispositions(dashboardSettings);
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === lookupKey);

		// Check if it's from API report
		if (reportData?.data?.breakdown) {
			const breakdown = reportData.data.breakdown;
			if (breakdown[lookupKey] !== undefined) {
				const reportValue = breakdown[lookupKey];
				if (typeof reportValue === 'object' && reportValue !== null) {
					if (selectedSubKey && reportValue[selectedSubKey] !== undefined) {
						const compositeSubKey = `${lookupKey}:::${selectedSubKey}`;
						setFormData(prev => ({
							...prev,
							title: isTitleManual ? prev.title : selectedSubKey,
							value: Number(reportValue[selectedSubKey]),
							subKey: compositeSubKey,
							dataSourceName: lookupKey,
						}));
					} else {
						const total = Object.values(reportValue).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
						setFormData(prev => ({
							...prev,
							title: isTitleManual ? prev.title : lookupKey,
							value: total,
							subKey: '',
							dataSourceName: lookupKey,
						}));
					}
				} else {
					setFormData(prev => ({
						...prev,
						title: isTitleManual ? prev.title : lookupKey,
						value: Number(reportValue),
						subKey: '',
						dataSourceName: lookupKey,
					}));
				}
				return;
			}
		}

		const offlineDispositions = getOfflineDispositions();
		const syncedDispositions = getSyncedDispositions();
		const allDispositions = [...offlineDispositions, ...syncedDispositions];
		const targetKey = selectedSubKey || lookupKey;

		const count = allDispositions.filter(disp => {
			const fields = disp.dispositionData || disp.fillDisposition;
			if (fields && Array.isArray(fields)) {
				return fields.some((f: DispositionFieldEntry) => {
					if (!f.fieldName || f.fieldValue === undefined || f.fieldValue === null) return false;
					const dispDef = allConfigured.find(d => d.name === f.fieldName);
					const levels = resolveMultiDropdownLevels(f.fieldName, String(f.fieldValue), dispDef);
					return levels.some(lvl =>
						lvl.header.toLowerCase() === targetKey.toLowerCase() ||
						lvl.value.toLowerCase() === targetKey.toLowerCase() ||
						f.fieldName.toLowerCase() === targetKey.toLowerCase()
					);
				});
			}
			if (outcome && fields && Array.isArray(fields)) {
				return (fields as DispositionFieldEntry[]).some((f: DispositionFieldEntry) => f.fieldValue && f.fieldValue.toString().toLowerCase() === outcome.name.toLowerCase());
			}
			return false;
		}).length;

		setFormData(prev => ({
			...prev,
			title: isTitleManual ? prev.title : (selectedSubKey ? `${lookupKey} - ${selectedSubKey}` : lookupKey),
			value: count,
			subKey: selectedSubKey ? `${lookupKey}:::${selectedSubKey}` : prev.subKey,
			dataSourceName: lookupKey,
		}));
	}, [formData.dataSourceName, campaignData?.dashboardSettings, reportData, selectedSubKey, selectedCategory, isTitleManual]);

	// Build dropdown options from available data
	const widgetTitleOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();

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

		return isDisposition || isOutcome || (reportData?.data?.breakdown && reportData.data.breakdown[source!] !== undefined);
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
		setIsTitleManual(false);
		onClose();
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
					<Dropdown
						label="Aggregation Option"
						value={selectedSubKey}
						onChange={(value) => {
							const val = Array.isArray(value) ? value[0] : value;
							setSelectedSubKey(val);
							if (!isTitleManual) {
								setFormData(prev => ({ ...prev, title: val }));
							}
						}}
						options={subKeyOptions}
						placeholder="Select specific option"
					/>
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