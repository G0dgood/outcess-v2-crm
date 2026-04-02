'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import FillDispositionModal, { DispositionFormState } from '@/components/ui/FillDispositionModal';
import SMSModal from '@/components/ui/SMSModal';
import DispositionHistoryModal from '@/components/ui/DispositionHistoryModal';
import Modal from '@/components/ui/Modal';
import { Cross2Icon, ChatBubbleIcon, ClipboardIcon, PersonIcon, EnvelopeClosedIcon, HomeIcon, MobileIcon } from '@radix-ui/react-icons';
import { getOfflineDispositions, OfflineDisposition, DispositionFieldEntry, DispositionHistoryItem } from '@/utils/offlineDispositions';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetDispositionsByCustomerQuery } from '@/store/services/dispositionApi';

interface CustomerDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	customer: {
		id: string;
		[key: string]: string | number | boolean | null | undefined;
	} | null;
}

interface ApiDispositionItem {
	_id?: string;
	id?: string;
	timestamp?: string;
	createdAt?: string;
	syncedAt?: string;
	agent?: { name: string; userId?: string; _id?: string } | string;
	agentId?: string;
	fillDisposition?: DispositionFieldEntry[];
	dispositionData?: DispositionFieldEntry[];
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
	isOpen,
	onClose,
	customer,
}) => {



	const [pageSize] = useState(3);
	const [isFillDispositionModalOpen, setIsFillDispositionModalOpen] = useState(false);
	const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
	const [isDispositionHistoryModalOpen, setIsDispositionHistoryModalOpen] = useState(false);
	const [selectedDispositionData, setSelectedDispositionData] = useState<Partial<DispositionFormState> | undefined>(undefined);
	const [selectedDispositionHistoryItem, setSelectedDispositionHistoryItem] = useState<DispositionHistoryItem | null>(null);
	const [fullComment, setFullComment] = useState<string | null>(null);
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [offlineDispositions, setOfflineDispositions] = useState<OfflineDisposition[]>([]);
	const { selectedCampaignId } = useCampaign();

	const { data: apiData, isLoading: isApiLoading } = useGetDispositionsByCustomerQuery(
		{
			campaignId: selectedCampaignId || '',
			customerId: customer?.id || '',
			page: 1,
			limit: 50
		},
		{ skip: !isOpen || !customer?.id || !selectedCampaignId }
	);

	// Load offline dispositions for this customer
	useEffect(() => {
		if (isOpen && customer?.id) {
			const allOffline = getOfflineDispositions();
			const customerOffline = allOffline.filter(d => d.customerId === customer.id);
			setOfflineDispositions(customerOffline);
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

	// Combine synced and offline dispositions (no static data)
	const combinedDispositions: DispositionHistoryItem[] = React.useMemo(() => {
		const syncedList = apiData ? (Array.isArray(apiData) ? apiData : apiData.data || []) : [];
		const mappedSynced = syncedList.map((item: ApiDispositionItem) => ({
			id: item._id || item.id || '',
			date: new Date(item.timestamp || item.createdAt || item.syncedAt || '').toLocaleDateString(),
			time: new Date(item.timestamp || item.createdAt || item.syncedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			agent: (typeof item.agent === 'object' ? item.agent?.name : item.agent) || 'Unknown Agent',
			agentId: (typeof item.agent === 'object' ? (item.agent?.userId || item.agent?._id) : item.agentId) || '-',
			isOffline: false,
			dispositionData: item.fillDisposition || item.dispositionData || [],
			timestamp: new Date(item.timestamp || item.createdAt || item.syncedAt || '').getTime()
		}));

		const mappedOffline = offlineDispositions.map((offline): DispositionHistoryItem => {
			const dateStr = new Date(offline.createdAt).toLocaleDateString();
			const timeStr = new Date(offline.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			return {
				id: offline.id,
				date: dateStr,
				time: timeStr,
				agent: offline?.agent,
				agentId: offline?.agentId || '-',
				isOffline: true,
				offlineStatus: offline?.status,
				dispositionData: offline?.dispositionData,
				timestamp: new Date(offline?.createdAt).getTime()
			};
		});

		return [...mappedSynced, ...mappedOffline].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
	}, [apiData, offlineDispositions]);

	const dynamicHeaders = React.useMemo(() => {
		const headers = new Set<string>();
		combinedDispositions.forEach(item => {
			item.dispositionData?.forEach((field: DispositionFieldEntry) => {
				if (field.fieldName) headers.add(field.fieldName);
			});
		});
		return Array.from(headers);
	}, [combinedDispositions]);

	const handleViewDetails = (dispositionId: string) => {
		const disposition = combinedDispositions.find(item => item.id === dispositionId);
		if (disposition) {
			// If it's an offline disposition, get the full data
			if (disposition.isOffline) {
				const offlineData = offlineDispositions.find(d => d.id === dispositionId);
				if (offlineData) {
					const enrichedDisposition: DispositionHistoryItem = {
						...disposition,
						dispositionData: offlineData.dispositionData,
						agentId: 'Offline Entry',
					};
					setSelectedDispositionHistoryItem(enrichedDisposition);
					setIsDispositionHistoryModalOpen(true);
					return;
				}
			}
			// If it's a synced disposition, get the full data from API list
			// The disposition object already contains the data from apiData mapping
			setSelectedDispositionHistoryItem(disposition);
			setIsDispositionHistoryModalOpen(true);
			return;
		}
	};

	const handleCommentClick = (comment: string) => {
		setFullComment(comment);
		setIsCommentModalOpen(true);
	};

	if (!shouldRender || !customer) return null;

	return (
		<div>

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
								className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Customer Details
							</h2>
							<Button
								variant="ghost"
								size="sm"
								onClick={onClose}
								className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors h-auto"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
								title="Close Modal"
								aria-label="Close"
							>
								<Cross2Icon className="w-5 h-5" />
							</Button>
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
								className="dark:bg-gray-800 border dark:border-gray-700 shadow-sm rounded-[var(--radius)]"
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
										className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 flex items-center gap-2"
										style={{ color: 'var(--text-primary)' }}
									>
										<PersonIcon className="w-5 h-5 text-[#6C8B7D]" />
										Personal Information
									</h3>
								</div>
								<div className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{Object.entries(customer)
											.filter(([key]) => !['id', '_id', 'companyId', 'campaignId', 'createdAt', 'updatedAt', '__v'].includes(key) && key.toLowerCase() !== 'searchid')
											.map(([key, value]) => {
												let IconComponent = PersonIcon;
												const lowerKey = key.toLowerCase();
												if (lowerKey.includes('phone')) IconComponent = MobileIcon;
												else if (lowerKey.includes('email')) IconComponent = EnvelopeClosedIcon;
												else if (lowerKey.includes('address')) IconComponent = HomeIcon;
												else IconComponent = PersonIcon;

												return (
													<div
														key={key}
														className="flex items-start gap-4 pb-5 border-b dark:border-gray-700"
														style={{ borderColor: 'var(--light-gray)' }}
													>
														<IconComponent className="w-5 h-5 dark:text-gray-500 mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
														<div className="flex-1">
															<label
																className="block text-[8px] md:text-[10px] font-medium dark:text-gray-400 uppercase tracking-wider mb-2"
																style={{ color: 'var(--text-tertiary)' }}
															>
																{key}
															</label>
															<p
																className="text-base dark:text-gray-100 font-semibold break-all"
																style={{ color: 'var(--text-primary)' }}
															>
																{value ? String(value) : '-'}
															</p>
														</div>
													</div>
												);
											})}
									</div>
								</div>
							</div>
						</div>

						{/* Disposition History table */}
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden"
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
									className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Disposition History
								</h3>
								{combinedDispositions.length > 0 && (
									<Button
										variant="outline"
										size="md"
										onClick={() => setIsDispositionHistoryModalOpen(true)}
									>
										View All
									</Button>
								)}
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
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
												style={{ color: 'var(--text-primary)' }}
											>
												Status
											</th>
											<th
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
												style={{ color: 'var(--text-primary)' }}
											>
												Date
											</th>
											<th
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
												style={{ color: 'var(--text-primary)' }}
											>
												Time
											</th>
											<th
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
												style={{ color: 'var(--text-primary)' }}
											>
												Agent
											</th>
											{dynamicHeaders.map((header) => (
												<th
													key={header}
													className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
													style={{ color: 'var(--text-primary)' }}
												>
													{header}
												</th>
											))}
											<th
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
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
										{isApiLoading ? (
											<SVGLoaderFetch colSpan={5 + dynamicHeaders.length} text={''} />
										) : combinedDispositions.length === 0 ? (
											<NoRecordFound colSpan={5 + dynamicHeaders.length} />
										) : combinedDispositions?.slice(0, pageSize).map((item) => (
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
															className="inline-flex items-center px-2 py-1 text-[8px] md:text-[10px] font-medium "
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
															className="inline-flex items-center px-2 py-1 text-[8px] md:text-[10px] font-medium "
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
													className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{item.time}
												</td>
												<td
													className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{item.agent}
												</td>
												{dynamicHeaders?.map((header) => {
													const field = item.dispositionData?.find((f: DispositionFieldEntry) => f.fieldName === header);
													const isComment = header.toLowerCase().includes('comment');
													const value = field ? String(field.fieldValue || '-') : '-';
													const displayValue = isComment && value.length > 20 ? `${value.substring(0, 20)}...` : value;

													return (
														<td
															key={header}
															className={`px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100 ${isComment && value.length > 20 ? 'cursor-pointer hover:underline text-orange-500' : ''}`}
															style={{ color: isComment && value.length > 20 ? '#F97316' : 'var(--text-primary)' }}
															onClick={() => isComment && value.length > 20 ? handleCommentClick(value) : undefined}
														>
															{displayValue}
														</td>
													);
												})}
												<td className="px-6 py-4 whitespace-nowrap">
													<Button
														variant="link"
														size="sm"
														onClick={() => handleViewDetails(item.id)}
														className="dark:text-gray-300 dark:hover:text-gray-200 hover:underline transition-colors font-medium p-0 h-auto"
														style={{ color: 'var(--muted-sage-green)' }}
														onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
															e.currentTarget.style.color = 'var(--interactive-secondary)';
														}}
														onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
															e.currentTarget.style.color = 'var(--muted-sage-green)';
														}}
														title="View Disposition Details"
													>
														View Details
													</Button>
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
					onSave={() => {
						// Save to synced dispositions if online, or it will be saved offline automatically
						// Refresh the dispositions list
						if (customer?.id) {
							const allOffline = getOfflineDispositions();
							const customerOffline = allOffline.filter(d => d?.customerId === customer?.id);
							setOfflineDispositions(customerOffline);
							// API data automatically refetches due to tag invalidation
						}
					}}
					initialData={selectedDispositionData}
					customerId={customer?.id}
					customerName={customer ? `${String(customer?.firstName || '')} ${String(customer?.lastName || '')}`.trim() : undefined}
					customer={customer}
				/>

				{/* SMS Modal */}
				<SMSModal
					isOpen={isSMSModalOpen}
					onClose={() => setIsSMSModalOpen(false)}
					onSend={() => {
						// Implement send SMS logic here 
					}}
					initialPhone={customer?.phone ? String(customer.phone) : undefined}
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

				<Modal
					isOpen={isCommentModalOpen}
					onClose={() => {
						setIsCommentModalOpen(false);
						setFullComment(null);
					}}
					title="Full Comment"
				>
					<div className="p-6">
						<p 
							className="text-base leading-relaxed dark:text-gray-300 whitespace-pre-wrap"
							style={{ color: 'var(--text-primary)' }}
						>
							{fullComment}
						</p>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default CustomerDetailsModal;

