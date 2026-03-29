'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreateTicketMutation } from '@/store/services/supportApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';
import { SupportTicketForm } from './SupportTicketForm';
import { useGetTeamMembersByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { Cross2Icon } from '@radix-ui/react-icons';

interface NewTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface TeamMember {
	_id: string;
	id?: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	fullName?: string;
	role?: string | { _id?: string; id?: string; roleName?: string; name?: string };
}

const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose }) => {
	const { user } = useAuth();
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
	const [assignedToIds, setAssignedToIds] = useState<string[]>([]);

	const [createTicket, { isLoading }] = useCreateTicketMutation();

	const { data: teamMembers } = useGetTeamMembersByLineOfBusinessIdQuery({ lineOfBusinessId: selectedLineOfBusinessId || '', limit: 1000 });

	const resetForm = () => {
		setTitle('');
		setDescription('');
		setPriority('Low');
		setAssignedToIds([]);
	};

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();

		if (!title || !description) {
			toast.error('Please fill in required fields (Subject, Description)');
			return;
		}

		if (!assignedToIds || assignedToIds.length === 0) {
			toast.error('Please assign the ticket to at least one teammate');
			return;
		}

		const creatorId = user?.id || user?._id;
		const companyId = user?.companyId || lineOfBusinessData?.companyId || lineOfBusinessData?.lineOfBusiness?.companyId;

		if (!creatorId) {
			toast.error('User information is missing. Please log in again.');
			return;
		}

		if (!companyId) {
			toast.error('Company information is missing from the context.');
			return;
		}

		if (!selectedLineOfBusinessId) {
			toast.error('Please select an active Line of Business first.');
			return;
		}

		try {
			const rawMembers = (teamMembers as unknown as { teamMembers?: TeamMember[]; data?: TeamMember[] }) || {};
			const membersList = (Array.isArray(teamMembers) ? teamMembers : rawMembers.teamMembers || rawMembers.data || []) as TeamMember[];
			
			const firstAssigneeId = assignedToIds[0];
			const selectedMember = membersList.find((m) => (m._id || m.id) === firstAssigneeId);
			const roleId = typeof selectedMember?.role === 'object' ? selectedMember?.role?._id || selectedMember?.role?.id : selectedMember?.role;

			const creatorName = user?.firstName && user?.lastName
				? `${user.firstName} ${user.lastName}`
				: user?.name || user?.username || 'Unknown User';

			const supervisor = user?.supervisor as { _id?: string; id?: string } | undefined;
			const supervisorId = user?.supervisorId || supervisor?._id || supervisor?.id;

			const ticketData = {
				title,
				description,
				priority,
				creatorId,
				creatorType: user?.isTeamMember ? 'TeamMember' : 'User',
				creatorName,
				companyId,
				lineOfBusinessId: selectedLineOfBusinessId,
				lobid: selectedLineOfBusinessId,
				assignedToIds,
				assignedToType: roleId,
				escalationLevel: roleId,
				supervisorId,
				status: 'Open',
			};

			await createTicket(ticketData).unwrap();
			toast.success('Ticket created successfully');
			resetForm();
			onClose();
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toast.error(err.data?.message || 'Failed to create ticket');
		}
	};

	if (!isOpen) return null;

	const rawMembers = (teamMembers as unknown as { teamMembers?: TeamMember[]; data?: TeamMember[] }) || {};
	const membersList = (Array.isArray(teamMembers) ? teamMembers : rawMembers.teamMembers || rawMembers.data || []) as TeamMember[];

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						New Ticket
					</h2>
					<button
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="p-6 overflow-y-auto flex-1">
					<SupportTicketForm
						title={title}
						setTitle={setTitle}
						description={description}
						setDescription={setDescription}
						priority={priority}
						setPriority={setPriority}
						assignedToIds={assignedToIds}
						setAssignedToIds={setAssignedToIds}
						teamMembers={membersList}
						lineOfBusinessData={lineOfBusinessData || {}}
						onSubmit={handleSubmit}
					/>
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={() => { handleSubmit(); }}
						disabled={isLoading}
						className="text-white"
						style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
					>
						{isLoading ? 'Creating...' : 'Create Ticket'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NewTicketModal;
