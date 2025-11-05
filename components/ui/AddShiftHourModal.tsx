'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import { Cross2Icon } from '@radix-ui/react-icons';

interface ShiftHour {
	id?: string;
	shiftName: string;
	shiftDays: string;
	shiftStartTime: string;
	shiftEndTime: string;
	noOfUsers: number;
}

interface AddShiftHourModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: (data: ShiftHour) => void;
	initialData?: ShiftHour | null;
}

export const AddShiftHourModal: React.FC<AddShiftHourModalProps> = ({
	isOpen,
	onClose,
	onSave,
	initialData,
}) => {
	const [formData, setFormData] = useState<ShiftHour>({
		shiftName: '',
		shiftDays: '',
		shiftStartTime: '',
		shiftEndTime: '',
		noOfUsers: 0,
	});

	useEffect(() => {
		if (isOpen && initialData) {
			setFormData(initialData);
		} else if (isOpen && !initialData) {
			setFormData({
				shiftName: '',
				shiftDays: '',
				shiftStartTime: '',
				shiftEndTime: '',
				noOfUsers: 0,
			});
		}
	}, [isOpen, initialData]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleInputChange = (field: keyof ShiftHour) => (value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		if (formData.shiftName && formData.shiftDays && formData.shiftStartTime && formData.shiftEndTime) {
			onSave?.(formData);
			setFormData({
				shiftName: '',
				shiftDays: '',
				shiftStartTime: '',
				shiftEndTime: '',
				noOfUsers: 0,
			});
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			shiftName: '',
			shiftDays: '',
			shiftStartTime: '',
			shiftEndTime: '',
			noOfUsers: 0,
		});
		onClose();
	};

	const dayOptions = [
		{ value: 'monday-friday', label: 'Monday - Friday' },
		{ value: 'monday-saturday', label: 'Monday - Saturday' },
		{ value: 'monday-sunday', label: 'Monday - Sunday' },
		{ value: 'tuesday-saturday', label: 'Tuesday - Saturday' },
		{ value: 'custom', label: 'Custom' },
	];

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div className="bg-white shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900">
						{initialData ? 'Edit Shift Hour' : 'New Shift Hour'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<Input
						label="Shift Name"
						placeholder="Enter shift name"
						value={formData.shiftName}
						onChange={(value) => handleInputChange('shiftName')(value)}
						required
					/>

					<Dropdown
						label="Shift Days"
						placeholder="Select shift days"
						options={dayOptions}
						value={formData.shiftDays}
						onChange={(value) => handleInputChange('shiftDays')(value)}
						required
					/>

					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Start Time"
							placeholder="HH:MM"
							value={formData.shiftStartTime}
							onChange={(value) => handleInputChange('shiftStartTime')(value)}
							type="time"
							required
						/>
						<Input
							label="End Time"
							placeholder="HH:MM"
							value={formData.shiftEndTime}
							onChange={(value) => handleInputChange('shiftEndTime')(value)}
							type="time"
							required
						/>
					</div>

					<Input
						label="No of Users"
						placeholder="Enter number of users"
						value={formData.noOfUsers.toString()}
						onChange={(value) => handleInputChange('noOfUsers')(parseInt(value) || 0)}
						type="number"
					/>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t border-gray-200 shrink-0">
					<Button
						variant="danger"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
						disabled={!formData.shiftName || !formData.shiftDays || !formData.shiftStartTime || !formData.shiftEndTime}
					>
						{initialData ? 'Update' : 'Create'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddShiftHourModal;

