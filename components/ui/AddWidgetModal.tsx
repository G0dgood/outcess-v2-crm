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
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: primaryColor,
	});

	// Calculate value based on selected disposition field
	useEffect(() => {
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
		const disposition = dashboardSettings?.dispositions?.find((d: { name: string }) => d.name === formData.title);
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === formData.title);

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
	}, [formData?.title, formData?.value, lineOfBusinessData?.lineOfBusiness?.dashboardSettings]);

	// Build dropdown options from available data
	const widgetTitleOptions = useMemo(() => {
		const options: Array<{ value: string; label: string }> = [];

		// Add call outcomes if available
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.forEach((outcome: { name: string }) => {
				options.push({
					value: outcome?.name,
					label: outcome?.name,
				});
			});
		}

		// Add disposition categories if available
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions?.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions?.forEach((disposition: { name: unknown }) => {
				const name = disposition?.name as string;
				options.push({
					value: name,
					label: name,
				});
			});
		}

		return options;
	}, [lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes, lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions]);

	const handleInputChange = (field: string) => (value: string | number) => {
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
					{isOffline ? 'Save Offline' : 'Add Widget'}
				</Button>
			</div>
		</Modal>
	);
};

export default AddWidgetModal;
