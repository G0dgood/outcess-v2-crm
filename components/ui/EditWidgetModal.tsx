'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import { ColorPicker } from './ColorPicker';
import { Modal } from './Modal';
import type { Widget } from '@/contexts/SetupContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
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
	const { lineOfBusinessData } = useLineOfBusiness();
	const [formData, setFormData] = useState<Omit<Widget, 'id'>>({
		title: '',
		value: 0,
		color: '#050711',
	});

	// Update form data when widget changes
	useEffect(() => {
		if (widget) {
			setFormData({
				title: widget.title || '',
				value: widget.value || 0,
				color: widget.color || '#050711',
				callOutcome: widget.callOutcome,
			});
		}
	}, [widget]);

	const handleInputChange = (field: string) => (value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const widgetTitleOptions = useMemo(() => {
		const options: Array<{ value: string; label: string }> = [];
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes.forEach((outcome: { name: string }) => {
				options.push({
					value: outcome?.name,
					label: outcome?.name,
				});
			});
		}
		if (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions && lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions?.length > 0) {
			lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions.forEach((disposition: { name: unknown }) => {
				const name = disposition?.name as string;
				options.push({
					value: name,
					label: name,
				});
			});
		}
		return options;
	}, [lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.callOutcomes, lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions]);

	useEffect(() => {
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
		const disposition = dashboardSettings?.dispositions?.find((d: { name: string }) => d.name === formData.title);
		const outcome = dashboardSettings?.callOutcomes?.find((o: { name: string }) => o.name === formData.title);
		if (disposition) {
			const offlineDispositions = getOfflineDispositions();
			const syncedDispositions = getSyncedDispositions();
			const allDispositions = [...offlineDispositions, ...syncedDispositions];
			const count = allDispositions.filter(disp => {
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					const field = disp.dispositionData.find((f: DispositionFieldEntry) => f.fieldName === disposition.name);
					if (field) {
						const value = field.fieldValue;
						return value && value.toString().trim() !== '' && value !== '-';
					}
				}
				const fieldValue = disp[disposition.name as keyof typeof disp];
				return fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-';
			}).length;
			setFormData(prev => ({ ...prev, value: count }));
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
			setFormData(prev => ({ ...prev, value: count }));
		}
	}, [formData?.title, lineOfBusinessData?.lineOfBusiness?.dashboardSettings]);

	const isValueAutoCalculated = useMemo(() => {
		const dashboardSettings = lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
		const isDisposition = dashboardSettings?.dispositions?.some((d: { name: string }) => d.name === formData.title);
		const isOutcome = dashboardSettings?.callOutcomes?.some((o: { name: string }) => o.name === formData.title);
		return isDisposition || isOutcome;
	}, [formData?.title, lineOfBusinessData]);

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
			setFormData({
				title: widget.title || '',
				value: widget.value || 0,
				color: widget.color || '#050711',
				callOutcome: widget.callOutcome,
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
					Save Changes
				</Button>
			</div>
		</Modal>
	);
};

export default EditWidgetModal;
