import { Plus, X } from 'lucide-react';
import { useGetTeamMembersByLineOfBusinessIdQuery } from '../../../store/services/teamMembersApi';
import { useUpdateTicketMutation, SupportTicket, PopulatedMember, PopulatedRole } from '../../../store/services/supportApi';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import React, { useState } from 'react';
import { Dropdown } from '../../ui/Dropdown';
import Image from 'next/image';

interface TicketSidebarProps {
	ticket: SupportTicket;
	lineOfBusinessData: {
		primaryColor?: string;
		_id?: string;
	};
}

export const TicketSidebar: React.FC<TicketSidebarProps> = ({ ticket, lineOfBusinessData }) => {
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

	const { data: teamMembersData } = useGetTeamMembersByLineOfBusinessIdQuery({
		lineOfBusinessId: ticket?.lineOfBusinessId,
		limit: 100,
	});

	const [updateTicket] = useUpdateTicketMutation();

	const getRoleLabel = (role: string | PopulatedRole | undefined): string => {
		if (!role) return 'Agent';
		if (typeof role === 'string') return role;
		if (typeof role === 'object') return role.roleName || role.name || 'Agent';
		return 'Agent';
	};

	const getNameLabel = (p: PopulatedMember | string | undefined): string => {
		if (!p) return 'Unknown';
		if (typeof p === 'string') return p;
		if (p.firstName) return `${p.firstName} ${p.lastName || ''}`.trim();
		if (typeof p.name === 'string') return p.name;
		return 'Unknown';
	};

	const handleAddMembers = async () => {
		if (selectedMemberIds.length === 0) return;

		const currentAssignees = ticket?.assignedToIds || [];
		const currentIds = currentAssignees.map((a) => typeof a === 'string' ? a : a._id);

		// Merge new IDs, avoiding duplicates
		const newAssigneeIds = Array.from(new Set([...currentIds, ...selectedMemberIds]));

		await updateTicket({
			id: ticket._id,
			data: { assignedToIds: newAssigneeIds }
		});

		setSelectedMemberIds([]);
		setIsAddUserModalOpen(false);
	};

	const handleRemoveMember = async (memberId: string) => {
		const currentAssignees = ticket?.assignedToIds || [];
		const newAssigneeIds = currentAssignees
			.map((a) => typeof a === 'string' ? a : a._id)
			.filter((id: string) => id !== memberId);

		await updateTicket({
			id: ticket._id,
			data: { assignedToIds: newAssigneeIds }
		});
	};

	const availableMembers = (teamMembersData?.teamMembers || [])
		.filter((member: any) => !ticket?.assignedToIds?.some((a) => (typeof a === 'string' ? a : a._id) === member._id));

	return (
		<>
			{/* Overview Card */}
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-5" style={{ backgroundColor: 'var(--accent-white)' }}>
				<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Overview</h3>
				<div className="space-y-4">
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Status</span>
						<span
							className="px-3 py-1 text-[10px] uppercase font-extrabold text-white shadow-sm"
							style={{
								backgroundColor:
									ticket?.status === 'New' ? '#3B82F6' : // Blue
										ticket?.status === 'In Progress' ? '#F59E0B' : // Amber-500
											ticket?.status === 'Resolved' ? '#10B981' : // Green
												ticket?.status === 'Closed' ? '#EF4444' : // Red
													ticket?.status === 'Reopened' ? '#8B5CF6' : '#6B7280' // Purple/Gray
							}}
						>
							{ticket?.status}
						</span>
					</div>
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Priority</span>
						<span className={`text-xs font-bold px-2 py-0.5 ${ticket?.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
							{ticket?.priority || 'Normal'}
						</span>
					</div>
					<div className="flex justify-between items-center border-b dark:border-gray-700 pb-3">
						<span className="text-xs text-gray-500 font-medium">Escalation</span>
						<span className="text-xs font-bold uppercase" style={{ color: lineOfBusinessData?.primaryColor || 'var(--primary)' }}>
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
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-4" style={{ backgroundColor: 'var(--accent-white)' }}>
				<div className="flex justify-between items-center">
					<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Assignees</h3>
					<button
						onClick={() => setIsAddUserModalOpen(true)}
						className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
					>
						<Plus className="w-4 h-4 text-gray-500" />
					</button>
				</div>
				<div className="space-y-3">
					{(!ticket?.assignedToIds || ticket?.assignedToIds.length === 0) ? (
						<p className="text-[11px] text-gray-400 italic">No members assigned.</p>
					) : (
						ticket.assignedToIds.map((assignee) => {
							if (typeof assignee === 'string') return null;
							return (
								<div key={assignee._id} className="flex items-center justify-between group">
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-sm relative">
											{assignee.avatar ? (
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
													style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
												>
													{(assignee.firstName?.[0] || (typeof assignee.name === 'string' ? assignee.name?.[0] : '') || '?')}
												</div>
											)}
										</div>
										<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
											{getNameLabel(assignee)}
										</span>
									</div>
									<button
										onClick={() => handleRemoveMember(assignee._id)}
										className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
									>
										<X className="w-3 h-3 text-red-500" />
									</button>
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Requester Info */}
			<div className="border dark:border-gray-700 p-6 shadow-sm space-y-4 " style={{ backgroundColor: 'var(--accent-white)' }}>
				<h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Requester</h3>
				<div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 border dark:border-gray-700">
					<div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden shadow-sm relative">
						{typeof ticket?.creatorId === 'object' && ticket.creatorId.avatar ? (
							<Image
								src={ticket.creatorId.avatar}
								alt={getNameLabel(ticket.creatorId)}
								width={40}
								height={40}
								className="w-full h-full object-cover"
							/>
						) : (
							<div
								className="w-full h-full flex items-center justify-center text-[12px] font-bold text-white transition-colors"
								style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
							>
								{(typeof ticket?.creatorId === 'object' ? (ticket?.creatorId?.firstName?.[0] || ticket?.creatorId?.name?.[0] || '?') : '?').toUpperCase()}
							</div>
						)}
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
							{getNameLabel(ticket?.creatorId)}
						</span>
						<span className="text-[11px] text-gray-500 font-medium">Customer User</span>
					</div>
				</div>
			</div>

			{/* Add Member Modal */}
			<Modal
				isOpen={isAddUserModalOpen}
				onClose={() => setIsAddUserModalOpen(false)}
				title="Invite Member to Ticket"
				size="sm"
			>
				<div className="p-6 space-y-6">
					<Dropdown
						label="Select Members"
						placeholder="Search and select teammates..."
						multiple={true}
						options={availableMembers.map((member: any) => ({
							value: member._id,
							label: `${member.firstName} ${member.lastName || ''} (${getRoleLabel(member.role)})`
						}))}
						value={selectedMemberIds}
						onChange={(val) => setSelectedMemberIds(val as string[])}
					/>

					<div className="flex gap-3">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => {
								setSelectedMemberIds([]);
								setIsAddUserModalOpen(false);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							className="flex-1 text-white"
							style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
							onClick={handleAddMembers}
							disabled={selectedMemberIds.length === 0}
						>
							Confirm
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
};
