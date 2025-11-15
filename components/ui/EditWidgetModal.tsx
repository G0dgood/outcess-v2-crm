'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { ColorPicker } from './ColorPicker';
import { Modal } from './Modal';
import type { Widget } from '@/contexts/SetupContext';

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
				<Input
					label="Widget Title"
					value={formData.title}
					onChange={handleInputChange('title')}
					placeholder="Enter widget title"
				/>

				<Input
					label="Widget Value"
					type="number"
					value={formData.value.toString()}
					onChange={(value) => handleInputChange('value')(Number(value))}
					placeholder="Enter widget value"
				/>

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

