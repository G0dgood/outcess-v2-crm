'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useCreateSupervisorRoleMutation, useUpdateRoleMutation } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';
import { extractErrorMessage, ApiError } from '@/utils/apiError';

interface SupervisorRole {
  _id?: string;
  id?: string;
  roleName?: string;
  description?: string;
  supervisorTitle?: string;
}

interface CreateSupervisorRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	campaignId?: string;
	onSuccess?: () => void;
	editingRole?: SupervisorRole | null;
}

const CreateSupervisorRoleModal: React.FC<CreateSupervisorRoleModalProps> = ({
	isOpen,
	onClose,
	campaignId,
	onSuccess,
	editingRole = null,
}) => {
	const { user } = useUserInfo();
	const [createSupervisorRole, { isLoading: isCreating }] = useCreateSupervisorRoleMutation();
	const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
	const isLoading = isCreating || isUpdating;

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [titleError, setTitleError] = useState('');

	useEffect(() => {
		if (isOpen) {
			if (editingRole) {
				setTitle(editingRole.supervisorTitle || '');
				setDescription(editingRole.description || '');
			} else {
				setTitle('');
				setDescription('');
			}
			setTitleError('');
		}
	}, [isOpen, editingRole]);

	const handleClose = () => {
		setTitle('');
		setDescription('');
		setTitleError('');
		onClose();
	};

	const handleSubmit = async () => {
		const trimmedTitle = title.trim();

		const companyId =
			(user?.company as { _id?: string; id?: string } | undefined)?._id ||
			(user?.company as { _id?: string; id?: string } | undefined)?.id ||
			user?.companyId;

		if (!trimmedTitle || !companyId) {
			setTitleError(!trimmedTitle ? 'Title is required' : '');
			toast.error('Title and Company ID are required');
			return;
		}

		if (!campaignId || campaignId === 'new') {
			toast.error('Please select a campaign first');
			return;
		}

		try {
			if (editingRole) {
				const roleId = editingRole._id || editingRole.id;
				if (!roleId) throw new Error('Role ID is missing');
				await updateRole({
					id: roleId,
					roleData: {
						supervisorTitle: trimmedTitle,
						description: description.trim(),
					}
				}).unwrap();
				toast.success('Supervisor role updated successfully');
			} else {
				await createSupervisorRole({
					roleName: 'Supervisor',
					supervisorTitle: trimmedTitle,
					description: description.trim(),
					isSupervisor: true,
					companyId,
					campaignId: campaignId || undefined,
				}).unwrap();
				toast.success('Supervisor role created successfully');
			}
			handleClose();
			onSuccess?.();
		} catch (error) {
			const action = editingRole ? 'update' : 'create';
			console.error(`Failed to ${action} supervisor role:`, error);
			const message = extractErrorMessage(error as ApiError, `Failed to ${action} supervisor role`);
			toast.error(message);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={editingRole ? "Edit Supervisor Role" : "Create Supervisor Role"}
			size="md"
			position="center"
		>
			<div className="p-6 space-y-4">
				<Input
					label="Supervisor Title"
					placeholder="Team Supervisor"
					value={title}
					onChange={setTitle}
					error={titleError}
					required
				/>
				<Textarea
					label="Description"
					placeholder="Manages frontline agents"
					value={description}
					onChange={setDescription}
					rows={3}
				/>
				<div className="mt-4 flex justify-end gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleClose}
						className="text-[10px] md:text-[12px]"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleSubmit}
						disabled={isLoading}
						className="text-[10px] md:text-[12px]"
					>
						{isLoading ? (editingRole ? 'Saving...' : 'Creating...') : (editingRole ? 'Save Changes' : 'Create')}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default CreateSupervisorRoleModal;
