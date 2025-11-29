'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import FillDispositionModal, { DispositionFormData } from './FillDispositionModal';
import SMSModal from './SMSModal';
import DispositionHistoryModal from './DispositionHistoryModal';
import { Cross2Icon, ChatBubbleIcon, ClipboardIcon, PersonIcon, EnvelopeClosedIcon, HomeIcon, MobileIcon, IdCardIcon } from '@radix-ui/react-icons';
import { getOfflineDispositions, OfflineDisposition, getSyncedDispositions, SyncedDisposition } from '@/utils/offlineDispositions';
import { useAuth } from '@/contexts/AuthContext';

interface DispositionHistoryItem {
	id: string;
	date: string;
	time: string;
	agent: string;
	timeSpent: string;
	isOffline?: boolean;
	offlineStatus?: 'pending' | 'synced' | 'failed';
	agentId?: string;
	callAnswered?: string;
	reasonForNonPayment?: string;
	reasonForNotWatching?: string;
	commitmentDate?: string;
	amountToPay?: string;
	dateTime?: string;
	comment?: string;
}

interface CustomerDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	customer: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		middleName?: string;
		address?: string;
	} | null;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
	isOpen,
	onClose,
	customer,
}) => {

	const [pageSize, setPageSize] = useState(3);
	const [isFillDispositionModalOpen, setIsFillDispositionModalOpen] = useState(false);
	const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
	const [isDispositionHistoryModalOpen, setIsDispositionHistoryModalOpen] = useState(false);
	const [selectedDispositionData, setSelectedDispositionData] = useState<Partial<DispositionFormData> | undefined>(undefined);
	const [selectedDispositionHistoryItem, setSelectedDispositionHistoryItem] = useState<DispositionHistoryItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [offlineDispositions, setOfflineDispositions] = useState<OfflineDisposition[]>([]);
	const [syncedDispositions, setSyncedDispositions] = useState<SyncedDisposition[]>([]);
	const { user: authUser } = useAuth();

	// Load all dispositions (offline and synced) for this customer
	useEffect(() => {
		if (isOpen && customer?.id) {
			const allOffline = getOfflineDispositions();
			const customerOffline = allOffline.filter(d => d.customerId === customer.id);
			setOfflineDispositions(customerOffline);

			const allSynced = getSyncedDispositions(customer.id);
			setSyncedDispositions(allSynced);
		}
	}, [isOpen, customer?.id, isFillDispositionModalOpen]);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			// Reset animation state first
			setIsAnimating(false);
			document.body.style.overflow = 'hidden';
			// Trigger animation on next frame to ensure DOM is ready
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimating(true);
				});
			});
		} else {
			// Start closing animation
			setIsAnimating(false);
			// Remove from DOM after animation completes
			const timer = setTimeout(() => {
				setShouldRender(false);
				document.body.style.overflow = 'unset';
			}, 300); // Match transition duration
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			if (!isOpen) {
				document.body.style.overflow = 'unset';
			}
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!shouldRender || !customer) return null;

	// Combine synced and offline dispositions (no static data)
	const combinedDispositions: DispositionHistoryItem[] = [
		...syncedDispositions.map((synced): DispositionHistoryItem => ({
			id: synced.id,
			date: synced.date || new Date(synced.syncedAt).toLocaleDateString(),
			time: synced.time || new Date(synced.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			agent: synced.agent || authUser?.name || 'Current User',
			timeSpent: '-',
			isOffline: false,
		})),
		...offlineDispositions.map((offline): DispositionHistoryItem => ({
			id: offline.id,
			date: offline.date || new Date(offline.createdAt).toLocaleDateString(),
			time: offline.time || new Date(offline.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			agent: 'Offline Entry',
			timeSpent: '-',
			isOffline: true,
			offlineStatus: offline.status,
		})),
	].sort((a, b) => {
		// Sort by date (newest first)
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return dateB - dateA;
	});

	const handleViewDetails = (dispositionId: string) => {
		const disposition = combinedDispositions.find(item => item.id === dispositionId);
		if (disposition) {
			// If it's an offline disposition, get the full data
			if (disposition.isOffline) {
				const offlineData = offlineDispositions.find(d => d.id === dispositionId);
				if (offlineData) {
					const enrichedDisposition: DispositionHistoryItem = {
						...disposition,
						agentId: 'Offline Entry',
						callAnswered: offlineData.callAnswered || '-',
						reasonForNonPayment: offlineData.reasonForNonPayment || '-',
						reasonForNotWatching: offlineData.reasonForNotWatching || '-',
						commitmentDate: offlineData.commitmentDate || '-',
						amountToPay: offlineData.amountToPay || '-',
						dateTime: `${offlineData.date || ''} ${offlineData.time || ''}`.trim() || '-',
						comment: offlineData.comment || '-',
					};
					setSelectedDispositionHistoryItem(enrichedDisposition);
					setIsDispositionHistoryModalOpen(true);
					return;
				}
			}
			// If it's a synced disposition, get the full data
			const syncedData = syncedDispositions.find(d => d.id === dispositionId);
			if (syncedData) {
				const enrichedDisposition: DispositionHistoryItem = {
					...disposition,
					agentId: syncedData.agentId || 'user.001',
					callAnswered: syncedData.callAnswered || '-',
					reasonForNonPayment: syncedData.reasonForNonPayment || '-',
					reasonForNotWatching: syncedData.reasonForNotWatching || '-',
					commitmentDate: syncedData.commitmentDate || '-',
					amountToPay: syncedData.amountToPay || '-',
					dateTime: `${syncedData.date || ''} ${syncedData.time || ''}`.trim() || '-',
					comment: syncedData.comment || '-',
				};
				setSelectedDispositionHistoryItem(enrichedDisposition);
				setIsDispositionHistoryModalOpen(true);
				return;
			}
			// For regular dispositions, use sample data
			const enrichedDisposition: DispositionHistoryItem = {
				...disposition,
				agentId: 'agent.107693', // Sample agent ID
				callAnswered: 'Yes',
				reasonForNonPayment: 'No money',
				reasonForNotWatching: 'No light',
				commitmentDate: '12/11/25',
				amountToPay: '3,000',
				dateTime: '12/11/25 02:34',
				comment: 'The customer is willing to pay',
			};
			setSelectedDispositionHistoryItem(enrichedDisposition);
			setIsDispositionHistoryModalOpen(true);
		}
	};

	return (
		<div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
				onClick={onClose}
			/>
			{/* Modal Content */}
			<div
				className={`dark:bg-gray-900 w-full h-full flex flex-col transition-all duration-300 ease-in-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
				style={{ backgroundColor: 'var(--bg-primary)' }}
			>
				{/* Header */}
				<div
					className="dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-5"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex justify-between items-center">
						<h2
							className="text-2xl font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Customer Details
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
				</div>

				{/* Action Buttons */}
				<div
					className="dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-5"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center justify-end gap-3">
						<Button
							variant="primary"
							size="md"
							className="flex items-center gap-2"
							style={{
								backgroundColor: '#F97316',
								color: '#FFFFFF',
								borderColor: '#F97316'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = '#EA580C';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = '#F97316';
							}}
							onClick={() => setIsSMSModalOpen(true)}
							icon={<ChatBubbleIcon className="w-4 h-4" />}
							iconPosition="left"
						>
							SMS
						</Button>
						<Button
							variant="primary"
							size="md"
							onClick={() => setIsFillDispositionModalOpen(true)}
							className="flex items-center gap-2"
							icon={<ClipboardIcon className="w-4 h-4" />}
							iconPosition="left"
						>
							Fill Disposition
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-8">
					{/* Personal Information Section */}
					<div className="mb-8">
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 shadow-sm"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div
								className="bg-linear-to-r from-[#6C8B7D]/10 dark:from-[#6C8B7D]/20 to-transparent p-6 border-b dark:border-gray-700"
								style={{ borderColor: 'var(--light-gray)' }}
							>
								<h3
									className="text-lg font-semibold dark:text-gray-100 flex items-center gap-2"
									style={{ color: 'var(--text-primary)' }}
								>
									<PersonIcon className="w-5 h-5 text-[#6C8B7D]" />
									Personal Information
								</h3>
							</div>
							<div className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div
										className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<PersonIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												First Name
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.firstName || '-'}
											</p>
										</div>
									</div>
									<div
										className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<PersonIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Last Name
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.lastName || '-'}
											</p>
										</div>
									</div>
									<div
										className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<IdCardIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Middle Name
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.middleName || '-'}
											</p>
										</div>
									</div>
									<div
										className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<EnvelopeClosedIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Email
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.email || '-'}
											</p>
										</div>
									</div>
									<div
										className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<MobileIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Phone
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.phone || '-'}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<HomeIcon className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
										<div className="flex-1">
											<label
												className="block text-xs font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Address
											</label>
											<p
												className="text-base dark:text-gray-100 font-semibold"
												style={{ color: 'var(--text-primary)' }}
											>
												{customer.address || '-'}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Disposition History table */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div
							className="p-6 border-b dark:border-gray-700 flex items-center justify-between gap-4"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<h3
								className="text-lg font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Disposition History
							</h3>
							<Button
								variant="outline"
								size="md"
								onClick={() => setIsDispositionHistoryModalOpen(true)}
							>
								View All
							</Button>
						</div>

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
											Status
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Date
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Time
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Agent
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Time Spent
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Action
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
									{combinedDispositions.slice(0, pageSize).map((item) => (
										<tr
											key={item.id}
											className="dark:hover:bg-gray-700 transition-colors"
											style={{ borderColor: 'var(--light-gray)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--accent-white)';
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												{item.isOffline ? (
													<span
														className="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
														style={{
															backgroundColor: item.offlineStatus === 'pending' ? '#FEF3C7' :
																item.offlineStatus === 'synced' ? '#D1FAE5' : '#FEE2E2',
															color: item.offlineStatus === 'pending' ? '#92400E' :
																item.offlineStatus === 'synced' ? '#065F46' : '#991B1B'
														}}
													>
														{item.offlineStatus === 'pending' ? '⏳ Pending' :
															item.offlineStatus === 'synced' ? '✓ Synced' :
																'✗ Failed'}
													</span>
												) : (
													<span
														className="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
														style={{
															backgroundColor: '#E0E7FF',
															color: '#3730A3'
														}}
													>
														✓ Online
													</span>
												)}
											</td>
											<td
												className="px-6 py-4 whitespace-nowrap font-medium dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{item.date}
											</td>
											<td
												className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{item.time}
											</td>
											<td
												className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{item.agent}
											</td>
											<td
												className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{item.timeSpent}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<button
													onClick={() => handleViewDetails(item.id)}
													className="dark:text-gray-300 dark:hover:text-gray-200 hover:underline transition-colors font-medium"
													style={{ color: 'var(--muted-sage-green)' }}
													onMouseEnter={(e) => {
														e.currentTarget.style.color = 'var(--interactive-secondary)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.color = 'var(--muted-sage-green)';
													}}
												>
													View Details
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* Fill Disposition Modal */}
			<FillDispositionModal
				isOpen={isFillDispositionModalOpen}
				onClose={() => {
					setIsFillDispositionModalOpen(false);
					setSelectedDispositionData(undefined);
				}}
				onSave={(data) => {
					console.log('Save disposition:', data);
					// Save to synced dispositions if online, or it will be saved offline automatically
					// Refresh the dispositions list
					if (customer?.id) {
						const allOffline = getOfflineDispositions();
						const customerOffline = allOffline.filter(d => d.customerId === customer.id);
						setOfflineDispositions(customerOffline);

						const allSynced = getSyncedDispositions(customer.id);
						setSyncedDispositions(allSynced);
					}
				}}
				initialData={selectedDispositionData}
				customerId={customer?.id}
				customerName={customer ? `${customer.firstName} ${customer.lastName}`.trim() : undefined}
			/>

			{/* SMS Modal */}
			<SMSModal
				isOpen={isSMSModalOpen}
				onClose={() => setIsSMSModalOpen(false)}
				onSend={(data) => {
					console.log('Send SMS:', data);
					// Implement send SMS logic here
				}}
				initialPhone={customer.phone}
			/>

			{/* Disposition History Modal */}
			<DispositionHistoryModal
				isOpen={isDispositionHistoryModalOpen}
				onClose={() => {
					setIsDispositionHistoryModalOpen(false);
					setSelectedDispositionHistoryItem(null);
				}}
				dispositionItem={selectedDispositionHistoryItem}
				customerId={customer?.id}
			/>
		</div>
	);
};

export default CustomerDetailsModal;

