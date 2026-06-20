'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useRemoveMemberFromBucketMutation, useAssignMemberToBucketMutation } from '@/store/services/campaignApi';
import { Cross2Icon, PlusIcon, PersonIcon, ArchiveIcon, TrashIcon, ClockIcon } from '@radix-ui/react-icons';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import AssignMemberModal from '@/components/features/dashboard/AssignMemberModal';
import { Bucket, AssignedMember } from '@/contexts/SetupContext';
import { Campaign } from '@/store/services/campaignApi';

interface ManageMembersModalProps {
	isOpen: boolean;
	onClose: () => void;
	campaignData: Campaign | undefined;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
	isOpen,
	onClose,
	campaignData,
}) => {
	const [removeMember] = useRemoveMemberFromBucketMutation();
	const [assignMember] = useAssignMemberToBucketMutation();

	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const [targetBucket, setTargetBucket] = useState<{ id: string; name: string } | null>(null);

	const campaignId = (campaignData?._id || campaignData?.id || '') as string;
	const buckets = useMemo(() => {
		return campaignData?.dashboardSettings?.buckets || [];
	}, [campaignData]);

	const handleRemove = async (bucketId: string, memberId: string, memberName: string) => {
		if (window.confirm(`Remove ${memberName} from this bucket?`)) {
			try {
				await removeMember({ id: campaignId, bucketId, memberId }).unwrap();
				toastSuccess(`Removed ${memberName} from bucket`);
			} catch (error: unknown) {
				const err = error as { data?: { message?: string } };
				toastError(err?.data?.message || 'Failed to remove member');
			}
		}
	};

	const handleOpenAssign = (id: string, name: string) => {
		setTargetBucket({ id, name });
		setIsAssignModalOpen(true);
	};

	const handleAssignMember = async (membersToAssign: { memberId: string; memberName: string }[], duration?: number) => {
		if (!targetBucket || !campaignId) return;

		try {
			await assignMember({
				id: campaignId,
				bucketId: targetBucket.id,
				members: membersToAssign,
				duration
			}).unwrap();

			toastSuccess(`Assigned ${membersToAssign.length} member(s) to ${targetBucket.name}`);
			setIsAssignModalOpen(false);
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toastError(err?.data?.message || "Failed to assign member");
			throw error;
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-[60]"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-4xl mx-4 rounded-[var(--radius)] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border dark:border-gray-700"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<ArchiveIcon className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">
								Manage Member Assignments
							</h2>
							<p className="text-[12px] text-gray-500 mt-0.5">Control bucket allocations for your entire campaign.</p>
						</div>
					</div>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
						<Cross2Icon className="w-6 h-6" />
					</button>
				</div>

				{/* Body */}
				<div className="p-6 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/10 custom-scrollbar">
					{buckets.length === 0 ? (
						<div className="py-20 text-center">
							<div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
								<ArchiveIcon className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 italic">No buckets defined for this campaign.</h3>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{buckets.map((bucket: Bucket) => (
								<div
									key={bucket.id}
									className="flex flex-col rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden"
									style={{ borderColor: 'var(--light-gray)' }}
								>
									{/* Bucket Header */}
									<div className="p-4 flex items-center justify-between border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10" style={{ borderColor: 'var(--light-gray)' }}>
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bucket.color || 'var(--primary)' }} />
											<h4 className="text-[13px] font-semibold truncate text-gray-900 dark:text-gray-100 uppercase tracking-tight">{bucket.name}</h4>
										</div>
										<button
											onClick={() => handleOpenAssign(bucket.id, bucket.name)}
											className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-[10px] font-bold"
										>
											<PlusIcon className="w-3 h-3" />
											ADD MEMBER
										</button>
									</div>

									{/* Member List */}
									<div className="flex-1 p-3 min-h-[120px] max-h-[300px] overflow-y-auto">
										{(!bucket.assignedMembers || bucket.assignedMembers.length === 0) ? (
											<div className="h-full flex flex-col items-center justify-center text-gray-400 py-6 opacity-60">
												<PersonIcon className="w-6 h-6 mb-2 opacity-20" />
												<p className="text-[10px] italic">No members assigned</p>
											</div>
										) : (
											<div className="space-y-2">
												{bucket.assignedMembers.map((member: AssignedMember) => {
													const mId = typeof member.memberId === 'object' && member.memberId !== null
														? (member.memberId._id || member.memberId.id || '')
														: member.memberId;
													return (
														<div
															key={mId}
															className="group flex items-center justify-between p-2.5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all"
														>
															<div className="flex items-center gap-3">
																<div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
																	{(member.memberName || 'U').charAt(0)}
																</div>
																<div className="flex flex-col">
																	<span className="text-[12px] font-medium text-gray-900 dark:text-gray-100">{member.memberName || 'Unknown'}</span>
																	{member.duration && (
																		<div className="flex items-center gap-1 text-[9px] text-primary font-medium opacity-80">
																			<ClockIcon className="w-2.5 h-2.5" />
																			{member.duration}m remaining
																		</div>
																	)}
																</div>
															</div>
															<button
																onClick={() => handleRemove(bucket?.id, mId, member?.memberName || 'Unknown')}
																className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
																title="Remove from Bucket"
															>
																<TrashIcon className="w-4 h-4" />
															</button>
														</div>
													);
												})}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					className="flex justify-end p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="primary" size="md" onClick={onClose} className="px-8 h-10 text-[13px]">
						Close Manager
					</Button>
				</div>
			</div>

			{targetBucket && (
				<AssignMemberModal
					isOpen={isAssignModalOpen}
					onClose={() => setIsAssignModalOpen(false)}
					bucketId={targetBucket.id}
					bucketName={targetBucket.name}
					campaignId={campaignId || ''}
					onAssign={handleAssignMember}
				/>
			)}
		</div>
	);
};

export default ManageMembersModal;
