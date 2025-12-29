'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import Checkbox from '@/components/ui/Checkbox';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface SMS {
	id: string;
	phoneNumber: string;
	message: string;
	status: 'sent' | 'delivered' | 'failed' | 'pending';
	direction: 'inbound' | 'outbound';
	timestamp: string;
	contactName?: string;
}

const SMSPage: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('customerSMS', 'view');
	const canCreate = canAccess('customerSMS', 'create');
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
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

	const smsPerPage = 10;
	const totalPages = Math.ceil(filteredSMS.length / smsPerPage);
	const currentSMS = filteredSMS.slice(
		(currentPage - 1) * smsPerPage,
		currentPage * smsPerPage
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

	const getStatusColor = (status: SMS['status']) => {
		switch (status) {
			case 'delivered':
				return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' };
			case 'sent':
				return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
			case 'pending':
				return { bg: 'rgba(251, 191, 36, 0.1)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' };
			case 'failed':
				return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' };
			default:
				return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.2)' };
		}
	};

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
				<PageHeading text="SMS" />
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
							className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
						>
							<ChatBubbleIcon className="w-4 h-4" />
							Send SMS
						</Button>
					)}
				</div>
			</div>

			{/* SMS Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
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
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									ID
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Contact
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Phone Number
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Message
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Direction
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Status
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Timestamp
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
							{currentSMS.map((sms) => {
								const statusColors = getStatusColor(sms.status);
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
												e.currentTarget.style.color = lineOfBusinessData.primaryColor || '#050711';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-primary)';
											}}
										>
											{sms.message}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
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
											<span
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
												style={{
													backgroundColor: statusColors.bg,
													color: statusColors.text,
													border: `1px solid ${statusColors.border}`
												}}
											>
												{sms.status.charAt(0).toUpperCase() + sms.status.slice(1)}
											</span>
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
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				showEllipsis={true}
				maxVisiblePages={5}
				primaryColor={lineOfBusinessData?.primaryColor || '#050711'}
				secondaryColor={lineOfBusinessData?.secondaryColor || '#6C8B7D'}
			/>

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
								className="font-inter text-lg font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Selected SMS ({selectedSMS.size})
							</h2>
						</div>
						<button
							onClick={() => setIsDrawerOpen(false)}
							className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
							style={{ color: 'var(--text-tertiary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}}
						>
							<Icon name="Close_round_light" size="lg" />
						</button>
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
									className="text-sm dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No SMS selected
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{smsList
									.filter(sms => selectedSMS.has(sms.id))
									.map((sms) => {
										const statusColors = getStatusColor(sms.status);
										const directionColors = getDirectionColor(sms.direction);
										return (
											<div
												key={sms.id}
												className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg"
												style={{
													backgroundColor: 'var(--bg-primary)',
													borderColor: 'var(--light-gray)'
												}}
											>
												{/* SMS Header */}
												<div className="flex justify-between items-start mb-3">
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-2">
															<span
																className="text-xs font-medium dark:text-gray-300"
																style={{ color: 'var(--text-secondary)' }}
															>
																{sms.id}
															</span>
															<span
																className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
																style={{
																	backgroundColor: directionColors.bg,
																	color: directionColors.text,
																	border: `1px solid ${directionColors.border}`
																}}
															>
																{sms.direction === 'inbound' ? 'Inbound' : 'Outbound'}
															</span>
															<span
																className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
																style={{
																	backgroundColor: statusColors.bg,
																	color: statusColors.text,
																	border: `1px solid ${statusColors.border}`
																}}
															>
																{sms.status.charAt(0).toUpperCase() + sms.status.slice(1)}
															</span>
														</div>
														{sms.contactName && (
															<p
																className="text-sm font-medium dark:text-gray-100 mb-1"
																style={{ color: 'var(--text-primary)' }}
															>
																{sms.contactName}
															</p>
														)}
														<p
															className="text-xs dark:text-gray-400"
															style={{ color: 'var(--text-tertiary)' }}
														>
															{sms.phoneNumber}
														</p>
													</div>
												</div>

												{/* Message Preview */}
												<div
													className="mt-3 p-3 dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-gray-200 line-clamp-3"
													style={{
														backgroundColor: 'var(--accent-white)',
														borderColor: 'var(--light-gray)',
														color: 'var(--text-primary)'
													}}
												>
													{sms.message}
												</div>

												{/* Timestamp */}
												<p
													className="text-xs mt-2 dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													{sms.timestamp}
												</p>

												{/* View Full Message Button */}
												<button
													onClick={() => {
														setViewingSMS(sms);
														setIsDrawerOpen(false);
													}}
													className="mt-3 w-full text-xs py-2 px-3 rounded border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600"
													style={{
														borderColor: 'var(--light-gray)',
														color: 'var(--text-secondary)',
														backgroundColor: 'transparent'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
												>
													View Full Message
												</button>
											</div>
										);
									})}
							</div>
						)}
					</div>
				</div>
			)}

			{/* SMS Message Modal */}
			{viewingSMS && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => setViewingSMS(null)}
				>
					<div
						className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg"
						style={{ backgroundColor: 'var(--accent-white)' }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div
							className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<div className="flex items-center gap-3">
								<ChatBubbleIcon
									className="w-6 h-6 dark:text-gray-300"
									style={{ color: 'var(--text-primary)' }}
								/>
								<h2
									className="font-inter text-xl font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									SMS Message Details
								</h2>
							</div>
							<button
								onClick={() => setViewingSMS(null)}
								className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}}
							>
								<Icon name="Close_round_light" size="lg" />
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6 space-y-6">
							{/* Message Content */}
							<div>
								<label
									className="block text-sm font-medium mb-2 dark:text-gray-300"
									style={{ color: 'var(--text-secondary)' }}
								>
									Message
								</label>
								<div
									className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg min-h-[120px] whitespace-pre-wrap break-words"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)'
									}}
								>
									{viewingSMS.message}
								</div>
							</div>

							{/* SMS Details Grid */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										SMS ID
									</label>
									<p
										className="text-sm dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingSMS.id}
									</p>
								</div>
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Contact Name
									</label>
									<p
										className="text-sm dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingSMS.contactName || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Phone Number
									</label>
									<p
										className="text-sm dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingSMS.phoneNumber}
									</p>
								</div>
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Timestamp
									</label>
									<p
										className="text-sm dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingSMS.timestamp}
									</p>
								</div>
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Direction
									</label>
									<span
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
										style={getDirectionColor(viewingSMS.direction)}
									>
										{viewingSMS.direction === 'inbound' ? 'Inbound' : 'Outbound'}
									</span>
								</div>
								<div>
									<label
										className="block text-sm font-medium mb-2 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Status
									</label>
									<span
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
										style={getStatusColor(viewingSMS.status)}
									>
										{viewingSMS.status.charAt(0).toUpperCase() + viewingSMS.status.slice(1)}
									</span>
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div
							className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<Button
								variant="outline"
								size="md"
								onClick={() => setViewingSMS(null)}
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SMSPage;
