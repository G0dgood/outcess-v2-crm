'use client';

import React from 'react';
import moment from 'moment';
import Checkbox from '@/components/ui/Checkbox';
import StatusBadge from '@/components/ui/StatusBadge';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Pagination from '@/components/ui/Pagination';
import { EmailLog } from '@/store/services/emailApi';

interface EmailTableProps {
	emailList: EmailLog[];
	isLoading: boolean;
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	onItemsPerPageChange: (value: number) => void;
	onPageChange: (page: number) => void;
	selectedEmails: Set<string>;
	onSelectAll: (checked: boolean) => void;
	onSelectEmail: (id: string, checked: boolean) => void;
	onViewEmail: (email: EmailLog) => void;
	primaryColor?: string;
}

const EmailTable: React.FC<EmailTableProps> = ({
	emailList,
	isLoading,
	totalItems,
	itemsPerPage,
	currentPage,
	onItemsPerPageChange,
	onPageChange,
	selectedEmails,
	onSelectAll,
	onSelectEmail,
	onViewEmail,
	primaryColor = 'var(--primary)',
}) => {
	const isAllSelected = emailList.length > 0 && emailList.every(e => selectedEmails.has(e._id || ''));

	const getDirectionColor = (direction: EmailLog['direction']) => {
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
					label="Email Logs"
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
								<th>Recipient / Contact</th>
								<th>Email Address</th>
								<th>Subject</th>
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
								<SVGLoaderFetch colSpan={7} text="Loading logs..." />
							) : emailList.length === 0 ? (
								<NoRecordFound colSpan={7} />
							) : emailList.map((email) => {
								const directionColors = getDirectionColor(email.direction);
								return (
									<tr
										key={email._id}
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
												checked={selectedEmails.has(email._id || '')}
												onChange={(checked) => onSelectEmail(email._id || '', checked)}
												size="medium"
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{email.recipientName || '-'}
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{email.emailAddress}
										</td>
										<td
											className="px-6 py-4 dark:text-gray-100 max-w-xs truncate cursor-pointer hover:underline"
											style={{ color: 'var(--text-primary)' }}
											title={email.subject}
											onClick={() => onViewEmail(email)}
										>
											{email.subject}
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
												{email.direction === 'inbound' ? 'Inbound' : 'Outbound'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<StatusBadge status={email.status} />
										</td>
										<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
											{moment(email.createdAt).format('YYYY-MM-DD HH:mm:ss')}
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

export default EmailTable;
