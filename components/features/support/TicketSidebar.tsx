import { Plus, X } from 'lucide-react';
import { useUpdateTicketMutation, SupportTicket, PopulatedMember, PopulatedRole } from '../../../store/services/supportApi';
import React, { useState } from 'react';
import Image from 'next/image';
import { AddTicketMemberModal } from './AddTicketMemberModal';
import { RemoveTicketMemberModal } from './RemoveTicketMemberModal';

interface TicketSidebarProps {
	ticket: SupportTicket;
	campaignData: {
		primaryColor?: string;
		_id?: string;
	};
}

export const TicketSidebar: React.FC<TicketSidebarProps> = ({ ticket, campaignData }) => {
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);

	const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();


	const getRoleLabel = (role: PopulatedRole | string | undefined): string => {
		if (!role) return 'Agent';
		if (typeof role === 'string') return role;
		if (typeof role === 'object') return role.roleName || role.name || 'Agent';
		return 'Agent';
	};


	const getNameLabel = (p: PopulatedMember | string | null | undefined): string => {
		if (!p || p === null) return ticket?.creatorName || 'Unknown';
		if (typeof p === 'string') return ticket?.creatorName || p;

		const member = p as PopulatedMember;
		// If it's a TeamMember, it has 'name'
		if (member.name) return member.name;

		// If it's a User, it has 'firstName' and 'lastName'
		if (member.firstName || member.lastName) {
			const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
			return fullName || ticket?.creatorName || 'User';
		}

		const fallbackName = (member as { fullName?: string }).fullName;
		if (fallbackName) return fallbackName;
		return ticket?.creatorName || 'Unknown';
	};



	const handleRemoveMember = (member: PopulatedMember) => {
		setMemberToRemove({
			id: member._id,
			name: getNameLabel(member)
		});
		setIsRemoveModalOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!memberToRemove) return;

		const currentAssignees = ticket?.assignedToIds || [];
		const newAssigneeIds = currentAssignees
			.map((a) => typeof a === 'string' ? a : a._id)
			.filter((id: string) => id !== memberToRemove.id);

		await updateTicket({
			id: ticket._id,
			data: { assignedToIds: newAssigneeIds }
		});

		setIsRemoveModalOpen(false);
		setMemberToRemove(null);
	};



	return (
		<div className="flex flex-col gap-6">
			{/* Overview Card */}
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-5 rounded-[var(--radius)]" style={{ backgroundColor: 'var(--accent-white)' }}>
				<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Overview</h3>
				<div className="space-y-4">
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Status</span>
						<span
							className="px-3 py-1 text-[10px] uppercase font-extrabold text-white shadow-sm rounded-[var(--radius)]"
							style={{
								backgroundColor:
									ticket?.status === 'Open' ? '#9CA3AF' : // Gray
										ticket?.status === 'Pending' ? '#F59E0B' : // Amber
											ticket?.status === 'In Progress' ? '#10B981' : // Emerald
												ticket?.status === 'Completed' ? '#3B82F6' : // Blue
													ticket?.status === 'In Review' ? '#EA580C' : // Orange
														ticket?.status === 'Accepted' ? '#DC2626' : // Red
															ticket?.status === 'Rejected' ? '#7C3AED' : // Purple
																ticket?.status === 'Closed' ? '#059669' : '#6B7280'
							}}
						>
							{ticket?.status}
						</span>
					</div>
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Priority</span>
						<span className={`text-xs font-bold px-2 py-0.5 rounded-[var(--radius)] ${ticket?.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
							{ticket?.priority || 'Normal'}
						</span>
					</div>
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Escalation</span>
						<span className="text-xs font-bold uppercase rounded-[var(--radius)]" style={{ color: campaignData?.primaryColor || 'var(--primary)' }}>
							{getRoleLabel(ticket?.escalationLevel as PopulatedRole)}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-xs text-gray-500 font-medium">Created Date</span>
						<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
							{ticket?.createdAt && new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
						</span>
					</div>
				</div>
			</div>

			{/* Assignees Card */}
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-4 rounded-[var(--radius)]" style={{ backgroundColor: 'var(--accent-white)' }}>
				<div className="flex justify-between items-center">
					<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Assignees</h3>
					{ticket?.status !== 'Closed' && (
						<button
							onClick={() => setIsAddUserModalOpen(true)}
							className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
						>
							<Plus className="w-4 h-4 text-gray-500" />
						</button>
					)}
				</div>
				<div className="space-y-3">
					{(!ticket?.assignedToIds || ticket?.assignedToIds?.length === 0) ? (
						<p className="text-[11px] text-gray-400 italic">No members assigned.</p>
					) : (
						ticket?.assignedToIds?.map((assignee) => {
							if (typeof assignee === 'string') return null;
							return (
								<div key={assignee?._id} className="flex items-center justify-between group">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-sm relative">
											{typeof assignee === 'object' && assignee?.avatar ? (
												<Image
													src={assignee.avatar}
													alt={getNameLabel(assignee)}
													width={32}
													height={32}
													className="w-full h-full object-cover"
												/>
											) : (
												<div
													className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase"
													style={{ backgroundColor: campaignData?.primaryColor || 'var(--primary)' }}
												>
													{(assignee?.firstName?.[0] || (typeof assignee?.name === 'string' ? assignee?.name?.[0] : '') || '?')}
												</div>
											)}
										</div>
										<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
											{getNameLabel(assignee)}
										</span>
									</div>
									{ticket?.status !== 'Closed' && (
										<button
											onClick={() => handleRemoveMember(assignee)}
											className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
										>
											<X className="w-3 h-3 text-red-500" />
										</button>
									)}
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Requester Info */}
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-4 rounded-[var(--radius)]" style={{ backgroundColor: 'var(--accent-white)' }}>
				<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Requester</h3>
				<div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 border dark:border-gray-700 rounded-[var(--radius)]">
					<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden shadow-sm relative">
						{ticket?.creatorId && typeof ticket.creatorId === 'object' && ticket?.creatorId?.avatar ? (
							<Image
								src={ticket?.creatorId?.avatar}
								alt={getNameLabel(ticket?.creatorId)}
								width={40}
								height={40}
								className="w-full h-full object-cover"
							/>
						) : (
							<div
								className="w-full h-full flex items-center justify-center text-[12px] font-bold text-white transition-colors"
								style={{ backgroundColor: campaignData?.primaryColor || 'var(--primary)' }}
							>
								{(ticket?.creatorId && typeof ticket.creatorId === 'object' ? (ticket?.creatorId?.firstName?.[0] || ticket?.creatorId?.name?.[0] || '?') : '?').toUpperCase()}
							</div>
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
							{getNameLabel(ticket?.creatorId)}
						</span>
						<span className="text-[11px] text-gray-500 font-medium">
							{ticket?.creatorType === 'TeamMember' ? 'Agent' : 'Customer User'}
						</span>
					</div>
				</div>
			</div>

			<AddTicketMemberModal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
				ticket={ticket}
				campaignData={campaignData}
			/>

			<RemoveTicketMemberModal
				isOpen={isRemoveModalOpen}
				onClose={() => setIsRemoveModalOpen(false)}
				onConfirm={handleConfirmRemove}
				memberName={memberToRemove?.name || ''}
				isLoading={isUpdating}
			/>
		</div>
	);
};
