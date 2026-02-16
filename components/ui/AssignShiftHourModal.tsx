'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import Button from './Button';
import Checkbox from './Checkbox';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetTeamMembersByLineOfBusinessIdQuery, useAssignShiftHourMutation } from '@/store/services/teamMembersApi';
import { toastError, toastSuccess } from '@/utils/toastWithSound';

interface AssignShiftHourModalProps {
	isOpen: boolean;
	onClose: () => void;
	shiftHourId: string | null;
	shiftName: string;
}

interface ApiTeamMember {
	_id?: string;
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	role?: string | { roleName?: string; name?: string };
}

const AssignShiftHourModal: React.FC<AssignShiftHourModalProps> = ({
	isOpen,
	onClose,
	shiftHourId,
	shiftName,
}) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId =
		lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';

	const { data: teamMembersResponse, isLoading, refetch } =
		useGetTeamMembersByLineOfBusinessIdQuery(lineOfBusinessId, {
			skip: !lineOfBusinessId || !isOpen,
		});

	const [assignShiftHour, { isLoading: isAssigning }] = useAssignShiftHourMutation();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([]);

	useEffect(() => {
		if (!isOpen) {
			setSelectedIds(new Set());
		}
	}, [isOpen]);

	useEffect(() => {
		if (teamMembersResponse) {
			const raw = teamMembersResponse.data || teamMembersResponse.teamMembers || teamMembersResponse || [];
			const list = Array.isArray(raw) ? raw : raw.docs || [];
			setTeamMembers(list as ApiTeamMember[]);
		}
	}, [teamMembersResponse]);

	const toggleSelect = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleAssign = async () => {
		if (!shiftHourId) {
			toastError('No shift selected');
			return;
		}

		if (selectedIds.size === 0) {
			toastError('Select at least one team member');
			return;
		}

		try {
			const teamMemberIds = Array.from(selectedIds);
			await assignShiftHour({
				shiftHourId,
				teamMemberIds,
			}).unwrap();

			toastSuccess('Shift hour assigned to team members successfully');
			await refetch();
			onClose();
		} catch (error) {
			const err = error as {
				data?: { message?: string; error?: string };
				error?: string;
				message?: string;
			};
			const message =
				err?.data?.error ||
				err?.data?.message ||
				err?.error ||
				err?.message ||
				'Error assigning shift hour';
			toastError(message);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={`Add team members to ${shiftName || 'shift'}`}
			size="lg"
			position="center"
		>
			<div className="p-6 space-y-4">
				<p className="dark:text-gray-400 text-[10px] md:text-[12px]">
					Select team members to assign to this shift hour.
				</p>

				<div className="border dark:border-gray-700 rounded-md max-h-[320px] overflow-y-auto">
					{isLoading ? (
						<div className="p-4 text-sm dark:text-gray-400">Loading team members...</div>
					) : teamMembers.length === 0 ? (
						<div className="p-4 text-sm dark:text-gray-400">No team members found for this line of business.</div>
					) : (
						<table className="min-w-full text-[12px]">
							<thead className="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th className="px-4 py-2 text-left">Select</th>
									<th className="px-4 py-2 text-left">Name</th>
									<th className="px-4 py-2 text-left">Email</th>
									<th className="px-4 py-2 text-left">Role</th>
								</tr>
							</thead>
							<tbody>
								{teamMembers.map((member) => {
									const id = member._id || member.id || '';
									const fullName =
										member.name ||
										`${member.firstName || ''} ${member.lastName || ''}`.trim();
									const role =
										typeof member.role === 'object'
											? member.role?.roleName || member.role?.name || ''
											: member.role || '';

									if (!id) {
										return null;
									}

									return (
										<tr key={id} className="border-t dark:border-gray-700">
											<td className="px-4 py-2">
												<Checkbox
													checked={selectedIds.has(id)}
													onChange={(checked) => toggleSelect(id)}
												/>
											</td>
											<td className="px-4 py-2">{fullName || 'Unnamed user'}</td>
											<td className="px-4 py-2">{member.email || '-'}</td>
											<td className="px-4 py-2">{role || '-'}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<Button
						variant="danger"
						size="md"
						onClick={onClose}
						disabled={isAssigning}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleAssign}
						disabled={isAssigning}
					>
						Assign
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AssignShiftHourModal;

