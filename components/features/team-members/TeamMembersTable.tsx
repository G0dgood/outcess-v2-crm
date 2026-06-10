'use client';

import React from 'react';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Pagination from '@/components/ui/Pagination';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import {
	DotFilledIcon,
	PlusIcon,
	Cross2Icon
} from '@radix-ui/react-icons';
import AssignBucketModal from './AssignBucketModal';
import { useRemoveMemberFromBucketMutation, Campaign } from '@/store/services/campaignApi';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { Bucket } from '@/contexts/SetupContext';

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: string | { roleName?: string; name?: string };
	supervisor: string;
	status: string;
	statusColor?: string;
	reason?: string;
	team: string;
	shiftHourTitle?: string;
}

interface TeamMembersTableProps {
	teamMembersResponse: {
		pagination?: {
			total: number;
		};
	} | null | undefined;
	currentMembers: TeamMember[];
	itemsPerPage: number;
	setItemsPerPage: (value: number) => void;
	currentPage: number;
	setCurrentPage: (value: number) => void;
	totalPages: number;
	isLoading: boolean;
	campaignData: Campaign | undefined;
	setStatusModalMember: (member: TeamMember) => void;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
	teamMembersResponse,
	currentMembers,
	itemsPerPage,
	setItemsPerPage,
	currentPage,
	setCurrentPage,
	totalPages,
	isLoading,
	campaignData,
	setStatusModalMember,
}) => {
	const [selectedMemberForBucket, setSelectedMemberForBucket] = React.useState<TeamMember | null>(null);
	const [removeMemberFromBucket, { isLoading: isRemoving }] = useRemoveMemberFromBucketMutation();

	const handleRemoveBucket = async (memberId: string, bucketId: string, bucketName: string) => {
		if (window.confirm(`Are you sure you want to remove this member from "${bucketName}"?`)) {
			try {
				const campaignId = (campaignData?._id || campaignData?.id || '') as string;
				await removeMemberFromBucket({ id: campaignId, bucketId, memberId }).unwrap();
				toastSuccess(`Removed from ${bucketName}`);
			} catch (error: unknown) {
				const err = error as { data?: { message?: string } };
				toastError(err?.data?.message || 'Failed to remove from bucket');
			}
		}
	};
	return (
		<div>
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)',
				}}
			>
				<TablePaginationHeader
					totalItems={teamMembersResponse?.pagination?.total || 0}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Team Members"
				/>

				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead>
							<tr>
								{[
									{ label: 'User ID' },
									{ label: 'Full Name' },
									{ label: 'Email' },
									{ label: 'Phone No' },
									{ label: 'Role' },
									{ label: 'Supervisor' },
									{ label: 'Shift Hour' },
									{ label: 'Bucket' },
									{ label: 'Logged In Status' }
								].map(({ label }) => (
									<th
										key={label}
										className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider"
									>
										<div className="flex items-center gap-1.5">
											{label}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody
							className="divide-y dark:divide-gray-700"
							style={{
								borderColor: 'var(--light-gray)',
							}}
						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={9} text={''} />
							) : currentMembers?.length === 0 ? (
								<NoRecordFound colSpan={9} />
							) : (
								currentMembers?.map((member, index) => (
									<tr
										key={`${member.agentId}-${index}`}
										className="transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.agentId}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{member?.fullName}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member?.email}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member?.phone}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] capitalize dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{typeof member.role === 'object'
												? (member?.role?.roleName || member?.role?.name || 'Member')
												: (member?.role || 'Member')}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.supervisor}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{member.shiftHourTitle || 'No shift assigned'}
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											<div className="flex flex-wrap items-center gap-1.5">
												{campaignData?.dashboardSettings?.buckets
													?.filter((b) =>
														b.assignedMembers?.some((m) => {
															const mId = typeof m.memberId === 'object' && m.memberId !== null
																? (m.memberId as { _id?: string; id?: string })._id || (m.memberId as { _id?: string; id?: string }).id
																: m.memberId;
															return mId === member._id;
														})
													)
													.map((b) => (
														<span
															key={b.id}
															className="group/tag inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full text-white font-medium shadow-sm transition-all hover:pr-1"
															style={{ backgroundColor: b.color || '#6B7280' }}
															title={b.name}
														>
															{b.name}
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleRemoveBucket(member._id, b.id, b.name);
																}}
																className="opacity-0 group-hover/tag:opacity-100 hover:bg-white/20 rounded-full p-0.5 transition-all"
																disabled={isRemoving}
															>
																<Cross2Icon className="w-2 h-2" />
															</button>
														</span>
													))
												}
												<button
													onClick={() => setSelectedMemberForBucket(member)}
													className="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
													title="Assign to Bucket"
												>
													<PlusIcon className="w-3 h-3" />
												</button>
												{(!campaignData?.dashboardSettings?.buckets?.some((b) =>
													b.assignedMembers?.some((m) => {
														const mId = typeof m.memberId === 'object' && m.memberId !== null
															? (m.memberId as { _id?: string; id?: string })._id || (m.memberId as { _id?: string; id?: string }).id
															: m.memberId;
														return mId === member._id;
													})
												)) && (
														<span className="text-[10px] text-gray-300 italic font-inter font-normal">Unassigned</span>
													)}
											</div>
										</td>
										<td
											className="px-6 py-4 text-[10px] md:text-[12px] dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
											style={{ color: 'var(--text-primary)' }}
											onClick={() => setStatusModalMember(member)}
										>
											<div className="flex items-center">
												{(member.statusColor || member.status === 'Logged In') && (
													<DotFilledIcon
														className="w-4 h-4 mr-1"
														style={{ color: member.statusColor || '#15803D' }}
													/>
												)}
												{member.status}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

			</div>
			{currentMembers.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}
			<AssignBucketModal
				isOpen={!!selectedMemberForBucket}
				onClose={() => setSelectedMemberForBucket(null)}
				member={selectedMemberForBucket ? {
					_id: selectedMemberForBucket._id,
					fullName: selectedMemberForBucket.fullName,
					agentId: selectedMemberForBucket.agentId
				} : null}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default TeamMembersTable;
