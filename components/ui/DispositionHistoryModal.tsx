'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DispositionHistoryItem {
	id: string;
	date: string;
	time: string;
	agent: string;
	timeSpent: string;
	agentId?: string;
	callAnswered?: string;
	reasonForNonPayment?: string;
	reasonForNotWatching?: string;
	commitmentDate?: string;
	amountToPay?: string;
	dateTime?: string;
	comment?: string;
}

interface DispositionHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	dispositionItem?: DispositionHistoryItem | null;
}

export const DispositionHistoryModal: React.FC<DispositionHistoryModalProps> = ({
	isOpen,
	onClose,
	dispositionItem,
}) => {
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

	if (!isOpen || !dispositionItem) return null;

	// Format date contacted
	const formatDateContacted = () => {
		try {
			const date = new Date(dispositionItem.date);
			const options: Intl.DateTimeFormatOptions = {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			};
			return date.toLocaleDateString('en-US', options);
		} catch {
			return `${dispositionItem.date} [${dispositionItem.time}]`;
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div className="bg-white dark:bg-gray-800 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Disposition History</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Agent Information Section */}
					<div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6">
						<div className="space-y-3">
							<div>
								<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
									Agent Name
								</label>
								<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{dispositionItem.agent || '-'}</p>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
									Agent ID
								</label>
								<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{dispositionItem.agentId || '-'}</p>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
									Date Contacted
								</label>
								<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{formatDateContacted()}</p>
							</div>
						</div>
					</div>

					{/* Call Details Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Call Answered
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.callAnswered || '-'}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Reason For Non Payment
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.reasonForNonPayment || '-'}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Reason for not watching
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.reasonForNotWatching || '-'}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Commitment Date
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.commitmentDate || '-'}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Amount to Pay
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.amountToPay || '-'}</p>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								Date and Time
							</label>
							<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.dateTime || `${dispositionItem.commitmentDate || ''} ${dispositionItem.time || ''}`.trim() || '-'}</p>
						</div>
					</div>

					{/* Comment Section */}
					<div>
						<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
							Comment
						</label>
						<p className="text-base text-gray-900 dark:text-gray-100 font-medium">{dispositionItem.comment || '-'}</p>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end items-center p-6 border-t border-gray-200 dark:border-gray-700 shrink-0">
					<Button
						variant="primary"
						size="md"
						onClick={onClose}
					>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DispositionHistoryModal;
