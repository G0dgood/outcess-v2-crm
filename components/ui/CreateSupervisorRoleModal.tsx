'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { useCreateSupervisorRoleMutation } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';
import { extractErrorMessage, ApiError } from '@/utils/apiError';

interface CreateSupervisorRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	lineOfBusinessId?: string;
	onSuccess?: () => void;
}

const CreateSupervisorRoleModal: React.FC<CreateSupervisorRoleModalProps> = ({
	isOpen,
	onClose,
	lineOfBusinessId,
	onSuccess,
}) => {
	const { user } = useUserInfo();
	const [createSupervisorRole, { isLoading }] = useCreateSupervisorRoleMutation();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [titleError, setTitleError] = useState('');

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

		try {
			await createSupervisorRole({
				roleName: 'Supervisor',
				supervisorTitle: trimmedTitle,
				description: description.trim(),
				isSupervisor: true,
				companyId,
				lineOfBusinessId: lineOfBusinessId || undefined,
			}).unwrap();

			toast.success('Supervisor role created successfully');
			setTitle('');
			setDescription('');
			setTitleError('');
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error('Failed to create supervisor role:', error);
			const message = extractErrorMessage(error as ApiError, 'Failed to create supervisor role');
			toast.error(message);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title="Create Supervisor Role"
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
						{isLoading ? 'Creating...' : 'Create'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default CreateSupervisorRoleModal;
