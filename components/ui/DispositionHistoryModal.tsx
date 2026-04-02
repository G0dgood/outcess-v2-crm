'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { getOfflineDispositions, OfflineDisposition, DispositionFieldEntry, DispositionHistoryItem, OFFLINE_DISPOSITIONS_EVENT } from '@/utils/offlineDispositions';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetDispositionsByCustomerQuery, useGetDispositionsByAgentIdQuery } from '@/store/services/dispositionApi';
import moment from 'moment';

interface DispositionHistoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	dispositionItem?: DispositionHistoryItem | null;
	showOfflineDispositions?: boolean;
	customerId?: string;
	agentId?: string;
}

interface SyncedDispositionViewModel {
	id: string;
	customerName?: string;
	dispositionData: DispositionFieldEntry[];
	syncedAt: string;
	agent?: string;
	agentId?: string;
}

interface ApiDispositionItem {
	_id?: string;
	id?: string;
	customer?: { Name: string };
	customerName?: string;
	fillDisposition?: DispositionFieldEntry[];
	dispositionData?: DispositionFieldEntry[];
	timestamp?: string;
	createdAt?: string;
	syncedAt?: string;
	agent?: { name: string; _id?: string; userId?: string } | string;
	agentId?: string;
}

export const DispositionHistoryModal: React.FC<DispositionHistoryModalProps> = ({
	isOpen,
	onClose,
	dispositionItem,
	showOfflineDispositions = true,
	customerId,
	agentId,
}) => {
	const { selectedCampaignId } = useCampaign();
	const [offlineDispositions, setOfflineDispositions] = useState<OfflineDisposition[]>([]);

	const { data: customerData } = useGetDispositionsByCustomerQuery(
		{
			campaignId: selectedCampaignId || '',
			customerId: customerId || '',
			page: 1,
			limit: 50
		},
		{ skip: !isOpen || !customerId || !selectedCampaignId }
	);

	const { data: agentData } = useGetDispositionsByAgentIdQuery(
		{
			campaignId: selectedCampaignId || '',
			agentId: agentId || '',
			page: 1,
			limit: 50
		},
		{ skip: !isOpen || !agentId || !selectedCampaignId }
	);

	const apiData = customerId ? customerData : agentData;

	const syncedDispositions: SyncedDispositionViewModel[] = React.useMemo(() => {
		if (!apiData) return [];
		const list = Array.isArray(apiData) ? apiData : (apiData.data || []);
		return list?.map((item: ApiDispositionItem) => ({
			id: item._id || item.id || '',
			customerName: item.customer?.Name || item.customerName,
			dispositionData: (item.fillDisposition || item.dispositionData || []) as DispositionFieldEntry[],
			syncedAt: item.timestamp || item.createdAt || item.syncedAt || '',
			agent: (typeof item.agent === 'object' ? item.agent?.name : item.agent) || 'Unknown Agent',
			agentId: (typeof item.agent === 'object' ? (item.agent?.userId || item.agent?._id) : undefined) || item.agentId
		}));
	}, [apiData]);


	// Load offline dispositions
	useEffect(() => {
		const loadOffline = () => {
			if (isOpen && showOfflineDispositions) {
				const allOffline = getOfflineDispositions();
				const filtered = customerId
					? allOffline.filter(d => d.customerId === customerId)
					: allOffline;
				setOfflineDispositions(filtered);
			}
		};

		loadOffline();

		if (isOpen) {
			window.addEventListener(OFFLINE_DISPOSITIONS_EVENT, loadOffline);
		}

		return () => {
			window.removeEventListener(OFFLINE_DISPOSITIONS_EVENT, loadOffline);
		};
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
	const hasDispositions = offlineDispositions?.length > 0 || syncedDispositions?.length > 0;
	const showDispositionsList = !dispositionItem && hasDispositions;

	// Format date contacted
	const formatDateContacted = (item: DispositionHistoryItem) => {
		const dateObj = item.date ? moment(item.date) : moment(item.timestamp);
		if (!dateObj.isValid()) return `${item.date || '-'} [${item.time || '-'}]`;
		return dateObj.format('MMMM D, YYYY h:mm A');
	};

	 

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
								className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Disposition History ({offlineDispositions.length + syncedDispositions.length})
							</h3>

							{/* Synced Dispositions */}
							{syncedDispositions?.map((synced: SyncedDispositionViewModel) => (
								<div
									key={synced.id}
									className="border dark:border-gray-600 p-4"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-center justify-between mb-3">
										<span
											className="text-[8px] md:text-[10px] font-medium px-2 py-1 "
											style={{
												backgroundColor: '#D1FAE5',
												color: '#065F46'
											}}
										>
											✓ Synced
										</span>
										{synced.customerName && (
											<span className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-secondary)' }}>
												{synced.customerName}
											</span>
										)}
									</div>
									<div className="grid grid-cols-2 gap-4 text-[10px] md:text-[12px]">
										{synced?.dispositionData?.map((field: DispositionFieldEntry) => (
											<div key={field?.fieldId}>
												<span style={{ color: 'var(--text-tertiary)' }}>{field?.fieldName}: </span>
												<span style={{ color: 'var(--text-primary)' }}>{String(field?.fieldValue || '-')}</span>
											</div>
										))}
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Date: </span>
											<span style={{ color: 'var(--text-primary)' }}>{new Date(synced.syncedAt).toLocaleDateString()}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Time: </span>
											<span style={{ color: 'var(--text-primary)' }}>{new Date(synced.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Agent: </span>
											<span style={{ color: 'var(--text-primary)' }}>{String(synced.agent || '-')}</span>
										</div>
									</div>
									<div className="mt-2 text-[8px] md:text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
										Synced: {new Date(synced.syncedAt!).toLocaleString()}
									</div>
								</div>
							))}

							{/* Offline Dispositions */}
							{offlineDispositions?.map((offline) => (
								<div
									key={offline.id}
									className="border dark:border-gray-600 p-4 "
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-center justify-between mb-3">
										<span
											className="text-[8px] md:text-[10px] font-medium px-2 py-1 "
											style={{
												backgroundColor: offline.status === 'pending' ? '#FEF3C7' : '#D1FAE5',
												color: offline.status === 'pending' ? '#92400E' : '#065F46'
											}}
										>
											{offline.status === 'pending' ? '⏳ Pending Sync' : '✓ Synced'}
										</span>
										{offline.customerName && (
											<span className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-secondary)' }}>
												{offline.customerName}
											</span>
										)}
									</div>
									<div className="grid grid-cols-2 gap-4 text-[10px] md:text-[12px]">
										{offline.dispositionData?.map((field) => (
											<div key={field.fieldId}>
												<span style={{ color: 'var(--text-tertiary)' }}>{field.fieldName}: </span>
												<span style={{ color: 'var(--text-primary)' }}>{String(field.fieldValue || '-')}</span>
											</div>
										))}
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Date: </span>
											<span style={{ color: 'var(--text-primary)' }}>{new Date(offline.createdAt).toLocaleDateString()}</span>
										</div>
										<div>
											<span style={{ color: 'var(--text-tertiary)' }}>Time: </span>
											<span style={{ color: 'var(--text-primary)' }}>{new Date(offline.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
										</div>
									</div>
									<div className="mt-2 text-[8px] md:text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
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
											className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
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
											className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
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
											className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-1"
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
								{dispositionItem.dispositionData?.map((field) => (
									<div key={field.fieldId}>
										<label
											className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{field.fieldName}
										</label>
										<p
											className="text-base dark:text-gray-100 font-medium"
											style={{ color: 'var(--text-primary)' }}
										>
											{field.fieldType === 'checkbox'
												? (field.fieldValue ? 'Yes' : 'No')
												: String(field.fieldValue || '-')
											}
										</p>
									</div>
								))}
							</div>

							{/* Comment Section */}
							{dispositionItem?.comment && (
								<div>
									<label
										className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Comment
									</label>
									<p
										className="text-base dark:text-gray-100 font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{String(dispositionItem.comment)}
									</p>
								</div>
							)}
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
