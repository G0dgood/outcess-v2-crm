'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Checkbox from '@/components/ui/Checkbox';
import PageHeading from '@/components/ui/PageHeading';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import SMSMessageModal, { SMS } from '@/components/features/sms/SMSMessageModal';
import SMSMessagePreview from '@/components/features/sms/SMSMessagePreview';






const SMSPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('customerSMS', 'view');
	const canCreate = canAccess('customerSMS', 'create');
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [selectedSMS, setSelectedSMS] = useState<Set<string>>(new Set());
	const [viewingSMS, setViewingSMS] = useState<SMS | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [smsList] = useState<SMS[]>([
		{
			id: 'SMS001',
			phoneNumber: '+234 802 345 6789',
			message: 'Thank you for your inquiry. We will get back to you shortly.',
			status: 'delivered',
			direction: 'outbound',
			timestamp: '2024-01-15 10:30 AM',
			contactName: 'John Doe',
		},
		{
			id: 'SMS002',
			phoneNumber: '+234 803 456 7890',
			message: 'Hello, I would like to know more about your services.',
			status: 'sent',
			direction: 'inbound',
			timestamp: '2024-01-15 09:15 AM',
			contactName: 'Jane Smith',
		},
		{
			id: 'SMS003',
			phoneNumber: '+234 804 567 8901',
			message: 'Your appointment has been confirmed for tomorrow at 2 PM.',
			status: 'delivered',
			direction: 'outbound',
			timestamp: '2024-01-14 03:45 PM',
		},
		{
			id: 'SMS004',
			phoneNumber: '+234 805 678 9012',
			message: 'Payment reminder: Your invoice #12345 is due in 3 days.',
			status: 'pending',
			direction: 'outbound',
			timestamp: '2024-01-14 11:20 AM',
		},
		{
			id: 'SMS005',
			phoneNumber: '+234 806 789 0123',
			message: 'Thank you for contacting us. How can I assist you today?',
			status: 'failed',
			direction: 'outbound',
			timestamp: '2024-01-13 04:30 PM',
			contactName: 'Alice Johnson',
		},
	]);

	const filteredSMS = smsList.filter(sms =>
		sms.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sms.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
		sms.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(sms.contactName && sms.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const totalPages = Math.ceil(filteredSMS.length / itemsPerPage);
	const currentSMS = filteredSMS.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedSMS(new Set(currentSMS.map(sms => sms.id)));
			setIsDrawerOpen(true);
		} else {
			setSelectedSMS(new Set());
			setIsDrawerOpen(false);
		}
	};

	const handleSelectSMS = (smsId: string, checked: boolean) => {
		const newSelected = new Set(selectedSMS);
		if (checked) {
			newSelected.add(smsId);
			setSelectedSMS(newSelected);
			setIsDrawerOpen(true);
		} else {
			newSelected.delete(smsId);
			setSelectedSMS(newSelected);
			// Close drawer if no items are selected
			if (newSelected.size === 0) {
				setIsDrawerOpen(false);
			}
		}
	};

	const isAllSelected = currentSMS.length > 0 && currentSMS.every(sms => selectedSMS.has(sms.id));

	// Handle drawer animations
	useEffect(() => {
		if (isDrawerOpen) {
			setShouldRenderDrawer(true);
			// Trigger animation after a tiny delay to ensure DOM is ready
			setTimeout(() => setIsDrawerAnimating(true), 10);
		} else {
			// Start exit animation
			setIsDrawerAnimating(false);
			// Remove from DOM after animation completes (300ms)
			const timer = setTimeout(() => {
				setShouldRenderDrawer(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isDrawerOpen]);

	const getDirectionColor = (direction: SMS['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Title */}
			<div className="mb-6 flex items-start justify-between">
				<PageHeading text="SMS"
				/>
			</div>

			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<Search
					placeholder="Search SMS by phone number, message, or contact name"
					value={searchTerm}
					onChange={setSearchTerm}
					className="w-full sm:w-auto"
					maxWidth="w-full"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={() => console.log('Send SMS clicked')}
							className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
						>
							<ChatBubbleIcon className="w-4 h-4" />
							Send SMS
						</Button>
					)}
				</div>
			</div>

			{/* SMS Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={filteredSMS.length}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="SMS"
				/>
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
								<th>
									<Checkbox
										checked={isAllSelected}
										onChange={handleSelectAll}
										size="medium"
									/>
								</th>
								<th>ID</th>
								<th>Contact</th>
								<th>Phone Number</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Message
								</th>
								<th>Direction</th>
								<th>Status</th>
								<th>Timestamp</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{currentSMS.map((sms) => {
								const directionColors = getDirectionColor(sms.direction);
								return (
									<tr
										key={sms.id}
										className="dark:hover:bg-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<Checkbox
												checked={selectedSMS.has(sms.id)}
												onChange={(checked) => handleSelectSMS(sms.id, checked)}
												size="medium"
											/>
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{sms.id}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{sms.contactName || '-'}
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{sms.phoneNumber}
										</td>
										<td
											className="px-6 py-4 dark:text-gray-100 max-w-xs truncate cursor-pointer hover:underline"
											style={{ color: 'var(--text-primary)' }}
											title={sms.message}
											onClick={() => setViewingSMS(sms)}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = campaignData.primaryColor || '#050711';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-primary)';
											}}
										>
											{sms.message}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
												style={{
													backgroundColor: directionColors.bg,
													color: directionColors.text,
													border: `1px solid ${directionColors.border}`
												}}
											>
												{sms.direction === 'inbound' ? 'Inbound' : 'Outbound'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<StatusBadge status={sms.status} />
										</td>
										<td
											className="px-6 py-4 whitespace-nowrap dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{sms.timestamp}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{filteredSMS.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}

			{/* Selected SMS Drawer */}
			{shouldRenderDrawer && (
				<div
					className={`fixed top-0 right-0 h-full w-full max-w-md dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerAnimating ? 'translate-x-0' : 'translate-x-full'}`}
					style={{ backgroundColor: 'var(--accent-white)' }}
				>
					{/* Drawer Header */}
					<div
						className="flex justify-between items-center border-b dark:border-gray-700 p-6"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<div className="flex items-center gap-3">
							<ChatBubbleIcon
								className="w-5 h-5 dark:text-gray-300"
								style={{ color: 'var(--text-primary)' }}
							/>
							<h2
								className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Selected SMS ({selectedSMS.size})
							</h2>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsDrawerOpen(false)}
							className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full"
							style={{ color: 'var(--text-tertiary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}}
						>
							<Icon name="Close_round_light" size="lg" />
						</Button>
					</div>

					{/* Drawer Content */}
					<div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
						{selectedSMS.size === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<ChatBubbleIcon
									className="w-12 h-12 mb-4 dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								/>
								<p
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No SMS selected
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{smsList
									.filter(sms => selectedSMS.has(sms.id))
									.map((sms) => (
										<SMSMessagePreview
											key={sms.id}
											sms={sms}
											onViewFull={(selectedSms) => {
												setViewingSMS(selectedSms);
												setIsDrawerOpen(false);
											}}
											getDirectionColor={getDirectionColor}
										/>
									))}
							</div>
						)}
					</div>
				</div>
			)}

			<SMSMessageModal
				isOpen={!!viewingSMS}
				sms={viewingSMS}
				onClose={() => setViewingSMS(null)}
			/>
		</div>
	);
};

export default SMSPage;
