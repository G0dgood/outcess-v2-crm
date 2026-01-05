'use client';

import React, { useState } from 'react';
import Button from './Button';
import AddShiftHourModal, { ShiftHour } from './AddShiftHourModal';

const ShiftHours = () => {
	const [shiftHours, setShiftHours] = useState<ShiftHour[]>([
		{
			id: '1',
			shiftName: 'Morning Shift',
			shiftDays: 'Monday - Friday',
			shiftStartTime: '11:00 AM',
			shiftEndTime: '05:00 PM',
			noOfUsers: 3,
		},
	]);
	const [isAddShiftHourModalOpen, setIsAddShiftHourModalOpen] = useState(false);
	const [selectedShiftHour, setSelectedShiftHour] = useState<ShiftHour | null>(null);

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
		<div>
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<h2
						className="text-2xl font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Shift Hour
					</h2>
					<p
						className="dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Manage employee schedules with ease using shift hours.
					</p>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={() => {
						setSelectedShiftHour(null);
						setIsAddShiftHourModalOpen(true);
					}}
				>
					New Shift Hour
				</Button>
			</div>

			{/* Shift Hours Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Name
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Days
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Timing
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									No of Users
								</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{shiftHours.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-12 text-center dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No shift hours configured yet.
									</td>
								</tr>
							) : (
								shiftHours?.map((shift) => (
									<tr
										key={shift.id}
										className="dark:hover:bg-gray-700 transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td
											className="px-6 py-4 whitespace-nowrap font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shift.shiftName}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shift.shiftDays}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shift.shiftStartTime} - {shift.shiftEndTime}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shift.noOfUsers}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add/Edit Shift Hour Modal */}
			<AddShiftHourModal
				isOpen={isAddShiftHourModalOpen}
				onClose={() => {
					setIsAddShiftHourModalOpen(false);
					setSelectedShiftHour(null);
				}}
				onSave={(data) => {
					if (selectedShiftHour) {
						// Update existing shift hour
						setShiftHours(prev => prev.map(s => s.id === selectedShiftHour.id ? { ...data, id: selectedShiftHour.id } : s));
					} else {
						// Add new shift hour
						const newShift = {
							...data,
							id: Date.now().toString(),
							shiftStartTime: formatTime(data.shiftStartTime),
							shiftEndTime: formatTime(data.shiftEndTime),
						};
						setShiftHours(prev => [...prev, newShift]);
					}
					setIsAddShiftHourModalOpen(false);
					setSelectedShiftHour(null);
				}}
				initialData={selectedShiftHour}
			/>
		</div>
	);
};

export default ShiftHours;
