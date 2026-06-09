'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { useGetTeamMembersByCampaignIdQuery, ApiTeamMember } from '@/store/services/teamMembersApi';
import { SVGLoaderFetch, NoRecordFound } from '@/components/Options';
import { useSetup, AssignedMember, Bucket } from '@/contexts/SetupContext';
import Search from '@/components/ui/Search';
import { Cross2Icon, CheckIcon, InfoCircledIcon, IdCardIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';

interface AssignMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	bucketId: string;
	bucketName: string;
	campaignId: string;
	onAssign: (memberId: string, memberName: string, duration?: number) => Promise<void>;
}

const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
	isOpen,
	onClose,
	bucketId,
	bucketName,
	campaignId,
	onAssign,
}) => {
	const { data: teamMembersResponse, isLoading } = useGetTeamMembersByCampaignIdQuery(
		{ campaignId, page: 1, limit: 100 },
		{ skip: !isOpen || !campaignId }
	);

	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [isAssigning, setIsAssigning] = useState(false);
	const [durationHours, setDurationHours] = useState<number | ''>('');
	const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
	const [conflictBuckets, setConflictBuckets] = useState<string[]>([]);
	const [selectedAssignment, setSelectedAssignment] = useState<{ memberId: string, memberName: string, bucket: Bucket & { assignmentData?: AssignedMember } } | null>(null);

	const members = useMemo(() => {
		return teamMembersResponse?.teamMembers || [];
	}, [teamMembersResponse]);

	const filteredMembers = useMemo(() => {
		return members.filter((m: ApiTeamMember) =>
			(m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			(m.userId || '').toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [members, searchTerm]);

	const handleMemberSelect = (member: ApiTeamMember) => {
		setSelectedMemberIds(prev => {
			const memberId = (member._id || member.id || '') as string;
			const isSelected = prev.includes(memberId);
			if (isSelected) {
				return prev.filter(id => id !== memberId);
			} else {
				return [...prev, memberId];
			}
		});
	};

	// Update conflict buckets whenever selectedMemberIds change
	useMemo(() => {
		const conflicts: string[] = [];
		selectedMemberIds.forEach(id => {
			setupData.dashboardSettings.buckets.forEach(b => {
				if (b.id !== bucketId && Array.isArray(b.assignedMembers)) {
					const isAssigned = b.assignedMembers.some((m: AssignedMember) => {
						const mId = typeof m.memberId === 'object' && m.memberId !== null
							? (m.memberId._id || m.memberId.id)
							: m.memberId;
						return mId === id;
					});
					if (isAssigned && !conflicts.includes(b.name)) conflicts.push(b.name);
				}
			});
		});
		setConflictBuckets(conflicts);
	}, [selectedMemberIds, setupData.dashboardSettings.buckets, bucketId]);

	const handleSelectAll = () => {
		if (selectedMemberIds.length === filteredMembers.length) {
			setSelectedMemberIds([]);
		} else {
			setSelectedMemberIds(filteredMembers.map(m => (m._id || m.id || '') as string));
		}
	};

	const getMemberBuckets = (memberId: string) => {
		return setupData.dashboardSettings.buckets.filter(b =>
			Array.isArray(b?.assignedMembers) && b?.assignedMembers.some((m: AssignedMember) => {
				const mId = typeof m.memberId === 'object' && m.memberId !== null
					? (m.memberId._id || m.memberId.id)
					: m.memberId;
				return mId === memberId;
			})
		);
	};

	const handleAssign = async () => {
		if (selectedMemberIds.length === 0) return;

		const totalMinutes = (Number(durationHours || 0) * 60) + Number(durationMinutes || 0);
		setIsAssigning(true);

		try {
			// Iterate over selected members and call onAssign
			await Promise.all(selectedMemberIds.map(id => {
				const member = members.find((m) => (m._id || m.id) === id);
				return onAssign(id, member?.name || 'Unknown', totalMinutes > 0 ? totalMinutes : undefined);
			}));
			onClose();
		} catch (error) {
			console.error("Assignments failed:", error);
		} finally {
			setIsAssigning(false);
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
				className="dark:bg-gray-800 w-full max-w-lg mx-4 rounded-[var(--radius)] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border dark:border-gray-700"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<IdCardIcon className="w-5 h-5" />
						</div>
						<div>
							<h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
								Assign Members to {bucketName}
							</h2>
							<p className="text-[11px] text-gray-500 mt-0.5">Select a team member and set a session duration.</p>
						</div>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 overflow-y-auto space-y-6">
					{/* Search & List */}
					<div className="space-y-3">
						<Search
							placeholder="Search team members..."
							value={searchTerm}
							onChange={setSearchTerm}
							className="w-full"
						/>

						<div className="flex items-center justify-between px-1">
							<span className="text-[10px] text-gray-400 font-medium">{selectedMemberIds.length} members selected</span>
							<button
								onClick={handleSelectAll}
								className="text-[10px] text-primary font-bold hover:underline"
							>
								{selectedMemberIds.length === filteredMembers.length ? 'DESELECT ALL' : 'SELECT ALL'}
							</button>
						</div>

						<div className="border dark:border-gray-700 rounded-lg overflow-hidden max-h-56 overflow-y-auto bg-gray-50/10" style={{ borderColor: 'var(--light-gray)' }}>
							{isLoading ? (
								<SVGLoaderFetch asTable={false} text="Loading members..." />
							) : filteredMembers.length === 0 ? (
								<div className="p-4 text-center">
									<NoRecordFound asTable={false} />
								</div>
							) : (
								<div className="divide-y dark:divide-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
									{filteredMembers.map((member) => {
										const memberId = (member._id || member.id || '') as string;
										const isSelected = selectedMemberIds.includes(memberId);
										return (
											<div
												key={memberId}
												onClick={() => handleMemberSelect(member)}
												className={`p-3 flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/10' : 'hover:bg-white dark:hover:bg-gray-800'}`}
											>
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
														{(member.name || 'U').charAt(0)}
													</div>
													<div className="flex flex-col gap-1">
														<div className="flex flex-col">
															<span className="text-[12px] font-medium text-gray-900 dark:text-gray-100">{member.name}</span>
															<span className="text-[10px] text-gray-500">{member.userId} • {typeof member.role === 'object' ? member.role?.roleName || member.role?.name : (typeof member.role === 'string' ? member.role : 'Member')}</span>
														</div>
														{/* Bucket Badges */}
														<div className="flex flex-wrap gap-1">
															{getMemberBuckets(memberId).map(b => (
																<button
																	key={b.id}
																	onClick={(e) => {
																		e.stopPropagation();
																		const assignment = b?.assignedMembers?.find((m) => {
																			const mId = typeof m.memberId === 'object' && m.memberId !== null
																				? (m.memberId._id || m.memberId.id)
																				: m.memberId;
																			return mId === memberId;
																		});
																		setSelectedAssignment({
																			memberId: memberId,
																			memberName: member?.name || '',
																			bucket: { ...b, assignmentData: assignment }
																		});
																	}}
																	className="text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold shadow-sm hover:ring-1 hover:ring-white/50 transition-all"
																	style={{ backgroundColor: b.color || 'var(--primary)' }}
																>
																	{b.name}
																</button>
															))}
														</div>
													</div>
												</div>
												<div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
													{isSelected && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3px]" />}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>

					{selectedMemberIds.length > 0 && (
						<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
							{/* Conflict Prompt */}
							{conflictBuckets.length > 0 && (
								<div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[var(--radius)] flex gap-3">
									<InfoCircledIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
									<div className="text-[11px] text-amber-800 dark:text-amber-200 leading-normal">
										<span className="font-bold">Assignment Alerts:</span> Some selected members are already in other buckets: <span className="font-bold underline">{conflictBuckets.join(', ')}</span>. Do you still want to move them?
									</div>
								</div>
							)}

							{/* Duration Inputs */}
							<div className="space-y-2">
								<label className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Session Duration (Optional)</label>
								<div className="flex items-center gap-3">
									<div className="flex-1 space-y-1">
										<input
											type="number"
											placeholder="Hours"
											value={durationHours}
											onChange={(e) => setDurationHours(e.target.value === '' ? '' : parseInt(e.target.value))}
											className="w-full p-2.5 text-[12px] rounded-[var(--radius)] border dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
											style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--light-gray)' }}
										/>
										<span className="text-[9px] text-gray-400">Hours</span>
									</div>
									<div className="flex-1 space-y-1">
										<input
											type="number"
											placeholder="Minutes"
											value={durationMinutes}
											onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
											className="w-full p-2.5 text-[12px] rounded-[var(--radius)] border dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
											style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--light-gray)' }}
										/>
										<span className="text-[9px] text-gray-400">Minutes</span>
									</div>
								</div>
								<p className="text-[10px] text-gray-400 italic mt-1">If left empty, the member stays in the bucket until manually moved.</p>
							</div>
						</div>
					)}
				</div>

				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose} disabled={isAssigning}>Cancel</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleAssign}
						disabled={selectedMemberIds.length === 0 || isAssigning}
						loading={isAssigning}
					>
						Assign {selectedMemberIds.length > 1 ? `${selectedMemberIds.length} Members` : 'Member'}
					</Button>
				</div>
			</div>

			{/* Assignment Details Popup */}
			{selectedAssignment && (
				<div
					className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px]"
					onClick={() => setSelectedAssignment(null)}
				>
					<div
						className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 w-full max-w-[280px] overflow-hidden animate-in zoom-in-95 duration-200"
						style={{ borderColor: 'var(--light-gray)' }}
						onClick={e => e.stopPropagation()}
					>
						<div className="p-4 border-b dark:border-gray-700 flex items-center justify-between" style={{ borderColor: 'var(--light-gray)' }}>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAssignment.bucket.color }} />
								<h3 className="text-[12px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">{selectedAssignment.bucket.name}</h3>
							</div>
							<button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
								<Cross2Icon className="w-4 h-4" />
							</button>
						</div>
						<div className="p-4 space-y-3">
							<div className="flex flex-col">
								<span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Member</span>
								<span className="text-[12px] text-gray-900 dark:text-gray-100 font-medium">{selectedAssignment.memberName}</span>
							</div>
							{selectedAssignment.bucket.assignmentData?.duration ? (
								<div className="flex flex-col">
									<span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Session Duration</span>
									<span className="text-[12px] text-primary font-bold flex items-center gap-1.5">
										<Icon name="Time" size="sm" />
										{selectedAssignment.bucket.assignmentData.duration} Minutes
									</span>
								</div>
							) : (
								<div className="flex flex-col">
									<span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Type</span>
									<span className="text-[11px] text-gray-500 italic">Indefinite Assignment</span>
								</div>
							)}
							<div className="pt-2">
								<Button
									variant="outline"
									size="sm"
									className="w-full text-[10px] h-8"
									onClick={() => setSelectedAssignment(null)}
								>
									Close Details
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AssignMemberModal;
