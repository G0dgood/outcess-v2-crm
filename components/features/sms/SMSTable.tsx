'use client';

import React from 'react';
import moment from 'moment';
import Checkbox from '@/components/ui/Checkbox';
import StatusBadge from '@/components/ui/StatusBadge';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Pagination from '@/components/ui/Pagination';
import { SMSLog } from '@/store/services/smsApi';

interface SMSTableProps {
	smsList: SMSLog[];
	isLoading: boolean;
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	onItemsPerPageChange: (value: number) => void;
	onPageChange: (page: number) => void;
	selectedSMS: Set<string>;
	onSelectAll: (checked: boolean) => void;
	onSelectSMS: (id: string, checked: boolean) => void;
	onViewSMS: (sms: SMSLog) => void;
	primaryColor?: string;
}

const SMSTable: React.FC<SMSTableProps> = ({
	smsList,
	isLoading,
	totalItems,
	itemsPerPage,
	currentPage,
	onItemsPerPageChange,
	onPageChange,
	selectedSMS,
	onSelectAll,
	onSelectSMS,
	onViewSMS,
	primaryColor = 'var(--primary)',
}) => {
	const isAllSelected = smsList.length > 0 && smsList.every(sms => selectedSMS.has(sms._id || ''));

	const getDirectionColor = (direction: SMSLog['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	return (
		<>
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={onItemsPerPageChange}
					label="SMS Logs"
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
										onChange={onSelectAll}
										size="medium"
									/>
								</th>
								<th>ID</th>
								<th>Contact Name</th>
								<th>Phone Number</th>
								<th>Message</th>
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
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text="Loading logs..." />
							) : smsList.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : smsList.map((sms) => {
								const directionColors = getDirectionColor(sms.direction);
								return (
									<tr
										key={sms._id}
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
												checked={selectedSMS.has(sms._id || '')}
												onChange={(checked) => onSelectSMS(sms._id || '', checked)}
												size="medium"
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100 text-xs" style={{ color: 'var(--text-primary)' }}>
											{sms._id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{sms.contactName || '-'}
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{sms.phoneNumber}
										</td>
										<td
											className="px-6 py-4 dark:text-gray-100 max-w-xs truncate cursor-pointer hover:underline"
											style={{ color: 'var(--text-primary)' }}
											title={sms.message}
											onClick={() => onViewSMS(sms)}
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
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{moment(sms.createdAt).format('YYYY-MM-DD HH:mm:ss')}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{totalItems > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={Math.ceil(totalItems / itemsPerPage)}
					onPageChange={onPageChange}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={primaryColor}
				/>
			)}
		</>
	);
};

export default SMSTable;
