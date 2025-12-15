'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import { ColorPicker } from './ColorPicker';
import { Modal } from './Modal';
import { useSetup } from '@/contexts/SetupContext';
import { getOfflineDispositions, getSyncedDispositions } from '@/utils/offlineDispositions';
import type { Widget } from '@/contexts/SetupContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface AddWidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (widget: Omit<Widget, 'id'>) => void;
}

// Disposition field mappings
const DISPOSITION_FIELDS = [
	{ value: 'Call Answered', label: 'Call Answered', fieldKey: 'callAnswered' },
	{ value: 'Reason For Non Payment', label: 'Reason For Non Payment', fieldKey: 'reasonForNonPayment' },
	{ value: 'Commitment Date', label: 'Commitment Date', fieldKey: 'commitmentDate' },
	{ value: 'Amount To Pay', label: 'Amount To Pay', fieldKey: 'amountToPay' },
	{ value: 'Reason For Not Watching', label: 'Reason For Not Watching', fieldKey: 'reasonForNotWatching' },
];

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: primaryColor,
	});

	// Calculate value based on selected disposition field
	useEffect(() => {
		const selectedField = DISPOSITION_FIELDS.find(f => f.value === formData.title);
		if (selectedField) {
			// Get all dispositions (offline + synced)
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];

			// Count dispositions that have a value for this field
			const count = allDispositions.filter(disp => {
				const fieldValue = disp[selectedField.fieldKey as keyof typeof disp];
				return fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-';
			}).length;

			setFormData(prev => ({ ...prev, value: count }));
		} else if (formData.title === 'Pending Dispositions') {
			// Special case for pending dispositions
			const pendingCount = getOfflineDispositions().filter(d => d.status === 'pending').length;
			setFormData(prev => ({ ...prev, value: pendingCount }));
		} else if (formData.title === 'Total Dispositions') {
			// Count all dispositions
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			setFormData(prev => ({ ...prev, value: offlineDispositions.length + syncedDispositions?.length }));
		} else {
			// For other titles, keep the manual value or set to 0
			if (formData?.value === 0 && formData?.title) {
				// Don't reset if user manually set a value
			}
		}
	}, [formData?.title]);

	// Build dropdown options from available data
	const widgetTitleOptions = useMemo(() => {
		const options: Array<{ value: string; label: string }> = [];

		// Add disposition fields first
		options.push(...DISPOSITION_FIELDS.map(f => ({ value: f.value, label: f.label })));

		// Add common/default widget titles
		const commonTitles = [
			{ value: 'Total Calls', label: 'Total Calls' },
			{ value: 'Pending Dispositions', label: 'Pending Dispositions' },
			{ value: 'Total Dispositions', label: 'Total Dispositions' },
			{ value: 'Completed Calls', label: 'Completed Calls' },
			{ value: 'Active Agents', label: 'Active Agents' },
			{ value: 'Average Call Duration', label: 'Average Call Duration' },
		];

		options.push(...commonTitles);

		// Add call outcomes if available
		if (lineOfBusinessData?.dashboardSettings?.callOutcomes && lineOfBusinessData?.dashboardSettings?.callOutcomes.length > 0) {
			lineOfBusinessData?.dashboardSettings?.callOutcomes.forEach((outcome: { name: string }) => {
				options.push({
					value: outcome?.name,
					label: outcome?.name,
				});
			});
		}

		// Add disposition categories if available
		if (lineOfBusinessData?.dashboardSettings?.dispositions && lineOfBusinessData?.dashboardSettings?.dispositions?.length > 0) {
			lineOfBusinessData?.dashboardSettings?.dispositions.forEach((disposition: { name: any; }) => {
				options.push({
					value: disposition?.name,
					label: disposition?.name,
				});
			});
		}

		return options;
	}, [lineOfBusinessData?.dashboardSettings?.callOutcomes, lineOfBusinessData?.dashboardSettings?.dispositions]);

	const handleInputChange = (field: string) => (value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const isValueAutoCalculated = useMemo(() => {
		return DISPOSITION_FIELDS.some(f => f.value === formData.title) ||
			formData?.title === 'Pending Dispositions' ||
			formData?.title === 'Total Dispositions';
	}, [formData?.title]);

	const handleSave = () => {
		if (formData?.title.trim()) {
			onSave(formData);
			// Reset form
			setFormData({
				title: '',
				value: 0,
				color: '#050711',
			});
			onClose();
		}
	};

	const handleCancel = () => {
		// Reset form
		setFormData({
			title: '',
			value: 0,
			color: '#050711',
		});
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
					value={formData.title}
					onChange={(value) => handleInputChange('title')(Array.isArray(value) ? value[0] : value)}
					options={widgetTitleOptions}
					placeholder="Select widget title"
				/>

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
					<p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
					Add Widget
				</Button>
			</div>
		</Modal>
	);
};

export default AddWidgetModal;

