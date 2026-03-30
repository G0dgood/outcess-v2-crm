'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useCreateTeamMemberMutation, useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { useGetRolesByLineOfBusinessIdQuery, Role } from '@/store/services/roleApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';

interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
	isOpen,
	onClose,

}) => {
	const { user } = useUserInfo();
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';
	const companyId = user?.companyId || user?.company?._id || '';

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
		userId: '',
		status: '',
		password: '',
		supervisorId: '',
	});

	// API Hooks
	const { data: rolesResponse } = useGetRolesByLineOfBusinessIdQuery(lineOfBusinessId, { skip: !lineOfBusinessId });
	const { data: supervisorsResponse } = useGetSupervisorsByLineOfBusinessIdQuery(
		{ companyId, lineOfBusinessId },
		{ skip: !companyId || !lineOfBusinessId }
	);
	const [createTeamMember, { isLoading }] = useCreateTeamMemberMutation();



	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
				role: '',
				userId: '',
				status: 'inactive',
				password: '123456',
				supervisorId: '',
			});
		}
	}, [isOpen]);

	const roleOptions = useMemo(() => {
		const baseRoles = rolesResponse?.roles || [];
		const baseOptions = baseRoles.map((role: Role) => ({
			value: (role._id || role.id || '') as string,
			label: (role.roleName || '') as string,
		}));

		if (!supervisorsResponse || !Array.isArray(supervisorsResponse.roles)) {
			return baseOptions;
		}

		const supervisorRoles = supervisorsResponse.roles as {
			_id?: string;
			id?: string;
			roleName?: string;
			supervisorTitle?: string;
		}[];

		const supervisorOptions = supervisorRoles
			.map((role) => ({
				value: (role._id || role.id || '') as string,
				label: (role.supervisorTitle || role.roleName || '') as string,
			}))
			.filter((opt) => opt.value && opt.label);

		const existingValues = new Set(baseOptions.map((opt) => opt.value));
		const merged = [
			...baseOptions,
			...supervisorOptions.filter((opt) => !existingValues.has(opt.value)),
		];

		return merged;
	}, [rolesResponse, supervisorsResponse]);

	const supervisorOptions = useMemo(() => {
		if (!supervisorsResponse || !Array.isArray(supervisorsResponse.roles)) return [];
		const rawRoles = supervisorsResponse.roles as {
			_id?: string;
			id?: string;
			roleName?: string;
			supervisorTitle?: string;
		}[];
		return rawRoles
			.map((role) => ({
				value: (role._id || role.id || '') as string,
				label: (role.supervisorTitle || role.roleName || '') as string
			}))
			.filter((opt) => opt.value && opt.label);
	}, [supervisorsResponse]);

	const handleInputChange = (field: string) => (value: string | string[]) => {
		const stringValue = Array.isArray(value) ? value[0] : value;
		setFormData(prev => ({ ...prev, [field]: stringValue }));

	};

	const handleSave = async () => {
		if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role || !formData.password || !formData.userId) {
			return;
		}

		if (!companyId) {
			toast.error('Company ID is missing');
			return;
		}

		try {
			const payload = {
				name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				phone: formData.phone,
				role: formData.role,
				companyId: companyId,
				lineOfBusinessId: lineOfBusinessId || undefined,
				supervisorId: formData.supervisorId || undefined,
				password: formData.password,
				userId: formData.userId || undefined,
				status: formData.status || 'inactive',
			};



			await createTeamMember(payload).unwrap();

			toast.success('User created successfully');
			onClose();
		} catch (error: unknown) {
			console.error('Failed to create user:', error);
			const err = error as { data?: { message?: string } };
			toast.error(err?.data?.message || 'Failed to create user');
		}
	};

	if (!isOpen) return null;

	const selectedRoleLabel = roleOptions.find(opt => opt.value === formData.role)?.label.toLowerCase();
	const shouldShowSupervisor =
		selectedRoleLabel === 'agent' ||
		selectedRoleLabel === 'supervisor' ||
		(selectedRoleLabel || '').includes('supervisor');

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 overflow-hidden"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Add User
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
				</div>

				{/* Modal Form */}
				<div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
					<Input
						label="First Name"
						placeholder="Enter First Name"
						value={formData.firstName}
						onChange={handleInputChange('firstName')}
						required
					/>

					<Input
						label="Last Name"
						placeholder="Enter Last Name"
						value={formData.lastName}
						onChange={handleInputChange('lastName')}
						required
					/>

					<Input
						label="Email Address"
						placeholder="Enter Email"
						value={formData.email}
						onChange={handleInputChange('email')}
						type="email"
						required
					/>
					<Input
						label="userId"
						placeholder="Enter userId"
						value={formData.userId}
						onChange={handleInputChange('userId')}
						type="text"
						required
					/>

					<Input
						label="Phone"
						placeholder="Enter Mobile Number"
						value={formData.phone}
						onChange={handleInputChange('phone')}
						type="tel"
						required
					/>

					<Input
						label="Password"
						placeholder="Enter Password"
						value={formData.password}
						onChange={handleInputChange('password')}
						type="password"
						required
					/>

					<Dropdown
						label="Role"
						placeholder="Select Role"
						options={roleOptions}
						value={formData.role}
						onChange={handleInputChange('role')}
						required
					/>

					{shouldShowSupervisor && (
						<Dropdown
							label="Supervisor"
							placeholder="Select Supervisor"
							options={supervisorOptions}
							value={formData.supervisorId}
							onChange={handleInputChange('supervisorId')}
						/>
					)}


				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-between items-center p-6 border-t dark:border-gray-700 w-full"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex gap-3 w-full justify-end">
						<Button
							variant="outline"
							size="md"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="md"
							onClick={handleSave}
							disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role || !formData.userId || !formData.password || isLoading}
							loading={isLoading}
						>
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddUserModal;
