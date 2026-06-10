'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useAssignMemberToBucketMutation } from '@/store/services/campaignApi';
import Search from '@/components/ui/Search';
import { Cross2Icon, CheckIcon, PlusIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { AssignedMember } from '@/contexts/SetupContext';
import { Campaign } from '@/store/services/campaignApi';

interface AssignBucketModalProps {
	isOpen: boolean;
	onClose: () => void;
	member: {
		_id: string;
		fullName: string;
		agentId: string;
	} | null;
	campaignData: Campaign | undefined;
}

const AssignBucketModal: React.FC<AssignBucketModalProps> = ({
	isOpen,
	onClose,
	member,
	campaignData,
}) => {
	const [assignMemberToBucket, { isLoading: isAssigning }] = useAssignMemberToBucketMutation();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
	const [durationHours, setDurationHours] = useState<number | ''>('');
	const [durationMinutes, setDurationMinutes] = useState<number | ''>('');

	const campaignId = (campaignData?._id || campaignData?.id || '') as string;
	const buckets = useMemo(() => {
		return campaignData?.dashboardSettings?.buckets || [];
	}, [campaignData]);

	const filteredBuckets = useMemo(() => {
		return buckets.filter((b) =>
			(b.name || '').toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [buckets, searchTerm]);

	const handleAssign = async () => {
		if (!selectedBucketId || !member || !campaignId) return;

		const selectedBucket = buckets.find((b) => b.id === selectedBucketId);
		if (!selectedBucket) return;

		const totalMinutes = (Number(durationHours || 0) * 60) + Number(durationMinutes || 0);

		try {
			await assignMemberToBucket({
				id: campaignId,
				bucketId: selectedBucketId,
				memberId: member._id,
				memberName: member.fullName,
				duration: totalMinutes > 0 ? totalMinutes : undefined,
			}).unwrap();

			toastSuccess(`Assigned ${member.fullName} to ${selectedBucket.name}`);
			onClose();
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toastError(err?.data?.message || 'Failed to assign bucket');
			console.error("Bucket assignment failed:", err);
		}
	};

	const isMemberInBucket = (bucketId: string) => {
		const bucket = buckets.find((b) => b.id === bucketId);
		return Array.isArray(bucket?.assignedMembers) && (bucket.assignedMembers as AssignedMember[]).some((m) => {
			const mId = typeof m.memberId === 'object' && m.memberId !== null
				? (m.memberId as { _id?: string; id?: string })._id || (m.memberId as { _id?: string; id?: string }).id
				: m.memberId;
			return mId === member?._id;
		});
	};

	if (!isOpen || !member) return null;

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-[70]"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)] overflow-hidden flex flex-col shadow-2xl border dark:border-gray-700"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-5 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div>
						<h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
							<PlusIcon className="w-4 h-4 text-primary" />
							Assign to Bucket
						</h2>
						<p className="text-[11px] text-gray-500 mt-0.5">
							Assigning <span className="font-medium text-gray-700 dark:text-gray-300">{member.fullName}</span> ({member.agentId})
						</p>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				<div className="p-5 overflow-y-auto space-y-5 max-h-[60vh]">
					{/* Search & List */}
					<div className="space-y-3">
						<Search
							placeholder="Search buckets..."
							value={searchTerm}
							onChange={setSearchTerm}
							className="w-full h-9"
						/>

						<div className="border dark:border-gray-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/10" style={{ borderColor: 'var(--light-gray)' }}>
							{filteredBuckets.length === 0 ? (
								<div className="p-10 text-center text-gray-400">
									<p className="text-[11px]">No buckets found</p>
								</div>
							) : (
								<div className="divide-y dark:divide-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
									{filteredBuckets.map((bucket) => {
										const alreadyAssigned = isMemberInBucket(bucket.id);
										return (
											<div
												key={bucket.id}
												onClick={() => !alreadyAssigned && setSelectedBucketId(bucket.id)}
												className={`p-3 flex items-center justify-between transition-colors ${alreadyAssigned ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-white dark:hover:bg-gray-800'} ${selectedBucketId === bucket.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
											>
												<div className="flex items-center gap-3">
													<div
														className="w-3 h-3 rounded-full"
														style={{ backgroundColor: bucket.color || 'var(--primary)' }}
													/>
													<div className="flex flex-col">
														<span className="text-[12px] font-medium text-gray-900 dark:text-gray-100">{bucket.name}</span>
														{alreadyAssigned && (
															<span className="text-[9px] text-primary font-medium flex items-center gap-1">
																<CheckIcon className="w-3 h-3" /> Currently Assigned
															</span>
														)}
													</div>
												</div>
												{selectedBucketId === bucket.id && (
													<CheckIcon className="w-5 h-5 text-primary" />
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{selectedBucketId && (
						<div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
							{/* Duration Inputs */}
							<div className="space-y-2.5">
								<div className="flex items-center justify-between">
									<label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Session Duration</label>
									<span className="text-[10px] text-gray-400 italic">Optional</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="flex-1">
										<div className="relative">
											<input
												type="number"
												placeholder="0"
												value={durationHours}
												onChange={(e) => setDurationHours(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
												className="w-full p-2.5 pl-3 text-[12px] rounded-[var(--radius)] border dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary h-10"
												style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--light-gray)' }}
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium pointer-events-none">HRS</span>
										</div>
									</div>
									<div className="flex-1">
										<div className="relative">
											<input
												type="number"
												placeholder="0"
												value={durationMinutes}
												onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value)))}
												className="w-full p-2.5 pl-3 text-[12px] rounded-[var(--radius)] border dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary h-10"
												style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--light-gray)' }}
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium pointer-events-none">MIN</span>
										</div>
									</div>
								</div>
								<div className="p-2.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg flex gap-2">
									<InfoCircledIcon className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
									<p className="text-[10px] text-blue-700 dark:text-blue-300 leading-normal">
										After the duration expires, the member will be automatically unassigned. Leave blank for indefinite assignment.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div
					className="flex justify-end gap-3 p-5 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose} disabled={isAssigning} className="h-9 text-[12px] px-5">Cancel</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleAssign}
						disabled={!selectedBucketId || isAssigning}
						loading={isAssigning}
						className="h-9 text-[12px] px-5"
					>
						Complete Assignment
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AssignBucketModal;
