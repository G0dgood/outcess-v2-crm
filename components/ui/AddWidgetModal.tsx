'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import { ColorPicker } from './ColorPicker';
import { Modal } from './Modal';
import { getOfflineDispositions, getSyncedDispositions, DispositionFieldEntry } from '@/utils/offlineDispositions';
import type { Widget } from '@/contexts/SetupContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useSocket } from '@/contexts/SocketContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useGetDashboardDispositionsByLineOfBusinessAndAgentIdReportQuery, useGetAllDashboardDispositionsByLineOfBusinessReportQuery } from '@/store/services/dispositionApi';

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
	const { lineOfBusinessData } = useLineOfBusiness();
	const { user } = useUserInfo();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: primaryColor,
		subKey: '',
	});
	const [selectedSubKey, setSelectedSubKey] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('');

	// API Data Fetching
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

	// Calculate value based on selected disposition field
	useEffect(() => {
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
		const disposition = dashboardSettings?.dispositions?.find((d: { name: string }) => d.name === formData.title);
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === formData.title);

		// Check if it's from API report
		if (reportData?.data?.breakdown) {
			const breakdown = reportData.data.breakdown;

			// Use selectedCategory for lookup if available, otherwise fallback to title
			const lookupKey = selectedCategory || formData.title;

			// 1. Direct Lookup
			if (breakdown[lookupKey] !== undefined) {
				const reportValue = breakdown[lookupKey];
				if (typeof reportValue === 'object' && reportValue !== null) {
					// It's a nested object, check if subKey is selected
					if (selectedSubKey && reportValue[selectedSubKey] !== undefined) {
						// Construct composite key: Category:::Key
						const compositeSubKey = `${lookupKey}:::${selectedSubKey}`;
						setFormData(prev => ({
							...prev,
							title: selectedSubKey, // Rename title to sub-option for better UX
							value: Number(reportValue[selectedSubKey]),
							subKey: compositeSubKey,
						}));
					} else {
						// If no subKey selected, sum all values
						const total = Object.values(reportValue).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
						setFormData(prev => ({ ...prev, value: total, subKey: '' }));
					}
				} else {
					setFormData(prev => ({ ...prev, value: Number(reportValue), subKey: '' }));
				}
				return;
			}


			// 2. Deep Lookup (Search for Title in all nested objects)
			// This is needed if the Title was already updated to the subKey name (e.g. "Connected")
			let deepMatchValue: number | undefined;
			Object.values(breakdown).some((categoryValue) => {
				if (typeof categoryValue === 'object' && categoryValue !== null) {
					const val = (categoryValue as Record<string, unknown>)[formData.title];
					if (val !== undefined) {
						deepMatchValue = Number(val);
						return true;
					}
				}
				return false;
			});

			if (deepMatchValue !== undefined) {
				const finalValue = Number(deepMatchValue);
				setFormData(prev => ({ ...prev, value: finalValue, subKey: '' }));
				return;
			}
		}

		if (disposition) {
			// Get all dispositions (offline + synced)
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];

			// Count dispositions with this category
			const count = allDispositions.filter(disp => {
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					const field = disp.dispositionData.find((f: DispositionFieldEntry) => f.fieldName === disposition.name);
					if (field) {
						const value = field.fieldValue;
						return value && value.toString().trim() !== '' && value !== '-';
					}
				}
				// Fallback for direct property access
				const fieldValue = disp[disposition.name as keyof typeof disp];
				return fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-';
			}).length;

			setFormData(prev => ({ ...prev, value: count }));
		} else if (outcome) {
			// Count call outcomes
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

			setFormData(prev => ({ ...prev, value: count }));
		} else {
			// For other titles, keep the manual value or set to 0
			if (formData?.value === 0 && formData?.title) {
				// Don't reset if user manually set a value
			}
		}
	}, [formData?.title, formData?.value, lineOfBusinessData?.lineOfBusiness?.dashboardSettings, reportData, selectedSubKey, selectedCategory]);

	// Build dropdown options from available data
	const widgetTitleOptions = useMemo(() => {
		const optionsMap = new Map<string, { value: string; label: string }>();

		// Add API report keys
		if (reportData?.data?.breakdown) {
			Object.keys(reportData.data.breakdown).forEach(key => {
				optionsMap.set(key, { value: key, label: key });
			});
		}

		// Add call outcomes if available
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.forEach((outcome: { name: string }) => {
				if (outcome?.name) {
					optionsMap.set(outcome.name, { value: outcome.name, label: outcome.name });
				}
			});
		}

		// Add disposition categories if available
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions?.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions?.forEach((disposition: { name: unknown }) => {
				const name = disposition?.name as string;
				if (name) {
					optionsMap.set(name, { value: name, label: name });
				}
			});
		}

		return Array.from(optionsMap.values());
	}, [lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes, lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions, reportData]);

	const subKeyOptions = useMemo(() => {
		const lookupKey = selectedCategory || formData.title;
		if (!reportData?.data?.breakdown || !lookupKey) return [];
		const reportValue = reportData.data.breakdown[lookupKey];
		if (typeof reportValue === 'object' && reportValue !== null) {
			return Object.keys(reportValue).map(key => ({
				value: key,
				label: key,
			}));
		}
		return [];
	}, [reportData, formData.title, selectedCategory]);

	const handleInputChange = (field: string) => (value: string | number) => {
		if (field === 'title') {
			setSelectedCategory(value as string);
			setSelectedSubKey(''); // Reset subKey when category changes
		}
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const isValueAutoCalculated = useMemo(() => {
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
		const isDisposition = dashboardSettings?.dispositions?.some((d: { name: string }) => d.name === formData.title);
		const isOutcome = dashboardSettings?.callOutcomes?.some((o: { name: string }) => o.name === formData.title);

		return isDisposition || isOutcome;
	}, [formData?.title, lineOfBusinessData]);

	const handleSave = () => {
		if (formData?.title.trim()) {
			onSave(formData);
			// Reset form
			setFormData({
				title: '',
				value: 0,
				color: '#050711',
				subKey: '',
			});
			setSelectedSubKey('');
			onClose();
		}
	};

	const handleCancel = () => {
		// Reset form
		setFormData({
			title: '',
			value: 0,
			color: '#050711',
			subKey: '',
		});
		setSelectedSubKey('');
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
					label="Widget Title"
					value={selectedCategory || formData.title}
					onChange={(value) => handleInputChange('title')(Array.isArray(value) ? value[0] : value)}
					options={widgetTitleOptions}
					placeholder="Select widget title"
				/>

				{subKeyOptions.length > 0 && (
					<Dropdown
						label="Select Option"
						value={selectedSubKey}
						onChange={(value) => setSelectedSubKey(Array.isArray(value) ? value[0] : value)}
						options={subKeyOptions}
						placeholder="Select specific option"
					/>
				)}

				<Input
					label="Widget Value"
					type="number"
					value={formData.value.toString()}
					onChange={(value) => handleInputChange('value')(Number(value))}
					placeholder="Enter widget value"
					disabled={isValueAutoCalculated}
					className={isValueAutoCalculated ? 'opacity-60 cursor-not-allowed' : ''}
				/>
				{isValueAutoCalculated && (
					<p className="text-[8px] md:text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
						Value is automatically calculated from disposition data
					</p>
				)}

				<ColorPicker
					label="Widget Color"
					value={formData.color}
					onChange={handleInputChange('color')}
				/>
			</div>

			{/* Footer */}
			<div
				className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
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