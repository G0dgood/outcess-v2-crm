'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Search from './Search';
import FillDispositionModal, { DispositionFormData } from './FillDispositionModal';
import SMSModal from './SMSModal';
import DispositionHistoryModal from './DispositionHistoryModal';
import { Cross2Icon, ChevronDownIcon, ChatBubbleIcon, ClipboardIcon, PersonIcon, EnvelopeClosedIcon, HomeIcon, MobileIcon, IdCardIcon } from '@radix-ui/react-icons';

interface DispositionHistoryItem {
	id: string;
	date: string;
	time: string;
	agent: string;
	timeSpent: string;
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
	const [searchTerm, setSearchTerm] = useState('');
	const [pageSize, setPageSize] = useState(3);
	const [isFillDispositionModalOpen, setIsFillDispositionModalOpen] = useState(false);
	const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
	const [isDispositionHistoryModalOpen, setIsDispositionHistoryModalOpen] = useState(false);
	const [selectedDispositionData, setSelectedDispositionData] = useState<Partial<DispositionFormData> | undefined>(undefined);
	const [selectedDispositionHistoryItem, setSelectedDispositionHistoryItem] = useState<DispositionHistoryItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	const dispositionHistory: DispositionHistoryItem[] = [
		{
			id: '1',
			date: 'April 7, 2025',
			time: '9:14 AM',
			agent: 'John Doe',
			timeSpent: '2m 23s',
		},
		{
			id: '2',
			date: 'March 23, 2025',
			time: '8:30 AM',
			agent: 'Jane Doe',
			timeSpent: '1m 56s',
		},
		{
			id: '3',
			date: 'March 23, 2025',
			time: '8:30 AM',
			agent: 'Jane Doe',
			timeSpent: '1m 56s',
		},
	];

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

	const handleViewDetails = (dispositionId: string) => {
		const disposition = dispositionHistory.find(item => item.id === dispositionId);
		if (disposition) {
			// Create an enriched disposition item with sample data matching the design
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
			<div className={`bg-gray-50 dark:bg-gray-900 w-full h-full flex flex-col transition-all duration-300 ease-in-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
				{/* Header */}
				<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-5">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Customer Details</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							aria-label="Close"
						>
							<Cross2Icon className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-5">
					<div className="flex items-center justify-end gap-3">
						<Button
							variant="primary"
							size="md"
							className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600 flex items-center gap-2"
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
						<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
							<div className="bg-gradient-to-r from-[#6C8B7D]/10 dark:from-[#6C8B7D]/20 to-transparent p-6 border-b border-gray-200 dark:border-gray-700">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
									<PersonIcon className="w-5 h-5 text-[#6C8B7D]" />
									Personal Information
								</h3>
							</div>
							<div className="p-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
										<PersonIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												First Name
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.firstName || '-'}</p>
										</div>
									</div>
									<div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
										<PersonIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												Last Name
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.lastName || '-'}</p>
										</div>
									</div>
									<div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
										<IdCardIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												Middle Name
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.middleName || '-'}</p>
										</div>
									</div>
									<div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
										<EnvelopeClosedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												Email
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.email || '-'}</p>
										</div>
									</div>
									<div className="flex items-start gap-4 pb-5 border-b border-gray-100 dark:border-gray-700">
										<MobileIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												Phone
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.phone || '-'}</p>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<HomeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
										<div className="flex-1">
											<label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
												Address
											</label>
											<p className="text-base text-gray-900 dark:text-gray-100 font-semibold">{customer.address || '-'}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Disposition History */}
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
						<div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Disposition History</h3>
							<Button
								variant="outline"
								size="md"
								onClick={() => setIsDispositionHistoryModalOpen(true)}
							>
								View All
							</Button>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Date</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Time</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Agent</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Time Spent</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Action</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{dispositionHistory.slice(0, pageSize).map((item) => (
										<tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
											<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">{item.date}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.time}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.agent}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.timeSpent}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<button
													onClick={() => handleViewDetails(item.id)}
													className="text-(--muted-sage-green) dark:text-gray-300 hover:text-(--muted-sage-green)/80 dark:hover:text-gray-200 hover:underline transition-colors font-medium"
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
					// Implement save logic here
				}}
				initialData={selectedDispositionData}
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
			/>
		</div>
	);
};

export default CustomerDetailsModal;

