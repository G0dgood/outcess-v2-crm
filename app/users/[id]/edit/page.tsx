'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import PageHeading from '@/components/ui/PageHeading';
import BackButton from '@/components/ui/BackButton';
import { ExclamationTriangleIcon, Cross2Icon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetTeamMemberByIdQuery, useUpdateTeamMemberMutation, useAdminResetTeamMemberPasswordByIdMutation, useGetSupervisorsByLineOfBusinessIdQuery } from '@/store/services/teamMembersApi';
import { useGetRolesByLineOfBusinessIdQuery } from '@/store/services/roleApi';
import { Skeleton } from '@/components/ui/skeleton';
import Tabs from '@/components/ui/Tabs';


interface ApiError {
	data?: {
		message?: string;
	};
}

interface Role {
	_id: string;
	id?: string;
	roleName: string;
	supervisorTitle?: string;
}

const EditUserPage: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const userId = params.id as string;
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const { user } = useUserInfo();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';

	const { data: userResponse, isLoading: isUserLoading } = useGetTeamMemberByIdQuery(userId);
	const { data: rolesData } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	const [updateTeamMember] = useUpdateTeamMemberMutation();
	const [adminResetTeamMemberPassword, { isLoading: isResettingPassword }] = useAdminResetTeamMemberPasswordByIdMutation();

	const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
	const [showAlert, setShowAlert] = useState(true);
	const [passwordData, setPasswordData] = useState({
		newPassword: '',
		confirmPassword: '',
	});
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
		status: true,
		supervisorId: '',
	});

	const companyId =
		(user?.company as { _id?: string; id?: string } | undefined)?._id ||
		(user?.company as { _id?: string; id?: string } | undefined)?.id ||
		user?.companyId ||
		'';

	const { data: supervisorsResponse } = useGetSupervisorsByLineOfBusinessIdQuery(
		{ companyId, lineOfBusinessId: selectedLineOfBusinessId || '' },
		{ skip: !companyId || !selectedLineOfBusinessId }
	);

	useEffect(() => {
		if (userResponse) {
			const user = userResponse?.teamMember || userResponse.data || userResponse;

			let fName = user?.firstName || '';
			let lName = user?.lastName || '';

			if (!fName && !lName && user?.name) {
				const parts = user?.name.split(' ');
				fName = parts[0];
				lName = parts.slice(1).join(' ');
			}

			setFormData({
				firstName: fName,
				lastName: lName,
				email: user?.email || '',
				phone: user?.phone || '',
				role: typeof user.role === 'object' ? (user?.role?._id || user?.role?.id) : (user?.role || ''),
				status: user?.status === 'Active' ||
					user?.status === 'active' ||
					user?.loginStatus === 'Logged In' ||
					user?.isActive === true ||
					user?.status === true,
				supervisorId: user?.supervisorId || '',
			});
		}
	}, [userResponse]);

	const roleOptions = useMemo(() => {
		const rawRoles = rolesData
			? (Array.isArray(rolesData) ? rolesData :
				(Array.isArray((rolesData as unknown as { data: unknown[] })?.data) ? (rolesData as unknown as { data: unknown[] }).data :
					(Array.isArray((rolesData as unknown as { roles: unknown[] })?.roles) ? (rolesData as unknown as { roles: unknown[] }).roles :
						(Array.isArray((rolesData as unknown as { docs: unknown[] })?.docs) ? (rolesData as unknown as { docs: unknown[] }).docs :
							[]))))
			: [];

		const baseOptions = rawRoles
			.filter((role: unknown): role is { _id?: string; id?: string } => {
				const r = role as { _id?: string; id?: string };
				return !!(r._id || r.id);
			})
			.map((role) => {
				const r = role as Role;
				return {
					value: r._id || r.id || '',
					label: r.supervisorTitle || r.roleName
				};
			});

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
				label: (role.supervisorTitle || role.roleName || '') as string
			}))
			.filter((opt) => opt.value && opt.label);

		const existingValues = new Set(baseOptions.map((opt) => opt.value));

		return [
			...baseOptions,
			...supervisorOptions.filter((opt) => !existingValues.has(opt.value)),
		];
	}, [rolesData, supervisorsResponse]);

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

	const shouldShowSupervisor = useMemo(() => {
		if (!formData?.role) return false;

		const selected = roleOptions.find((opt) => opt.value === formData.role);
		const label = selected?.label.toLowerCase() || '';

		return label === 'agent' || label === 'supervisor' || label.includes('supervisor');
	}, [formData?.role, roleOptions]);

	const handleInputChange = (field: string) => (value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			await updateTeamMember({
				id: userId,
				data: {
					firstName: formData?.firstName,
					lastName: formData?.lastName,
					phone: formData?.phone,
					role: formData?.role,
					status: formData?.status ? 'Active' : 'Inactive',
					supervisorId: formData?.supervisorId || null
				}
			}).unwrap();
			toast.success('User updated successfully');
			router.push('/users');
		} catch (error: unknown) {
			console.error('Failed to update user:', error);
			const errorMessage = (error as ApiError)?.data?.message || 'Failed to update user';
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		router.push('/users');
	};

	const handlePasswordChange = (field: string) => (value: string) => {
		setPasswordData(prev => ({ ...prev, [field]: value }));
	};

	const handleChangePassword = async () => {
		if (passwordData.newPassword && passwordData.confirmPassword) {
			if (passwordData.newPassword === passwordData.confirmPassword) {
				try {
					await adminResetTeamMemberPassword({ id: userId, password: passwordData.newPassword }).unwrap();
					toast.success('Password updated successfully');
					router.push('/users');
				} catch (error: unknown) {
					console.error('Failed to update password:', error);
					const errorMessage = (error as ApiError)?.data?.message || 'Failed to update password';
					toast.error(errorMessage);
				}
			} else {
				toast.error('Passwords do not match');
			}
		}
	};

	if (isUserLoading) {
		return (
			<div className="w-full">
				<div className="mb-4">
					<Skeleton className="h-8 w-24" />
				</div>
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center gap-4 mb-4">
						<Skeleton className="w-16 h-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>
					<div className="flex gap-6 border-b dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-20" />
					</div>
				</div>
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<Skeleton className="h-8 w-32 mb-6" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
					<div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-10 w-24" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			{/* Back Button */}
			<div className="mb-4">
				<BackButton onClick={handleCancel} />
			</div>

			{/* User Header */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex items-center gap-4 mb-4">
					<div
						className="w-16 h-16 rounded-full dark:bg-gray-700 flex items-center justify-center"
						style={{ backgroundColor: 'var(--bg-primary)' }}
					>
						<span
							className="text-[14px] md:text-[16px] font-semibold dark:text-gray-300"
							style={{ color: 'var(--text-secondary)' }}
						>
							{formData.firstName[0]}{formData.lastName[0]}
						</span>
					</div>
					<div>
						<h2
							className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							{formData.firstName} {formData.lastName}
						</h2>
						<p
							className="text-[10px] md:text-[12px] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{formData.email}
						</p>
						<p
							className="text-[10px] md:text-[12px] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{formData.phone}
						</p>
					</div>
				</div>

				{/* Tabs */}
				<Tabs
					tabs={[
						{ id: 'profile', label: 'Profile' },
						{ id: 'security', label: 'Security' }
					]}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id as 'profile' | 'security')}
					activeColor={primaryColor}
				/>
			</div>

			{/* Profile Form */}
			{activeTab === 'profile' && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<PageHeading text="Edit User" className="mb-6" />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Input
							label="First Name"
							value={formData.firstName}
							onChange={handleInputChange('firstName')}
							placeholder="Enter First Name"
						/>

						<Input
							label="Last Name"
							value={formData.lastName}
							onChange={handleInputChange('lastName')}
							placeholder="Enter Last Name"
						/>

						<div style={{ backgroundColor: 'var(--bg-primary)' }} className="dark:bg-gray-700">
							<Input
								label="Email Address"
								value={formData.email}
								onChange={handleInputChange('email')}
								placeholder="Enter Email"
								type="email"
								disabled
							/>
						</div>

						<Input
							label="Mobile"
							value={formData?.phone}
							onChange={handleInputChange('phone')}
							placeholder="Enter Mobile Number"
							type="tel"
						/>

						<Dropdown
							label="Role"
							value={formData?.role}
							onChange={(value) => handleInputChange('role')(Array.isArray(value) ? value[0] : value)}
							options={roleOptions}
							placeholder="Select Role"
						/>

						{shouldShowSupervisor && (
							<Dropdown
								label="Supervisor"
								placeholder="Select Supervisor"
								options={supervisorOptions}
								value={formData?.supervisorId}
								onChange={(value) => handleInputChange('supervisorId')(Array.isArray(value) ? value[0] : value)}
							/>
						)}

						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-2"
								style={{ color: 'var(--text-secondary)' }}
							>
								Status
							</label>
							<div className="flex items-center gap-3">
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-300"
									style={{ color: 'var(--text-secondary)' }}
								>
									{formData?.status ? 'Active' : 'Inactive'}
								</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={formData?.status}
										onChange={(e) => handleInputChange('status')(e.target.checked)}
										className="sr-only peer"
									/>
									<div
										className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-4"
										style={{
											backgroundColor: formData.status ? primaryColor : '#D1D5DB',
											boxShadow: formData.status ? `0 0 0 4px ${primaryColor}40` : 'none',
										}}
									/>
								</label>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div
						className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700"
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
							onClick={handleSave}
							style={{ backgroundColor: primaryColor }}
						>
							Save
						</Button>
					</div>
				</div>
			)}

			{/* Security Form */}
			{activeTab === 'security' && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					{/* Alert Message */}
					{showAlert && (
						<div
							className="mb-6 p-4 dark:bg-orange-900/30 border dark:border-orange-800 flex items-start gap-3 rounded"
							style={{
								backgroundColor: 'rgba(251, 146, 60, 0.1)',
								borderColor: 'rgba(251, 146, 60, 0.3)'
							}}
						>
							<div className="shrink-0 mt-0.5">
								<ExclamationTriangleIcon className="w-5 h-5 dark:text-orange-400" style={{ color: '#F97316' }} />
							</div>
							<div
								className="flex-1 text-[10px] md:text-[12px] dark:text-orange-400"
								style={{ color: '#EA580C' }}
							>
								You&apos;re about to change the password of {formData.firstName} {formData.lastName}. The user will be logged out immediately.
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowAlert(false)}
								className="shrink-0 transition-colors p-1 h-auto"
								style={{ color: '#F97316' }}
								onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = '#EA580C';
								}}
								onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.currentTarget.style.color = '#F97316';
								}}
								title="Close alert"
							>
								<Cross2Icon className="w-4 h-4" />
							</Button>
						</div>
					)}

					{/* Password Fields */}
					<div className="space-y-6">
						<Input
							label="Enter new password"
							value={passwordData.newPassword}
							onChange={handlePasswordChange('newPassword')}
							placeholder="Enter new password"
							type="password"
						/>

						<Input
							label="Confirm new password"
							value={passwordData?.confirmPassword}
							onChange={handlePasswordChange('confirmPassword')}
							placeholder="Confirm new password"
							type="password"
						/>
					</div>

					{/* Action Buttons */}
					<div
						className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-700"
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
							onClick={handleChangePassword}
							disabled={!passwordData?.newPassword || !passwordData?.confirmPassword}
						>
							{isResettingPassword ? 'Resetting...' : 'Change Password'}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default EditUserPage;
