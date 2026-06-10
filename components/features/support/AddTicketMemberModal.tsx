import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Dropdown } from '../../ui/Dropdown';
import { Button } from '../../ui/Button';
import { useGetTeamMembersByCampaignIdQuery, ApiTeamMember } from '../../../store/services/teamMembersApi';
import { useUpdateTicketMutation, SupportTicket, PopulatedMember } from '../../../store/services/supportApi';

interface AddTicketMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	ticket: SupportTicket;
	campaignData?: {
		primaryColor?: string;
		_id?: string;
	};
}

export const AddTicketMemberModal: React.FC<AddTicketMemberModalProps> = ({
	isOpen,
	onClose,
	ticket,
	campaignData
}) => {
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [updateTicket] = useUpdateTicketMutation();

	const { data: teamMembersData } = useGetTeamMembersByCampaignIdQuery({
		campaignId: ticket?.campaignId,
		limit: 100,
	}, { skip: !isOpen });

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
		onClose();
	};

	const availableMembers = (teamMembersData?.teamMembers || [])
		.filter((member: ApiTeamMember) => {
			const memberId = member._id || member.id;
			return !!(memberId && !ticket?.assignedToIds?.some((a) => (typeof a === 'string' ? a : a._id) === memberId));
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
						value: member._id || member.id || '',
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
						disabled={selectedMemberIds.length === 0}
					>
						Confirm
					</Button>
				</div>
			</div>
		</Modal>
	);
};
