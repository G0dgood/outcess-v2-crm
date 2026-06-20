'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import AddShiftHourModal, { ShiftHour } from '@/components/ui/AddShiftHourModal';
import AssignShiftHourModal from '@/components/ui/AssignShiftHourModal';
import { useCampaign } from '@/contexts/CampaignContext';
import { useUpsertShiftHourMutation } from '@/store/services/campaignApi';
import { toastError, toastSuccess } from '@/utils/toastWithSound';
import { ClockIcon } from '@radix-ui/react-icons';
import EmptyState from '@/components/ui/EmptyState';

const ShiftHours = () => {
	const { selectedCampaignId, campaignData } = useCampaign();

	const [shiftHours, setShiftHours] = useState<ShiftHour[]>([]);
	const [isAddShiftHourModalOpen, setIsAddShiftHourModalOpen] = useState(false);
	const [selectedShiftHour, setSelectedShiftHour] = useState<ShiftHour | null>(null);
	const [assignModalOpen, setAssignModalOpen] = useState(false);
	const [assignShift, setAssignShift] = useState<ShiftHour | null>(null);

	const formatTime = (time: string): string => {
		if (!time) return '';
		// Convert 24h format to 12h format for display
		const [hours, minutes] = time.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const [shiftDayLabels, setShiftDayLabels] = useState<{ [key: string]: string }>({});

	const [upsertShiftHour] = useUpsertShiftHourMutation();

	useEffect(() => {
		const businessHours = campaignData?.businessHours as
			| { name?: string; businessDays?: string[] }[]
			| { name?: string; businessDays?: string[] }
			| undefined;

		const labels: { [key: string]: string } = {
			'monday-friday': 'Monday - Friday',
			'monday-saturday': 'Monday - Saturday',
			'monday-sunday': 'Monday - Sunday',
			'tuesday-saturday': 'Tuesday - Saturday',
			'custom': 'Custom',
		};

		if (!businessHours) {
			setShiftDayLabels(labels);
			return;
		}

		const list = Array.isArray(businessHours) ? businessHours : [businessHours];

		list.forEach((item, index) => {
			if (item.businessDays && item.businessDays.length > 0) {
				const daysKey = item.businessDays.join(',');
				const label = item.name || `Business Hour ${index + 1}`;
				labels[daysKey] = label;
			}
		});

		setShiftDayLabels(labels);
	}, [campaignData]);

	useEffect(() => {
		const existing = campaignData?.shiftHours as
			| {
				id?: string;
				shiftName: string;
				shiftDaysKey: string;
				shiftStartTime: string;
				shiftEndTime: string;
				noOfUsers: number;
			}[]
			| undefined;

		if (!existing) {
			setShiftHours([]);
			return;
		}

		const list = Array.isArray(existing) ? existing : [existing];

		const mapped: ShiftHour[] = list.map((item) => ({
			id: item.id,
			shiftName: item.shiftName,
			shiftDays: item.shiftDaysKey,
			shiftStartTime: item.shiftStartTime,
			shiftEndTime: item.shiftEndTime,
			noOfUsers: item.noOfUsers,
		}));

		setShiftHours(mapped);
	}, [campaignData]);

	return (
		<div>
			<div className="flex items-start justify-between mb-4">
				<div className="flex-1">
					<h2
						className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Shift Hour
					</h2>
					<p
						className="dark:text-gray-400 text-[10px] md:text-[12px]"
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
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
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
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Name
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Days
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Shift Timing
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									No of Users
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Actions
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
										colSpan={5}
										className="px-6 py-4"
									>
										<EmptyState
											icon={ClockIcon}
											title="No Shift Hours Found"
											description="No shift hours have been configured for this campaign yet. Create shift hours to manage employee schedules."
											actionLabel="New Shift Hour"
											onAction={() => {
												setSelectedShiftHour(null);
												setIsAddShiftHourModalOpen(true);
											}}
											className="py-12"
										/>
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
											className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shiftDayLabels[shift.shiftDays] || shift.shiftDays}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{formatTime(shift.shiftStartTime)} - {formatTime(shift.shiftEndTime)}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{shift.noOfUsers}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px]">
											<div className="flex items-center gap-2">
												<Button
													variant="secondary"
													size="sm"
													onClick={() => {
														setSelectedShiftHour(shift);
														setIsAddShiftHourModalOpen(true);
													}}
												>
													Edit
												</Button>
												<Button
													variant="secondary"
													size="sm"
													onClick={() => {
														setAssignShift(shift);
														setAssignModalOpen(true);
													}}
												>
													Add Team Members
												</Button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			<AddShiftHourModal
				isOpen={isAddShiftHourModalOpen}
				onClose={() => {
					setIsAddShiftHourModalOpen(false);
					setSelectedShiftHour(null);
				}}
				onSave={async (data) => {
					if (!selectedCampaignId) {
						toastError('No line of business selected');
						setIsAddShiftHourModalOpen(false);
						setSelectedShiftHour(null);
						return;
					}

					const payload = {
						id: selectedShiftHour?.id,
						shiftName: data.shiftName,
						shiftDaysKey: data.shiftDays,
						shiftStartTime: data.shiftStartTime,
						shiftEndTime: data.shiftEndTime,
						noOfUsers: data.noOfUsers,
					};

					try {
						const result = await upsertShiftHour({
							id: selectedCampaignId,
							data: payload,
						}).unwrap();

						const mapped = result.shiftHours.map((item) => ({
							id: item.id,
							shiftName: item.shiftName,
							shiftDays: item.shiftDaysKey,
							shiftStartTime: item.shiftStartTime,
							shiftEndTime: item.shiftEndTime,
							noOfUsers: item.noOfUsers,
						}));

						setShiftHours(mapped);

						toastSuccess(selectedShiftHour ? 'Shift hour updated successfully' : 'Shift hour created successfully');
					} catch (error) {
						const err = error as {
							data?: { message?: string; error?: string };
							error?: string;
							message?: string;
						};
						const message =
							err?.data?.error ||
							err?.data?.message ||
							err?.error ||
							err?.message ||
							'Error saving shift hour';
						toastError(message);
					}

					setIsAddShiftHourModalOpen(false);
					setSelectedShiftHour(null);
				}}
				initialData={selectedShiftHour}
			/>
			<AssignShiftHourModal
				isOpen={assignModalOpen}
				onClose={() => {
					setAssignModalOpen(false);
					setAssignShift(null);
				}}
				shiftHourId={assignShift?.id || null}
				shiftName={assignShift?.shiftName || ''}
			/>
		</div>
	);
};

export default ShiftHours;
