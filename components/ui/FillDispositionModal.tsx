'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import Textarea from './Textarea';
import DateInput from './DateInput';
import { Cross2Icon, CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import { useSocket } from '@/contexts/SocketContext';
import { saveOfflineDisposition, saveSyncedDisposition } from '@/utils/offlineDispositions';
import { toastSuccess, toastError, toastInfo } from '@/utils/toastWithSound';
import { useAuth } from '@/contexts/AuthContext';

interface FillDispositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: (data: DispositionFormData) => void;
	initialData?: Partial<DispositionFormData>;
	customerId?: string;
	customerName?: string;
}

export interface DispositionFormData {
	callAnswered: string;
	reasonForNotWatching: string;
	amountToPay: string;
	comment: string;
	reasonForNonPayment: string;
	commitmentDate: string;
	date: string;
	time: string;
}

export const FillDispositionModal: React.FC<FillDispositionModalProps> = ({
	isOpen,
	onClose,
	onSave,
	initialData,
	customerId,
	customerName,
}) => {
	const { isOnline, isConnected, isOffline, send } = useSocket();
	const { user: authUser } = useAuth();
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<DispositionFormData>({
		callAnswered: initialData?.callAnswered || '',
		reasonForNotWatching: initialData?.reasonForNotWatching || '',
		amountToPay: initialData?.amountToPay || '',
		comment: initialData?.comment || '',
		reasonForNonPayment: initialData?.reasonForNonPayment || '',
		commitmentDate: initialData?.commitmentDate || '',
		date: initialData?.date || '',
		time: initialData?.time || '',
	});

	const dateInputRef = useRef<HTMLInputElement>(null);
	const timeInputRef = useRef<HTMLInputElement>(null);
	const commitmentDateInputRef = useRef<HTMLInputElement>(null);

	// Reset or update form when modal opens/closes
	useEffect(() => {
		if (isOpen && initialData) {
			setFormData({
				callAnswered: initialData.callAnswered || '',
				reasonForNotWatching: initialData.reasonForNotWatching || '',
				amountToPay: initialData.amountToPay || '',
				comment: initialData.comment || '',
				reasonForNonPayment: initialData.reasonForNonPayment || '',
				commitmentDate: initialData.commitmentDate || '',
				date: initialData.date || '',
				time: initialData.time || '',
			});
		} else if (!isOpen) {
			setFormData({
				callAnswered: '',
				reasonForNotWatching: '',
				amountToPay: '',
				comment: '',
				reasonForNonPayment: '',
				commitmentDate: '',
				date: '',
				time: '',
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

	const handleInputChange = (field: keyof DispositionFormData) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleDateIconClick = () => {
		if (dateInputRef.current) {
			// Use showPicker() if available (modern browsers)
			const el = dateInputRef.current as HTMLInputElement & { showPicker?: () => void };
			if (typeof el.showPicker === 'function') {
				try {
					el.showPicker();
				} catch {
					// Fallback to focus and click if showPicker fails
					dateInputRef.current.focus();
					dateInputRef.current.click();
				}
			} else {
				// Fallback for older browsers
				dateInputRef.current.focus();
				dateInputRef.current.click();
			}
		}
	};

	const handleTimeIconClick = () => {
		if (timeInputRef.current) {
			// Use showPicker() if available (modern browsers)
			const el = timeInputRef.current as HTMLInputElement & { showPicker?: () => void };
			if (typeof el.showPicker === 'function') {
				try {
					el.showPicker();
				} catch {
					// Fallback to focus and click if showPicker fails
					timeInputRef.current.focus();
					timeInputRef.current.click();
				}
			} else {
				// Fallback for older browsers
				timeInputRef.current.focus();
				timeInputRef.current.click();
			}
		}
	};

	const handleCommitmentDateIconClick = () => {
		if (commitmentDateInputRef.current) {
			// Use showPicker() if available (modern browsers)
			const el = commitmentDateInputRef.current as HTMLInputElement & { showPicker?: () => void };
			if (typeof el.showPicker === 'function') {
				try {
					el.showPicker();
				} catch {
					// Fallback to focus and click if showPicker fails
					commitmentDateInputRef.current.focus();
					commitmentDateInputRef.current.click();
				}
			} else {
				// Fallback for older browsers
				commitmentDateInputRef.current.focus();
				commitmentDateInputRef.current.click();
			}
		}
	};

	const handleView = () => {
		console.log('View disposition:', formData);
		// Implement view logic
	};

	const handleSaveAndPost = async () => {
		setIsSaving(true);
		try {
			// If offline, save to localStorage
			if (isOffline) {
				saveOfflineDisposition(formData, customerId, customerName);
				toastInfo('Disposition saved offline. It will sync when you\'re back online.');
				onSave?.(formData);
				onClose();
				return;
			}

			// If online and connected, try to save via API/socket
			if (isOnline && isConnected) {
				try {
					// Try to send via socket or API
					if (send) {
						send({
							type: 'disposition',
							payload: {
								...formData,
								customerId,
								customerName,
								timestamp: new Date().toISOString(),
							},
						});
					}

					// Save to synced dispositions for history
					saveSyncedDisposition(
						formData,
						customerId,
						customerName,
						authUser?.name,
						authUser?.id
					);

					// Call the onSave callback
					onSave?.(formData);

					toastSuccess('Disposition saved successfully');
					onClose();
				} catch (error) {
					console.error('Error saving disposition online:', error);
					// Fall through to offline save
					saveOfflineDisposition(formData, customerId, customerName);
					toastInfo('Disposition saved offline due to connection error. It will sync when connection is restored.');
					onSave?.(formData);
					onClose();
				}
			} else {
				// Not offline but also not connected - save offline as fallback
				saveOfflineDisposition(formData, customerId, customerName);
				toastInfo('Disposition saved offline. It will sync when you\'re back online.');
				onSave?.(formData);
				onClose();
			}
		} catch (error) {
			console.error('Error saving disposition:', error);
			toastError('Failed to save disposition');
			onSave?.(formData);
			onClose();
		} finally {
			setIsSaving(false);
		}
	};

	if (!isOpen) return null;

	const callAnsweredOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const reasonForNotWatchingOptions = [
		{ value: 'busy', label: 'Busy' },
		{ value: 'not-interested', label: 'Not Interested' },
		{ value: 'other', label: 'Other' },
	];

	const reasonForNonPaymentOptions = [
		{ value: 'financial-hardship', label: 'Financial Hardship' },
		{ value: 'pending', label: 'Pending Payment' },
		{ value: 'dispute', label: 'Dispute' },
		{ value: 'other', label: 'Other' },
	];

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<h2
							className="text-xl font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Disposition
						</h2>
						{isOffline && (
							<span
								className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
								style={{
									backgroundColor: 'rgba(220, 53, 69, 0.1)',
									color: '#DC3545',
									border: '1px solid rgba(220, 53, 69, 0.2)'
								}}
							>
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
									/>
								</svg>
								Offline
							</span>
						)}
					</div>
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
				<div className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Left Column */}
						<div className="space-y-6">
							<Dropdown
								label="Call Answered"
								placeholder="Select"
								options={callAnsweredOptions}
								value={formData.callAnswered}
								onChange={(value) => handleInputChange('callAnswered')(Array.isArray(value) ? value.join(',') : value)}
							/>

							<Dropdown
								label="Reason for not watching"
								placeholder="Select"
								options={reasonForNotWatchingOptions}
								value={formData.reasonForNotWatching}
								onChange={(value) => handleInputChange('reasonForNotWatching')(Array.isArray(value) ? value.join(',') : value)}
							/>

							<Input
								label="Amount to Pay"
								placeholder=""
								value={formData.amountToPay}
								onChange={handleInputChange('amountToPay')}
								type="number"
							/>

							<Textarea
								label="Comment"
								placeholder=""
								value={formData.comment}
								onChange={handleInputChange('comment')}
								rows={4}
							/>
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							<Dropdown
								label="Reason For Non Payment"
								placeholder="Select"
								options={reasonForNonPaymentOptions}
								value={formData.reasonForNonPayment}
								onChange={(value) => handleInputChange('reasonForNonPayment')(Array.isArray(value) ? value.join(',') : value)}
							/>

							<div className="relative">
								<DateInput
									ref={commitmentDateInputRef}
									label="Commitment Date"
									placeholder="DD/MM/YY"
									value={formData.commitmentDate}
									onChange={handleInputChange('commitmentDate')}
									inputClassName="pr-10"
								/>
								<button
									type="button"
									onClick={handleCommitmentDateIconClick}
									className="absolute right-3 top-[38px] cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
									style={{ color: 'var(--text-tertiary)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = 'var(--text-secondary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}}
									aria-label="Open date picker"
								>
									<CalendarIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
								</button>
							</div>

							<div>
								<label
									className="block text-sm font-medium dark:text-gray-300 mb-2"
									style={{ color: 'var(--text-secondary)' }}
								>
									Date and Time
								</label>
								<div className="grid grid-cols-2 gap-3">
									<div className="input-container relative">
										<input
											ref={dateInputRef}
											type="date"
											placeholder="DD/MM/YY"
											value={formData.date}
											onChange={(e) => handleInputChange('date')(e.target.value)}
											className="input-field pr-10"
										/>
										<button
											type="button"
											onClick={handleDateIconClick}
											className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											aria-label="Open date picker"
										>
											<CalendarIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
										</button>
									</div>
									<div className="input-container relative">
										<input
											ref={timeInputRef}
											type="time"
											placeholder="HH:MM"
											value={formData.time}
											onChange={(e) => handleInputChange('time')(e.target.value)}
											className="input-field pr-10"
										/>
										<button
											type="button"
											onClick={handleTimeIconClick}
											className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											aria-label="Open time picker"
										>
											<ClockIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					className="flex items-center gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					{isOffline && (
						<span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
								/>
							</svg>
							Will sync when online
						</span>
					)}
					<div className="flex items-center gap-3 ml-auto">
						<Button
							variant="outline"
							size="md"
							onClick={handleView}
						>
							View
						</Button>
						<Button
							variant="primary"
							size="md"
							onClick={handleSaveAndPost}
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : (isOffline ? 'Save Offline' : 'Save & Post')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FillDispositionModal;
