'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Dropdown from './Dropdown';
import Checkbox from './Checkbox';
import IndividualRadio from './IndividualRadio';
import { Cross2Icon } from '@radix-ui/react-icons';

export interface BusinessHourData {
	businessHourType: '24hours-7days' | '24hours-5days' | 'custom';
	businessTiming?: 'same' | 'different';
	sameStartTime?: string;
	sameEndTime?: string;
	differentHours?: {
		[key: string]: { startTime: string; endTime: string; enabled: boolean };
	};
	businessDays?: string[];
}

interface AddBusinessHourModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: (data: BusinessHourData) => void;
	initialData?: BusinessHourData | null;
}

export const AddBusinessHourModal: React.FC<AddBusinessHourModalProps> = ({
	isOpen,
	onClose,
	onSave,
	initialData,
}) => {
	const [businessHourType, setBusinessHourType] = useState<'24hours-7days' | '24hours-5days' | 'custom'>('24hours-7days');
	const [businessTiming, setBusinessTiming] = useState<'same' | 'different'>('same');
	const [sameStartTime, setSameStartTime] = useState('09:00');
	const [sameEndTime, setSameEndTime] = useState('17:00');
	const [businessDays, setBusinessDays] = useState<string[]>([]);
	const [differentHours, setDifferentHours] = useState<{ [key: string]: { startTime: string; endTime: string; enabled: boolean } }>({
		monday: { startTime: '09:00', endTime: '17:00', enabled: false },
		tuesday: { startTime: '09:00', endTime: '17:00', enabled: false },
		wednesday: { startTime: '09:00', endTime: '17:00', enabled: false },
		thursday: { startTime: '09:00', endTime: '17:00', enabled: false },
		friday: { startTime: '09:00', endTime: '17:00', enabled: false },
		saturday: { startTime: '09:00', endTime: '17:00', enabled: false },
		sunday: { startTime: '09:00', endTime: '17:00', enabled: false },
	});

	const daysOfWeek = [
		{ key: 'monday', label: 'Monday' },
		{ key: 'tuesday', label: 'Tuesday' },
		{ key: 'wednesday', label: 'Wednesday' },
		{ key: 'thursday', label: 'Thursday' },
		{ key: 'friday', label: 'Friday' },
		{ key: 'saturday', label: 'Saturday' },
		{ key: 'sunday', label: 'Sunday' },
	];

	useEffect(() => {
		if (isOpen && initialData) {
			setBusinessHourType(initialData.businessHourType);
			setBusinessTiming(initialData.businessTiming || 'same');
			setSameStartTime(initialData.sameStartTime || '09:00');
			setSameEndTime(initialData.sameEndTime || '17:00');
			setBusinessDays(initialData.businessDays || []);
			if (initialData.differentHours) {
				setDifferentHours(initialData.differentHours);
			}
		} else if (isOpen && !initialData) {
			// Reset to defaults
			setBusinessHourType('24hours-7days');
			setBusinessTiming('same');
			setSameStartTime('09:00');
			setSameEndTime('17:00');
			setBusinessDays([]);
			setDifferentHours({
				monday: { startTime: '09:00', endTime: '17:00', enabled: false },
				tuesday: { startTime: '09:00', endTime: '17:00', enabled: false },
				wednesday: { startTime: '09:00', endTime: '17:00', enabled: false },
				thursday: { startTime: '09:00', endTime: '17:00', enabled: false },
				friday: { startTime: '09:00', endTime: '17:00', enabled: false },
				saturday: { startTime: '09:00', endTime: '17:00', enabled: false },
				sunday: { startTime: '09:00', endTime: '17:00', enabled: false },
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

	const handleDayToggle = (day: string) => {
		setBusinessDays(prev => {
			if (prev.includes(day)) {
				return prev.filter(d => d !== day);
			} else {
				return [...prev, day];
			}
		});

		// Also toggle enabled state for different hours
		if (businessTiming === 'different') {
			setDifferentHours(prev => ({
				...prev,
				[day]: {
					...prev[day],
					enabled: !prev[day].enabled,
				},
			}));
		}
	};

	const handleDifferentHourChange = (day: string, field: 'startTime' | 'endTime', value: string) => {
		setDifferentHours(prev => ({
			...prev,
			[day]: {
				...prev[day],
				[field]: value,
			},
		}));
	};

	const handleSave = () => {
		const data: BusinessHourData = {
			businessHourType,
			businessDays: businessHourType === 'custom' ? businessDays : undefined,
		};

		if (businessHourType === 'custom') {
			data.businessTiming = businessTiming;
			if (businessTiming === 'same') {
				data.sameStartTime = sameStartTime;
				data.sameEndTime = sameEndTime;
			} else {
				data.differentHours = differentHours;
			}
		}

		onSave?.(data);
		onClose();
	};

	const handleCancel = () => {
		onClose();
	};



	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-xl font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Add Business Hour
					</h2>
					<button
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
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Business Hours Section */}
					<div>
						<label
							className="block text-sm font-medium dark:text-gray-200 mb-3"
							style={{ color: 'var(--text-secondary)' }}
						>
							Business Hours
						</label>
						<div className="space-y-3">
							<IndividualRadio
								name="businessHourType"
								value="24hours-7days"
								checked={businessHourType === '24hours-7days'}
								onChange={(value) => setBusinessHourType(value as '24hours-7days' | '24hours-5days' | 'custom')}
								label="24 Hours X 7 days"
							/>
							<IndividualRadio
								name="businessHourType"
								value="24hours-5days"
								checked={businessHourType === '24hours-5days'}
								onChange={(value) => setBusinessHourType(value as '24hours-7days' | '24hours-5days' | 'custom')}
								label="24 Hours X 5 days"
							/>
							<IndividualRadio
								name="businessHourType"
								value="custom"
								checked={businessHourType === 'custom'}
								onChange={(value) => setBusinessHourType(value as '24hours-7days' | '24hours-5days' | 'custom')}
								label="Custom Hour"
							/>
						</div>
					</div>

					{/* Business Timing Section (only shown when Custom Hour is selected) */}
					{businessHourType === 'custom' && (
						<div>
							<label
								className="block text-sm font-medium dark:text-gray-200 mb-3"
								style={{ color: 'var(--text-secondary)' }}
							>
								Business Timing
							</label>
							<div className="space-y-4">
								<IndividualRadio
									name="businessTiming"
									value="same"
									checked={businessTiming === 'same'}
									onChange={(value) => setBusinessTiming(value as 'same' | 'different')}
									label="Same hour everyday"
								/>
								{businessTiming === 'same' && (
									<div className="ml-7 flex items-center gap-3">
										<input
											type="time"
											value={sameStartTime}
											onChange={(e) => setSameStartTime(e.target.value)}
											className="px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
											style={{
												borderColor: 'var(--light-gray)',
												color: 'var(--text-primary)',
												backgroundColor: 'var(--accent-white)'
											}}
										/>
										<span
											className="text-sm dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											to
										</span>
										<input
											type="time"
											value={sameEndTime}
											onChange={(e) => setSameEndTime(e.target.value)}
											className="px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
											style={{
												borderColor: 'var(--light-gray)',
												color: 'var(--text-primary)',
												backgroundColor: 'var(--accent-white)'
											}}
										/>
									</div>
								)}

								<IndividualRadio
									name="businessTiming"
									value="different"
									checked={businessTiming === 'different'}
									onChange={(value) => setBusinessTiming(value as 'same' | 'different')}
									label="Different hours everyday"
								/>
								{businessTiming === 'different' && (
									<div className="ml-7 space-y-3">
										{daysOfWeek.map((day) => (
											<div key={day.key} className="flex items-center gap-3">
												<Checkbox
													checked={differentHours[day.key].enabled}
													onChange={(checked) => {
														handleDifferentHourChange(day.key, 'startTime', differentHours[day.key].startTime);
														setDifferentHours(prev => ({
															...prev,
															[day.key]: {
																...prev[day.key],
																enabled: checked,
															},
														}));
													}}
													size="medium"
													label={day.label}
												/>
												<input
													type="time"
													value={differentHours[day.key].startTime}
													onChange={(e) => handleDifferentHourChange(day.key, 'startTime', e.target.value)}
													disabled={!differentHours[day.key].enabled}
													className="px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
													style={{
														borderColor: 'var(--light-gray)',
														color: 'var(--text-primary)',
														backgroundColor: 'var(--accent-white)'
													}}
												/>
												<span
													className="text-sm dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													to
												</span>
												<input
													type="time"
													value={differentHours[day.key].endTime}
													onChange={(e) => handleDifferentHourChange(day.key, 'endTime', e.target.value)}
													disabled={!differentHours[day.key].enabled}
													className="px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
													style={{
														borderColor: 'var(--light-gray)',
														color: 'var(--text-primary)',
														backgroundColor: 'var(--accent-white)'
													}}
												/>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{/* Business Days Section (only shown when Custom Hour is selected and Same hour everyday) */}
					{businessHourType === 'custom' && businessTiming === 'same' && (
						<div>
							<label
								className="block text-sm font-medium dark:text-gray-200 mb-3"
								style={{ color: 'var(--text-secondary)' }}
							>
								Business Days
							</label>
							<div className="space-y-2">
								{daysOfWeek.map((day) => (
									<div key={day.key} className="flex items-center gap-3 cursor-pointer">
										<Checkbox
											checked={businessDays.includes(day.key)}
											onChange={(checked) => handleDayToggle(day.key)}
											size="medium"
											label={day.label}
										/>
									</div>
								))}
							</div>
						</div>
					)}
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
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddBusinessHourModal;
