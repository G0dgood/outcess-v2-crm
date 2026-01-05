'use client';

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { Pencil1Icon } from '@radix-ui/react-icons';
import SupPageHeading from './SubPageHeading';
import AddBusinessHourModal, { BusinessHourData } from './AddBusinessHourModal';
import ShiftHours from './ShiftHours';

const BusinessHours = () => {
	const [isBusinessHourEditMode, setIsBusinessHourEditMode] = useState(false);
	const [isAddBusinessHourModalOpen, setIsAddBusinessHourModalOpen] = useState(false);
	const [businessHourData, setBusinessHourData] = useState({
		businessDays: 'Monday - Sunday',
		businessHours: '24 Hours',
	});
	const [businessHours, setBusinessHours] = useState<BusinessHourData[]>([]);

	const formatTime = (time: string): string => {
		if (!time) return '';
		// Convert 24h format to 12h format for display
		const [hours, minutes] = time.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	return (
		<div className="space-y-8">
			{/* Business Hour Section */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<h2
							className="text-2xl font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Business Hour
						</h2>
						{!isBusinessHourEditMode && businessHourData.businessDays && (
							<button
								onClick={() => setIsBusinessHourEditMode(true)}
								className="p-1 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
								aria-label="Edit business hour"
							>
								<Pencil1Icon className="w-4 h-4" />
							</button>
						)}
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={() => setIsAddBusinessHourModalOpen(true)}
					>
						Add Business Hour
					</Button>
				</div>
				<SupPageHeading
					text="Establish your organization's business hours to guide employees in scheduling and completing work activities within those operational times."
					className="dark:text-gray-400 mb-6"
					style={{ color: 'var(--text-tertiary)' }}
				/>

				{businessHourData.businessDays ? (
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6 space-y-4"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="flex items-center justify-between">
							<div>
								<label
									className="block text-sm font-medium dark:text-gray-400 mb-1"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Business days
								</label>
								{isBusinessHourEditMode ? (
									<Input
										value={businessHourData.businessDays}
										onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessDays: value }))}
										placeholder="Enter business days" label={''} />
								) : (
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessHourData.businessDays}
									</p>
								)}
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div>
								<label
									className="block text-sm font-medium dark:text-gray-400 mb-1"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Business hours
								</label>
								{isBusinessHourEditMode ? (
									<Input
										value={businessHourData.businessHours}
										onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessHours: value }))}
										placeholder="Enter business hours" label={''} />
								) : (
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessHourData.businessHours}
									</p>
								)}
							</div>
						</div>

						{isBusinessHourEditMode && (
							<div className="flex justify-end gap-3 pt-4">
								<Button
									variant="danger"
									size="md"
									onClick={() => setIsBusinessHourEditMode(false)}
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									size="md"
									onClick={() => {
										console.log('Saving business hour:', businessHourData);
										setIsBusinessHourEditMode(false);
									}}
								>
									Save
								</Button>
							</div>
						)}
					</div>
				) : (
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6 min-h-[200px] flex items-center justify-center"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<p
							className="dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							No business hours configured yet.
						</p>
					</div>
				)}
			</div>

			{/* Shift Hour Section */}
			<ShiftHours />

			{/* Add Business Hour Modal */}
			<AddBusinessHourModal
				isOpen={isAddBusinessHourModalOpen}
				onClose={() => setIsAddBusinessHourModalOpen(false)}
				onSave={(data) => {
					console.log('Saving business hour:', data);
					// Format business hour data for display
					let displayDays = '';
					let displayHours = '';

					if (data.businessHourType === '24hours-7days') {
						displayDays = 'Monday - Sunday';
						displayHours = '24 Hours';
					} else if (data.businessHourType === '24hours-5days') {
						displayDays = 'Monday - Friday';
						displayHours = '24 Hours';
					} else if (data.businessHourType === 'custom') {
						if (data.businessDays && data.businessDays.length > 0) {
							const dayLabels: { [key: string]: string } = {
								monday: 'Monday',
								tuesday: 'Tuesday',
								wednesday: 'Wednesday',
								thursday: 'Thursday',
								friday: 'Friday',
								saturday: 'Saturday',
								sunday: 'Sunday',
							};
							const selectedDays = data.businessDays.map(d => dayLabels[d] || d);
							displayDays = selectedDays.join(', ');
						}

						if (data.businessTiming === 'same' && data.sameStartTime && data.sameEndTime) {
							displayHours = `${formatTime(data.sameStartTime)} - ${formatTime(data.sameEndTime)}`;
						} else if (data.businessTiming === 'different') {
							displayHours = 'Custom Hours';
						}
					}

					setBusinessHourData({
						businessDays: displayDays || businessHourData.businessDays,
						businessHours: displayHours || businessHourData.businessHours,
					});
					setBusinessHours([...businessHours, data]);
					setIsAddBusinessHourModalOpen(false);
				}}
			/>
		</div>
	);
};

export default BusinessHours;
