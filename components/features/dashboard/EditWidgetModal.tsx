'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Modal } from '@/components/ui/Modal';
import type { Widget } from '@/contexts/SetupContext';
import { useCampaign } from '@/contexts/CampaignContext';
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
	const [isTitleManual, setIsTitleManual] = useState(false);

	// API Data Fetching
	const agentId = user?.id || user?._id || '';
	const campaignId = campaignData?.campaign?._id || campaignData?._id || '';
	const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
	const endDate = new Date().toISOString().split('T')[0];

	const { data: reportDataAgent } = useGetDashboardDispositionsByCampaignAndAgentIdReportQuery(
		{ campaignId: campaignId, agentId, startDate, endDate },
		{ skip: !campaignId || !agentId || !isOpen || isAdmin }
	);

	const { data: reportDataAdmin } = useGetAllDashboardDispositionsByCampaignReportQuery(
		{ campaignId: campaignId, startDate, endDate },
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
				const [category, key] = widget.subKey.split(':::');
				setSelectedCategory(category);
				setSelectedSubKey(key);
				setIsTitleManual(widget.title !== key);
			} else {
				setSelectedCategory(sourceName);
				setSelectedSubKey('');
				setIsTitleManual(widget.title !== sourceName);
			}
		}
	}, [widget, isOpen]);

	// Supplementary sync for late-loading report data
	useEffect(() => {
		if (isOpen && widget && !selectedCategory && reportData?.data?.breakdown) {
			const sourceName = widget.dataSourceName || widget.title;
			if (widget.subKey && widget.subKey.includes(':::')) {
				const [category] = widget.subKey.split(':::');
				setSelectedCategory(category);
			} else {
				setSelectedCategory(sourceName);
			}
		}
	}, [isOpen, widget, reportData, selectedCategory]);

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

	const handleResetTitle = () => {
		const defaultTitle = selectedSubKey || selectedCategory || formData.dataSourceName || '';
		setIsTitleManual(false);
		setFormData(prev => ({ ...prev, title: defaultTitle }));
	};

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

	useEffect(() => {
		const dashboardSettings = campaignData?.campaign?.dashboardSettings;
		const lookupKey = selectedCategory || formData.dataSourceName;

		// Find disposition from either direct or bucketed dispositions
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
		const disposition = allDispositions.find((d: { name: string }) => d.name === lookupKey);
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === lookupKey);

		if (reportData?.data?.breakdown && lookupKey && reportData.data.breakdown[lookupKey] !== undefined) {
			const reportValue = reportData.data.breakdown[lookupKey];
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

	const isValueAutoCalculated = useMemo(() => {
		const source = formData.dataSourceName;
		const dashboardSettings = campaignData?.campaign?.dashboardSettings;
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
		}
		onClose();
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
