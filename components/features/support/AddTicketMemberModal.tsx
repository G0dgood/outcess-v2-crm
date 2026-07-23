import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Dropdown } from '../../ui/Dropdown';
import { Button } from '../../ui/Button';
import { useGetTeamMembersByCampaignIdQuery, ApiTeamMember } from '../../../store/services/teamMembersApi';
import { useUpdateTicketMutation, SupportTicket, PopulatedMember } from '../../../store/services/supportApi';
import { Campaign } from '../../../store/services/campaignApi';
import { toast } from 'sonner';

interface AddTicketMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	ticket: SupportTicket;
	campaignData?: Campaign;
}

export const AddTicketMemberModal: React.FC<AddTicketMemberModalProps> = ({
	isOpen,
	onClose,
	ticket,
	campaignData
}) => {
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();

	const effectiveCampaignId = String(
		(typeof ticket?.campaignId === 'object'
			? (ticket?.campaignId as { _id?: string; id?: string })?._id || (ticket?.campaignId as { _id?: string; id?: string })?.id
			: ticket?.campaignId) || campaignData?._id || campaignData?.id || ''
	);

	const { data: teamMembersData } = useGetTeamMembersByCampaignIdQuery(
		{
			campaignId: effectiveCampaignId,
			limit: 100,
		},
		{ skip: !isOpen || !effectiveCampaignId }
	);

	const getRoleLabel = (role: string | { roleName?: string; name?: string } | undefined): string => {
		if (!role) return 'Agent';
		if (typeof role === 'string') return role;
		if (typeof role === 'object') return role.roleName || role.name || 'Agent';
		return 'Agent';
	};

	const getMemberName = (member: PopulatedMember | ApiTeamMember): string => {
		if (!member) return 'Unknown';
		if (member.firstName || member.lastName) {
			return `${member.firstName || ''} ${member.lastName || ''}`.trim();
		}
		return member.name || 'Teammate';
	};

	const handleAddMembers = async () => {
		if (selectedMemberIds.length === 0 || !ticket?._id) return;

		try {
			const currentAssignees = ticket?.assignedToIds || [];
			const currentIds = currentAssignees
				.map((a) => (typeof a === 'string' ? a : String(a._id || a.id || '')))
				.filter(Boolean);

			// Merge new IDs, avoiding duplicates
			const newAssigneeIds = Array.from(new Set([...currentIds, ...selectedMemberIds]));

			await updateTicket({
				id: ticket._id,
				data: { assignedToIds: newAssigneeIds }
			}).unwrap();

			toast.success('Member(s) invited to ticket successfully');
			setSelectedMemberIds([]);
			onClose();
		} catch (error: unknown) {
			console.error('Failed to add ticket member:', error);
			const err = error as { data?: { message?: string } };
			toast.error(err?.data?.message || 'Failed to add member to ticket');
		}
	};

	const rawMembers = (teamMembersData as { teamMembers?: ApiTeamMember[]; data?: ApiTeamMember[] })?.teamMembers || (teamMembersData as { data?: ApiTeamMember[] })?.data || (Array.isArray(teamMembersData) ? teamMembersData : []);
	const membersList = Array.isArray(rawMembers) ? rawMembers : [];

	const availableMembers = membersList.filter((member: ApiTeamMember) => {
		const memberId = String(member._id || member.id || '');
		if (!memberId) return false;
		return !ticket?.assignedToIds?.some((a) => {
			const existingId = typeof a === 'string' ? a : String(a._id || a.id || '');
			return existingId === memberId;
		});
	});

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				setSelectedMemberIds([]);
				onClose();
			}}
			title="Invite Member to Ticket"
			size="sm"
		>
			<div className="p-6 space-y-6">
				<Dropdown
					label="Select Members"
					placeholder="Search and select teammates..."
					multiple={true}
					options={availableMembers.map((member: ApiTeamMember) => ({
						value: String(member._id || member.id || ''),
						label: `${getMemberName(member)} (${getRoleLabel(member.role)})`
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
							onClose();
						}}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						className="flex-1 text-white"
						style={{ backgroundColor: campaignData?.primaryColor || 'var(--primary)' }}
						onClick={handleAddMembers}
						disabled={selectedMemberIds.length === 0 || isUpdating}
					>
						{isUpdating ? 'Inviting...' : 'Confirm'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
