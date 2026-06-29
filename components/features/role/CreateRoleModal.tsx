'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useCreateRoleMutation, RolePermission } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useApiError } from '@/hooks/useApiError';
import { toast } from 'sonner';
import { useSetup } from '@/contexts/SetupContext';

interface CreateRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface ApiError {
	data?: {
		message?: string;
	};
	message?: string;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [formData, setFormData] = React.useState({
		name: '',
		description: '',
	});
	const [errors, setErrors] = React.useState({
		name: '',
		description: '',
	});
	const [createRole, { isLoading, isError, error }] = useCreateRoleMutation();

	useApiError(isError, error, 'Failed to create role');
	const { user } = useUserInfo();
	const { setupData } = useSetup();

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user types
		if (errors[field as keyof typeof errors]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {
			name: '',
			description: '',
		};
		let isValid = true;

		if (!formData.name.trim()) {
			newErrors.name = 'Role name is required';
			isValid = false;
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleCreate = async () => {
		if (!validateForm()) return;

		if (user?.company?._id) {
			try {
				const modules = setupData.roleManagementSettings?.modules || [];
				const defaultPermissions: RolePermission[] = modules.map((module: { name: string }) => ({
					id: '',
					moduleName: module.name,
					access: false,
					permissions: {
						view: false,
						edit: false,
						delete: false,
						create: false,
					},
				}));

				await createRole({
					roleName: formData.name.toLowerCase(),
					description: formData.description,
					companyId: user.company?._id,
					permissions: defaultPermissions
				}).unwrap();

				toast.success('Role created successfully');
				setFormData({ name: '', description: '' });
				onSuccess?.();
				onClose();
			} catch (error) {
				console.error('Failed to create role:', error);
				// useApiError hook handles the error UI reactively
			}
		}
	};

	const handleCancel = () => {
		setFormData({ name: '', description: '' });
		setErrors({ name: '', description: '' });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Create New Role
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6">
					<Input
						label="Role Name"
						placeholder="Enter Role Name"
						value={formData.name}
						onChange={handleInputChange('name')}
						required
						error={errors.name}
					/>

					<Textarea
						label="Role Description"
						placeholder="Describe the purpose and responsibilities of this role"
						value={formData.description}
						onChange={handleInputChange('description')}
						rows={4}
						resize="vertical"
						required
						error={errors.description}
					/>
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleCreate}
						disabled={!formData.name || !formData.description || isLoading}
					>
						{isLoading ? 'Creating...' : 'Create'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateRoleModal;

