'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Pencil1Icon } from '@radix-ui/react-icons';
import SubPageHeading from '@/components/ui/SubPageHeading';
import AddBusinessHourModal, { BusinessHourData } from '@/components/ui/AddBusinessHourModal';
import ShiftHours from './ShiftHours';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { BusinessHourPayload, useUpdateBusinessHoursMutation } from '@/store/services/lineOfBusinessApi';
import { toastError, toastSuccess } from '@/utils/toastWithSound';

const BusinessHours = () => {
	const { selectedLineOfBusinessId, lineOfBusinessData } = useLineOfBusiness();
	const [updateBusinessHours] = useUpdateBusinessHoursMutation();

	const [isBusinessHourEditMode, setIsBusinessHourEditMode] = useState(false);
	const [isAddBusinessHourModalOpen, setIsAddBusinessHourModalOpen] = useState(false);
	const [businessHourData, setBusinessHourData] = useState({
		name: 'Default Business Hours',
		businessDays: 'Monday - Sunday',
		businessHours: '24 Hours',
	});
	const [businessHours, setBusinessHours] = useState<BusinessHourData[]>([]);
	const [editingBusinessHourIndex, setEditingBusinessHourIndex] = useState<number | null>(null);
	const [editingBusinessHour, setEditingBusinessHour] = useState<BusinessHourData | null>(null);
	const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const formatTime = (time: string): string => {
		if (!time) return '';
		const [hours, minutes] = time.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	useEffect(() => {
		const existing = lineOfBusinessData?.lineOfBusiness?.businessHours as BusinessHourData[] | BusinessHourData | undefined;
		if (!existing) {
			return;
		}

		const list = Array.isArray(existing) ? existing : [existing];
		if (list.length === 0) {
			return;
		}

		const primary = list[0];

		let displayDays = 'Monday - Sunday';
		let displayHours = '24 Hours';

		if (primary.businessHourType === '24hours-7days') {
			displayDays = 'Monday - Sunday';
			displayHours = '24 Hours';
		} else if (primary.businessHourType === '24hours-5days') {
			displayDays = 'Monday - Friday';
			displayHours = '24 Hours';
		} else if (primary.businessHourType === 'custom') {
			displayDays = '';
			displayHours = '';

			if (primary.businessDays && primary.businessDays.length > 0) {
				const dayLabels: { [key: string]: string } = {
					monday: 'Monday',
					tuesday: 'Tuesday',
					wednesday: 'Wednesday',
					thursday: 'Thursday',
					friday: 'Friday',
					saturday: 'Saturday',
					sunday: 'Sunday',
				};
				const selectedDays = primary.businessDays.map(d => dayLabels[d] || d);
				displayDays = selectedDays.join(', ');
			}

			if (primary.businessTiming === 'same' && primary.sameStartTime && primary.sameEndTime) {
				displayHours = `${formatTime(primary.sameStartTime)} - ${formatTime(primary.sameEndTime)}`;
			} else if (primary.businessTiming === 'different') {
				displayHours = 'Different hours by day';
			}
		}

		const displayName = primary.name || 'Business Hours';

		setBusinessHourData({
			name: displayName,
			businessDays: displayDays,
			businessHours: displayHours,
		});
		setBusinessHours(list);
	}, [lineOfBusinessData]);

	const appendBusinessHourToServer = async (item: BusinessHourData) => {
		if (!selectedLineOfBusinessId) {
			return;
		}

		const payload: BusinessHourPayload = {
			name: item.name,
			businessHourType: item.businessHourType,
			businessTiming: item.businessTiming,
			sameStartTime: item.sameStartTime,
			sameEndTime: item.sameEndTime,
			differentHours: item.differentHours,
			businessDays: item.businessDays,
		};

		try {
			await updateBusinessHours({
				id: selectedLineOfBusinessId,
				data: payload,
			}).unwrap();
			toastSuccess('Business hours updated successfully');
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
				'Error updating business hours';
			toastError(message);
		}
	};

	const replaceBusinessHoursOnServer = async (list: BusinessHourData[]) => {
		if (!selectedLineOfBusinessId) {
			return;
		}

		const payload: BusinessHourPayload[] = list.map((item) => ({
			name: item.name,
			businessHourType: item.businessHourType,
			businessTiming: item.businessTiming,
			sameStartTime: item.sameStartTime,
			sameEndTime: item.sameEndTime,
			differentHours: item.differentHours,
			businessDays: item.businessDays,
		}));

		try {
			await updateBusinessHours({
				id: selectedLineOfBusinessId,
				data: payload,
			}).unwrap();
			toastSuccess('Business hours updated successfully');
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
				'Error updating business hours';
			toastError(message);
		}
	};

	return (
		<div className="space-y-8">
			{/* Business Hour Section */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<h2
							className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Business Hour
						</h2>
						{!isBusinessHourEditMode && businessHourData.businessDays && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsBusinessHourEditMode(true)}
								className="p-1 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors h-auto"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
								title="Edit business hour"
								aria-label="Edit business hour"
							>
								<Pencil1Icon className="w-4 h-4" />
							</Button>
						)}
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={() => {
							setEditingBusinessHourIndex(null);
							setEditingBusinessHour(null);
							setIsAddBusinessHourModalOpen(true);
						}}
					>
						Add Business Hour
					</Button>
				</div>
				<SubPageHeading
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
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium dark:text-gray-400 mb-1"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Business hour name
							</label>
							{isBusinessHourEditMode ? (
								<Input
									value={businessHourData.name}
									onChange={(value) => setBusinessHourData(prev => ({ ...prev, name: value }))}
									placeholder="Enter business hour name" label={''} />
							) : (
								<p
									className="text-base dark:text-gray-100 font-medium"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessHourData.name}
								</p>
							)}
						</div>
						<div className="flex items-center justify-between">
							<div>
								<label
									className="block text-[10px] md:text-[12px] font-medium dark:text-gray-400 mb-1"
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
									className="block text-[10px] md:text-[12px] font-medium dark:text-gray-400 mb-1"
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

				{businessHours.length > 0 && (
					<div className="mt-6 space-y-4">
						<h3
							className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							Custom Business Hours
						</h3>
						<div className="space-y-3">
							{businessHours.map((item, index) => {
								let displayDays = '';
								let displayHours = '';

								if (item.businessHourType === '24hours-7days') {
									displayDays = 'Monday - Sunday';
									displayHours = '24 Hours';
								} else if (item.businessHourType === '24hours-5days') {
									displayDays = 'Monday - Friday';
									displayHours = '24 Hours';
								} else if (item.businessHourType === 'custom') {
									if (item.businessDays && item.businessDays.length > 0) {
										const dayLabels: { [key: string]: string } = {
											monday: 'Monday',
											tuesday: 'Tuesday',
											wednesday: 'Wednesday',
											thursday: 'Thursday',
											friday: 'Friday',
											saturday: 'Saturday',
											sunday: 'Sunday',
										};
										const selectedDays = item.businessDays.map(d => dayLabels[d] || d);
										displayDays = selectedDays.join(', ');
									}

									if (item.businessTiming === 'same' && item.sameStartTime && item.sameEndTime) {
										displayHours = `${formatTime(item.sameStartTime)} - ${formatTime(item.sameEndTime)}`;
									} else if (item.businessTiming === 'different') {
										displayHours = 'Different hours by day';
									}
								}

								return (
									<div
										key={index}
										className="dark:bg-gray-800 border dark:border-gray-700 p-4"
										style={{
											backgroundColor: 'var(--accent-white)',
											borderColor: 'var(--light-gray)'
										}}
									>
										<div className="flex items-center justify-between gap-4">
											<div className="space-y-1">
												<p
													className="text-sm md:text-base font-semibold dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{item.name || `Business Hour ${index + 1}`}
												</p>
												<div>
													<p
														className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
														style={{ color: 'var(--text-tertiary)' }}
													>
														Business days
													</p>
													<p
														className="text-sm md:text-base dark:text-gray-100 font-medium"
														style={{ color: 'var(--text-primary)' }}
													>
														{displayDays || 'Not specified'}
													</p>
												</div>
											</div>
											<div className="space-y-1 text-right">
												<p
													className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													Business hours
												</p>
												<p
													className="text-sm md:text-base dark:text-gray-100 font-medium"
													style={{ color: 'var(--text-primary)' }}
												>
													{displayHours || 'Not specified'}
												</p>
											</div>
										</div>
										<div className="flex justify-end mt-3 gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													setDeleteIndex(index);
													setIsDeleteModalOpen(true);
												}}
											>
												Delete
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={() => {
													setEditingBusinessHourIndex(index);
													setEditingBusinessHour(item);
													setIsAddBusinessHourModalOpen(true);
												}}
											>
												Edit
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			<ShiftHours />

			{/* Add Business Hour Modal */}
			<AddBusinessHourModal
				isOpen={isAddBusinessHourModalOpen}
				onClose={() => {
					setIsAddBusinessHourModalOpen(false);
					setEditingBusinessHourIndex(null);
					setEditingBusinessHour(null);
				}}
				initialData={editingBusinessHour}
				onSave={async (data) => {
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

					const displayName = data.name || businessHourData.name || 'Business Hours';

					let nextList: BusinessHourData[];

					if (editingBusinessHourIndex !== null) {
						nextList = businessHours.map((item, idx) =>
							idx === editingBusinessHourIndex ? { ...data, name: displayName } : item
						);
					} else {
						nextList = [...businessHours, { ...data, name: displayName }];
					}

					setBusinessHourData({
						name: displayName,
						businessDays: displayDays || businessHourData.businessDays,
						businessHours: displayHours || businessHourData.businessHours,
					});
					setBusinessHours(nextList);
					setIsAddBusinessHourModalOpen(false);
					setEditingBusinessHourIndex(null);
					setEditingBusinessHour(null);

					if (editingBusinessHourIndex !== null) {
						await replaceBusinessHoursOnServer(nextList);
					} else {
						const newItem: BusinessHourData = { ...data, name: displayName };
						await appendBusinessHourToServer(newItem);
					}
				}}
			/>
			<DeleteRecordModal
				isOpen={isDeleteModalOpen}
				recordName={
					typeof deleteIndex === 'number'
						? businessHours[deleteIndex]?.name || `Business Hour ${deleteIndex + 1}`
						: ''
				}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setDeleteIndex(null);
				}}
				onConfirm={async () => {
					if (deleteIndex === null) {
						return;
					}
					const nextList = businessHours.filter((_, idx) => idx !== deleteIndex);
					setBusinessHours(nextList);
					if (nextList.length === 0) {
						setBusinessHourData({
							name: 'Default Business Hours',
							businessDays: '',
							businessHours: '',
						});
					}
					setIsDeleteModalOpen(false);
					setDeleteIndex(null);
					await replaceBusinessHoursOnServer(nextList);
				}}
			/>
		</div>
	);
};

export default BusinessHours;
