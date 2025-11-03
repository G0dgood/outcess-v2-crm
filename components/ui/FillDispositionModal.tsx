'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import Textarea from './Textarea';
import DateInput from './DateInput';
import { Cross2Icon, CalendarIcon, ClockIcon } from '@radix-ui/react-icons';

interface FillDispositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: (data: DispositionFormData) => void;
	initialData?: Partial<DispositionFormData>;
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
}) => {
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
		dateInputRef.current?.click();
	};

	const handleTimeIconClick = () => {
		timeInputRef.current?.click();
	};

	const handleCommitmentDateIconClick = () => {
		commitmentDateInputRef.current?.click();
	};

	const handleView = () => {
		console.log('View disposition:', formData);
		// Implement view logic
	};

	const handleSaveAndPost = () => {
		onSave?.(formData);
		onClose();
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
			<div className="bg-white shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Disposition</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
								onChange={handleInputChange('callAnswered')}
							/>

							<Dropdown
								label="Reason for not watching"
								placeholder="Select"
								options={reasonForNotWatchingOptions}
								value={formData.reasonForNotWatching}
								onChange={handleInputChange('reasonForNotWatching')}
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
								onChange={handleInputChange('reasonForNonPayment')}
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
									className="absolute right-3 bottom-3 cursor-pointer hover:text-gray-600 transition-colors"
									aria-label="Open date picker"
								>
									<CalendarIcon className="w-4 h-4 text-gray-400" />
								</button>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
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
											className="absolute right-3 bottom-3 cursor-pointer hover:text-gray-600 transition-colors"
											aria-label="Open date picker"
										>
											<CalendarIcon className="w-4 h-4 text-gray-400" />
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
											className="absolute right-3 bottom-3 cursor-pointer hover:text-gray-600 transition-colors"
											aria-label="Open time picker"
										>
											<ClockIcon className="w-4 h-4 text-gray-400" />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end items-center gap-3 p-6 border-t border-gray-200">
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
					>
						Save & Post
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FillDispositionModal;

