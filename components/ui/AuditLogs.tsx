'use client';

import React, { useState } from 'react';
import { useSuperAdminGetActivityLogsByCompanyIdQuery } from '@/store/services/companyApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import PageHeading from './PageHeading';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import Pagination from './Pagination';
import TablePaginationHeader from './TablePaginationHeader';

interface ActivityLog {
	_id: string;
	action: string;
	userId: {
		name: string;
		email: string;
	} | string;
	details: string;
	ipAddress?: string;
	createdAt: string;
}

const AuditLogs: React.FC = () => {
	const { user } = useUserInfo();
	const companyId = user?.companyId || user?.company?._id || '';

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(15);

	const { data: logsData, isLoading } = useSuperAdminGetActivityLogsByCompanyIdQuery(
		{ companyId, page: currentPage, limit: itemsPerPage },
		{ skip: !companyId }
	);

	const rawLogs = logsData?.activityLogs || logsData?.logs || logsData || [];
	const logs: ActivityLog[] = Array.isArray(rawLogs) ? rawLogs : [];

	const totalItems = logsData?.pagination?.total || logs.length;
	const totalPages = logsData?.pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);
	const currentLogs = logs; // Backend already paginated

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<PageHeading text="Audit Logs" />
				<p className="text-[10px] md:text-[12px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
					A complete history of all critical actions performed in this workspace.
				</p>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
			>
				<TablePaginationHeader
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Logs"
				/>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y dark:divide-gray-700">
						<thead style={{ backgroundColor: 'var(--bg-primary)' }}>
							<tr>
								{['Timestamp', 'User', 'Action', 'Details', 'IP Address'].map((header) => (
									<th
										key={header}
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y" style={{ borderColor: 'var(--light-gray)' }}>
							{isLoading ? (
								<SVGLoaderFetch colSpan={5} text="Fetching logs..." />
							) : currentLogs.length === 0 ? (
								<NoRecordFound colSpan={5} />
							) : (
								currentLogs.map((log) => (
									<tr key={log._id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 text-[10px] md:text-[12px]" style={{ color: 'var(--text-secondary)' }}>
											{formatDate(log.createdAt)}
										</td>
										<td className="px-6 py-4 text-[10px] md:text-[12px]">
											<div className="font-medium" style={{ color: 'var(--text-primary)' }}>
												{typeof log.userId === 'object' ? log.userId.name : 'System'}
											</div>
											<div className="text-[8px] md:text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
												{typeof log.userId === 'object' ? log.userId.email : ''}
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium bg-gray-100 text-gray-700 border">
												{log.action}
											</span>
										</td>
										<td className="px-6 py-4 text-[10px] md:text-[12px]" style={{ color: 'var(--text-secondary)' }}>
											{log.details}
										</td>
										<td className="px-6 py-4 text-[10px] md:text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
											{log.ipAddress || '—'}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

			</div>
			{totalPages > 1 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			)}
		</div>
	);
};

export default AuditLogs;
