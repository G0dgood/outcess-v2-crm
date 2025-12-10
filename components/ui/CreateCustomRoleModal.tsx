'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useCreateRoleMutation } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';

interface CreateCustomRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export const CreateCustomRoleModal: React.FC<CreateCustomRoleModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [roleName, setRoleName] = useState('');
	const [roleDescription, setRoleDescription] = useState('');
	const [createRole, { isLoading }] = useCreateRoleMutation();
	const { user } = useUserInfo();
	const { selectedLineOfBusinessId } = useLineOfBusiness();

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
			// Reset form when modal closes
			setRoleName('');
			setRoleDescription('');
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

	const handleCreate = async () => {
		if (roleName.trim()) {
			const companyId = user?.company?._id || user?.companyId;

			if (!companyId) {
				toast.error('Company ID is missing');
				return;
			}

			try {
				await createRole({
					roleName: roleName,
					description: roleDescription,
					companyId: companyId,
					lineOfBusinessId: selectedLineOfBusinessId || undefined,
					permissions: {
						dashboard: false,
						customerBook: false,
						userManagement: false,
						setupBook: false,
						customerSMS: false,
						report: false,
						systemSetting: false,
						auditLog: false,
					}
				}).unwrap();

				toast.success('Custom role created successfully');
				onSuccess?.();
				onClose();
			} catch (error: any) {
				console.error('Failed to create custom role:', error);
				toast.error(error?.data?.message || 'Failed to create custom role');
			}
		}
	};

	const handleCancel = () => {
		setRoleName('');
		setRoleDescription('');
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-xl font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Create Custom Role
					</h2>
					<button
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
							e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
							e.currentTarget.style.backgroundColor = 'transparent';
						}}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<Input
						label="Role Name"
						placeholder="Enter Role Name"
						value={roleName}
						onChange={setRoleName}
						required
					/>
					<Textarea
						label="Role Description"
						placeholder="Describe the purpose and responsibilities of this role"
						value={roleDescription}
						onChange={setRoleDescription}
						rows={4}
					/>
				</div>

				{/* Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="danger"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleCreate}
						disabled={!roleName.trim()}
					>
						Create
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateCustomRoleModal;

