'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Modal } from '@/components/ui/Modal';
import { getOfflineDispositions, getSyncedDispositions, DispositionFieldEntry } from '@/utils/offlineDispositions';
import type { Widget } from '@/contexts/SetupContext';
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
	const campaignId = campaignData?.campaign?._id || campaignData?._id || '';
	const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = new Date().toISOString().split('T')[0];

	const { isAdmin } = usePrivilege();

	const { data: reportDataAgent } = useGetDashboardDispositionsByCampaignAndAgentIdReportQuery(
		{ campaignId: campaignId, agentId, startDate, endDate },
		{ skip: !campaignId || !agentId || !isOpen || isAdmin }
	);

	const { data: reportDataAdmin } = useGetAllDashboardDispositionsByCampaignReportQuery(
		{ campaignId: campaignId, startDate, endDate },
		{ skip: !campaignId || !isOpen || !isAdmin }
	);

	const reportData = isAdmin ? reportDataAdmin : reportDataAgent;

	// Calculate value based on selected disposition field
	useEffect(() => {
		const dashboardSettings = campaignData?.campaign?.dashboardSettings;
		const disposition = dashboardSettings?.dispositions?.find((d: { name: string }) => d.name === (selectedCategory || formData.dataSourceName));
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === (selectedCategory || formData.dataSourceName));

		// Check if it's from API report
		if (reportData?.data?.breakdown) {
			const breakdown = reportData.data.breakdown;

			// Use selectedCategory for lookup if available, otherwise fallback to dataSourceName
			const lookupKey = selectedCategory || formData.dataSourceName;

			if (lookupKey && breakdown[lookupKey] !== undefined) {
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

		if (disposition) {
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];

			const count = allDispositions.filter(disp => {
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					const field = disp.dispositionData.find((f: DispositionFieldEntry) => f.fieldName === disposition.name);
					if (field) {
						return field.fieldValue && field.fieldValue.toString().trim() !== '' && field.fieldValue !== '-';
					}
				}
				const fieldValue = disp[disposition.name as keyof typeof disp];
				return fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-';
			}).length;

			setFormData(prev => ({
				...prev,
				title: isTitleManual ? prev.title : disposition.name,
				value: count,
				dataSourceName: disposition.name,
			}));
		} else if (outcome) {
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];

			const count = allDispositions.filter(disp => {
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					return disp.dispositionData.some(f =>
						f.fieldValue && f.fieldValue.toString().toLowerCase() === outcome.name.toLowerCase()
					);
				}
				return false;
			}).length;

			setFormData(prev => ({
				...prev,
				title: isTitleManual ? prev.title : outcome.name,
				value: count,
				dataSourceName: outcome.name,
			}));
		}
	}, [formData.dataSourceName, campaignData?.campaign?.dashboardSettings, reportData, selectedSubKey, selectedCategory, isTitleManual]);

	// Build dropdown options from available data
	const widgetTitleOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();

		if (reportData?.data?.breakdown) {
			Object.keys(reportData.data.breakdown).forEach(key => {
				optionsMap.set(key, { value: key, label: key });
			});
		}

		if (campaignData?.campaign?.dashboardSettings?.callOutcomes) {
			campaignData.campaign.dashboardSettings.callOutcomes.forEach((outcome: { name: string }) => {
				if (outcome?.name) {
					optionsMap.set(outcome.name, { value: outcome.name, label: outcome.name });
				}
			});
		}

		const dashboardSettings = campaignData?.campaign?.dashboardSettings;
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

		if (allDispositions.length > 0) {
			allDispositions.forEach((disposition: { name: string }) => {
				if (disposition?.name) {
					optionsMap.set(disposition.name, { value: disposition.name, label: disposition.name });
				}
			});
		}

		return Array.from(optionsMap.values());
	}, [campaignData?.campaign?.dashboardSettings, reportData]);

	const subKeyOptions = useMemo(() => {
		const lookupKey = selectedCategory || formData.dataSourceName;
		if (!reportData?.data?.breakdown || !lookupKey) return [];
		const reportValue = reportData.data.breakdown[lookupKey];
		if (typeof reportValue === 'object' && reportValue !== null) {
			return Object.keys(reportValue).map(key => ({
				value: key,
				label: key,
			}));
		}
		return [];
	}, [reportData, formData.dataSourceName, selectedCategory]);

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
		const dashboardSettings = campaignData?.campaign?.dashboardSettings;
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