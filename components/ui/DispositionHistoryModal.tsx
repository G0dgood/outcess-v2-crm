'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { getOfflineDispositions, OfflineDisposition, getSyncedDispositions, SyncedDisposition } from '@/utils/offlineDispositions';

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
	showOfflineDispositions?: boolean;
	customerId?: string;
}

export const DispositionHistoryModal: React.FC<DispositionHistoryModalProps> = ({
	isOpen,
	onClose,
	dispositionItem,
	showOfflineDispositions = true,
	customerId,
}) => {
	const [offlineDispositions, setOfflineDispositions] = useState<OfflineDisposition[]>([]);
	const [syncedDispositions, setSyncedDispositions] = useState<SyncedDisposition[]>([]);

	// Load offline and synced dispositions
	useEffect(() => {
		if (isOpen && showOfflineDispositions) {
			const allOffline = getOfflineDispositions();
			const filtered = customerId
				? allOffline.filter(d => d.customerId === customerId)
				: allOffline;
			setOfflineDispositions(filtered);

			const allSynced = getSyncedDispositions(customerId);
			setSyncedDispositions(allSynced);
		}
	}, [isOpen, showOfflineDispositions, customerId]);
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

	if (!isOpen) return null;

	// Show dispositions list if no specific item is provided
	const hasDispositions = offlineDispositions.length > 0 || syncedDispositions.length > 0;
	const showDispositionsList = !dispositionItem && hasDispositions;

	// Format date contacted
	const formatDateContacted = (item: DispositionHistoryItem) => {
		try {
			const date = new Date(item.date);
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
			return `${item.date} [${item.time}]`;
		}
	};

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
						Disposition History
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

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Dispositions List */}
					{showDispositionsList && (
						<div className="space-y-4">
							<h3
								className="text-lg font-semibold dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Disposition History ({offlineDispositions.length + syncedDispositions.length})
							</h3>

							{/* Synced Dispositions */}
							{syncedDispositions.map((synced) => (
								<div
									key={synced.id}
									className="border dark:border-gray-600 p-4 rounded-lg"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-center justify-between mb-3">
										<span
											className="text-xs font-medium px-2 py-1 rounded"
											style={{
												backgroundColor: '#D1FAE5',
												color: '#065F46'
											}}
										>
											✓ Synced
										</span>
										{synced.customerName && (
											<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
												{synced.customerName}
											</span>
										)}
									</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Call Answered: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.callAnswered || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Amount: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.amountToPay || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Date: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.date || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Time: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.time || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Agent: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.agent || '-'}</span>
										</div>
									</div>
									{synced.comment && (
										<div className="mt-3">
											<span style={{ color: 'var(--text-tertiary)' }}>Comment: </span>
											<span style={{ color: 'var(--text-primary)' }}>{synced.comment}</span>
										</div>
									)}
									<div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
										Synced: {new Date(synced.syncedAt).toLocaleString()}
									</div>
								</div>
							))}

							{/* Offline Dispositions */}
							{offlineDispositions.map((offline) => (
								<div
									key={offline.id}
									className="border dark:border-gray-600 p-4  "
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-center justify-between mb-3">
										<span
											className="text-xs font-medium px-2 py-1 rounded"
											style={{
												backgroundColor: offline.status === 'pending' ? '#FEF3C7' : '#D1FAE5',
												color: offline.status === 'pending' ? '#92400E' : '#065F46'
											}}
										>
											{offline.status === 'pending' ? 'Pending Sync' : 'Synced'}
										</span>
										{offline.customerName && (
											<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
												{offline.customerName}
											</span>
										)}
									</div>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Call Answered: </span>
											<span style={{ color: 'var(--text-primary)' }}>{offline.callAnswered || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Amount: </span>
											<span style={{ color: 'var(--text-primary)' }}>{offline.amountToPay || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Date: </span>
											<span style={{ color: 'var(--text-primary)' }}>{offline.date || '-'}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Time: </span>
											<span style={{ color: 'var(--text-primary)' }}>{offline.time || '-'}</span>
										</div>
									</div>
									{offline.comment && (
										<div className="mt-3">
											<span style={{ color: 'var(--text-tertiary)' }}>Comment: </span>
											<span style={{ color: 'var(--text-primary)' }}>{offline.comment}</span>
										</div>
									)}
									<div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
										Created: {new Date(offline.createdAt).toLocaleString()}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Main Disposition Item */}
					{dispositionItem && (
						<>
							{/* Agent Information Section */}
							<div
								className="dark:bg-gray-700 border dark:border-gray-600 p-6"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<div className="space-y-3">
									<div>
										<label
											className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
											style={{ color: 'var(--text-tertiary)' }}
										>
											Agent Name
										</label>
										<p
											className="text-base dark:text-gray-100 font-semibold"
											style={{ color: 'var(--text-primary)' }}
										>
											{dispositionItem.agent || '-'}
										</p>
									</div>
									<div>
										<label
											className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
											style={{ color: 'var(--text-tertiary)' }}
										>
											Agent ID
										</label>
										<p
											className="text-base dark:text-gray-100 font-semibold"
											style={{ color: 'var(--text-primary)' }}
										>
											{dispositionItem.agentId || '-'}
										</p>
									</div>
									<div>
										<label
											className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
											style={{ color: 'var(--text-tertiary)' }}
										>
											Date Contacted
										</label>
										<p
											className="text-base dark:text-gray-100 font-semibold"
											style={{ color: 'var(--text-primary)' }}
										>
											{formatDateContacted(dispositionItem)}
										</p>
									</div>
								</div>
							</div>

							{/* Call Details Section */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Call Answered
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.callAnswered || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Reason For Non Payment
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.reasonForNonPayment || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Reason for not watching
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.reasonForNotWatching || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Commitment Date
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.commitmentDate || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Amount to Pay
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.amountToPay || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Date and Time
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{dispositionItem.dateTime || `${dispositionItem.commitmentDate || ''} ${dispositionItem.time || ''}`.trim() || '-'}
									</p>
								</div>
							</div>

							{/* Comment Section */}
							<div>
								<label
									className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Comment
								</label>
								<p
									className="text-base dark:text-gray-100 font-medium"
									style={{ color: 'var(--text-primary)' }}
								>
									{dispositionItem.comment || '-'}
								</p>
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				<div
					className="flex justify-end items-center p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
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
