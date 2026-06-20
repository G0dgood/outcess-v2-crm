'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import TimeInput from './TimeInput';
import { useCampaign } from '@/contexts/CampaignContext';
import { Cross2Icon } from '@radix-ui/react-icons';

export interface ShiftHour {
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
	onSave?: (data: ShiftHour) => void | Promise<void>;
	initialData?: ShiftHour | null;
}

export const AddShiftHourModal: React.FC<AddShiftHourModalProps> = ({
	isOpen,
	onClose,
	onSave,
	initialData,
}) => {
	const { campaignData } = useCampaign();

	const [formData, setFormData] = useState<ShiftHour>({
		shiftName: '',
		shiftDays: '',
		shiftStartTime: '',
		shiftEndTime: '',
		noOfUsers: 0,
	});

	useEffect(() => {
		if (isOpen && initialData) {
			const dayOptions = [
				{ value: 'monday-friday', label: 'Monday - Friday' },
				{ value: 'monday-saturday', label: 'Monday - Saturday' },
				{ value: 'monday-sunday', label: 'Monday - Sunday' },
				{ value: 'tuesday-saturday', label: 'Tuesday - Saturday' },
				{ value: 'custom', label: 'Custom' },
			];

			const matchedOption = dayOptions.find(
				(option) => option.label === initialData.shiftDays || option.value === initialData.shiftDays
			);

			setFormData({
				...initialData,
				shiftDays: matchedOption ? matchedOption.value : initialData.shiftDays,
			});
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

	const dayOptions = (() => {
		const businessHours = (campaignData as { businessHours?: unknown })?.businessHours as
			| { name?: string; businessDays?: string[] }[]
			| { name?: string; businessDays?: string[] }
			| undefined;

		const fallbackOptions = [
			{ value: 'monday-friday', label: 'Monday - Friday' },
			{ value: 'monday-saturday', label: 'Monday - Saturday' },
			{ value: 'monday-sunday', label: 'Monday - Sunday' },
			{ value: 'tuesday-saturday', label: 'Tuesday - Saturday' },
			{ value: 'custom', label: 'Custom' },
		];

		if (!businessHours) {
			return fallbackOptions;
		}

		const list = Array.isArray(businessHours) ? businessHours : [businessHours];

		const mapped = list
			.filter((item) => item.businessDays && item.businessDays.length > 0)
			.map((item, index) => ({
				value: item.businessDays!.join(','),
				label: item.name || `Business Hour ${index + 1}`,
			}));

		return mapped.length > 0 ? mapped : fallbackOptions;
	})();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{initialData ? 'Edit Shift Hour' : 'New Shift Hour'}
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
							e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
							e.currentTarget.style.backgroundColor = 'transparent';
						}}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
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
						onChange={(value) => handleInputChange('shiftDays')(Array.isArray(value) ? value.join(',') : value)}
						required
					/>

					<div className="grid grid-cols-2 gap-4">
						<TimeInput
							label="Start Time"
							placeholder="HH:MM"
							value={formData.shiftStartTime}
							onChange={(value) => handleInputChange('shiftStartTime')(value)}
							inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-[var(--radius)]"
							required
						/>
						<TimeInput
							label="End Time"
							placeholder="HH:MM"
							value={formData.shiftEndTime}
							onChange={(value) => handleInputChange('shiftEndTime')(value)}
							inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-[var(--radius)]"
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
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
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
