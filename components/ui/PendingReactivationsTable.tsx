'use client';

import React, { useState } from 'react';
import Button from './Button';
import { useGetPendingReactivationsQuery, useApproveReactivationMutation } from '@/store/services/companyApi';
import { toast } from 'sonner';
import moment from 'moment';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import ApproveReactivationModal from './ApproveReactivationModal';

interface PendingReactivationsTableProps {
	hideTitle?: boolean;
	page?: number;
	limit?: number;
	search?: string;
}

interface PendingUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	companyName?: string;
	reactivationReason?: string;
	createdAt?: string;
	updatedAt?: string;
}

const PendingReactivationsTable: React.FC<PendingReactivationsTableProps> = ({
	hideTitle = false,
	page = 1,
	limit = 10,
	search = ''
}) => {
	const { data: reactivationsData, isLoading } = useGetPendingReactivationsQuery({
		page,
		limit,
		search
	});
	const [approveReactivation, { isLoading: isApproving }] = useApproveReactivationMutation();
	const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const reactivationsDataTyped = (reactivationsData || {}) as { users?: PendingUser[] };
	const pendingUsers = (reactivationsDataTyped.users || []) as PendingUser[];

	const handleApproveClick = (user: PendingUser) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	const handleConfirmApprove = async () => {
		if (!selectedUser) return;
		try {
			await approveReactivation(selectedUser._id).unwrap();
			toast.success('Account reactivated successfully');
			setIsModalOpen(false);
		} catch (error: unknown) {
			toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed to reactivate account');
		}
	};



	return (
		<div
			className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-8 rounded-[16px]"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			{!hideTitle && (
				<h2
					className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100 mb-6"
					style={{ color: 'var(--text-primary)' }}
				>
					Pending Reactivation Requests
				</h2>
			)}
			<div className="overflow-x-auto">
				<table
					className="min-w-full divide-y dark:divide-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<thead
						className="dark:bg-gray-700 border-b dark:border-gray-700"
						style={{
							backgroundColor: 'var(--bg-primary)',
							borderBottomColor: 'var(--light-gray)'
						}}
					>
						<tr>
							<th>User Name</th>
							<th>Company</th>
							<th>Reason</th>
							<th>Request Date</th>
							<th>Action</th>
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
							<SVGLoaderFetch colSpan={5} text="Loading requests..." />
						) : pendingUsers.length === 0 ? (
							<NoRecordFound colSpan={5} />
						) : (
							pendingUsers.map((user: PendingUser) => (
								<tr
									key={user._id}
									className="dark:hover:bg-gray-700 transition-colors"
									style={{ borderColor: 'var(--light-gray)' }}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center gap-3">
											<div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] md:text-[12px] font-bold text-gray-600 dark:text-gray-300">
												{user.firstName[0]}{user.lastName[0]}
											</div>
											<div className="flex flex-col">
												<span
													className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{user.firstName} {user.lastName}
												</span>
												<span
													className="text-[8px] md:text-[10px] dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													{user.email}
												</span>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className="text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{user.companyName || 'N/A'}
										</span>
									</td>
									<td className="px-6 py-4">
										<div className="max-w-xs overflow-hidden text-ellipsis">
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-100 line-clamp-2"
												style={{ color: 'var(--text-primary)' }}
												title={user.reactivationReason}
											>
												{user.reactivationReason || 'No reason provided'}
											</span>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className="text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{user.updatedAt ? moment(user.updatedAt).format('DD MMM YYYY') : 'N/A'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<Button
											variant="primary"
											size="sm"
											onClick={() => handleApproveClick(user)}
											className="text-[10px] md:text-[12px]"
										>
											Approve
										</Button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{selectedUser && (
				<ApproveReactivationModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onConfirm={handleConfirmApprove}
					userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
					isLoading={isApproving}
					reactivationReason={selectedUser.reactivationReason}
				/>
			)}
		</div>
	);
};

export default PendingReactivationsTable;
