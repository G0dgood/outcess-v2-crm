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
import { useGetTeamMemberByIdQuery, useUpdateTeamMemberPasswordMutation, useUpdateTeamMemberMutation, useAdminResetTeamMemberPasswordByIdMutation } from '@/store/services/teamMembersApi';
import { useGetRolesByLineOfBusinessIdQuery } from '@/store/services/roleApi';

interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	role: string;
	loginStatus: string;
}

const EditUserPage: React.FC = () => {
	const router = useRouter();
	const params = useParams();
	const userId = params.id as string;
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';

	const { data: userResponse, isLoading: isUserLoading } = useGetTeamMemberByIdQuery(userId);
	const { data: rolesData } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	const [updateTeamMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
	// const [updateTeamMemberPassword, { isLoading: isUpdatingPassword }] = useUpdateTeamMemberPasswordMutation();
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
	});

	useEffect(() => {
		if (userResponse) {
			const user = userResponse.teamMember || userResponse.data || userResponse;
			console.log('Fetched user data:', user);

			// Handle name splitting if firstName/lastName are missing
			let fName = user.firstName || '';
			let lName = user.lastName || '';

			if (!fName && !lName && user.name) {
				const parts = user.name.split(' ');
				fName = parts[0];
				lName = parts.slice(1).join(' ');
			}

			setFormData({
				firstName: fName,
				lastName: lName,
				email: user.email || '',
				phone: user.phone || '',
				role: typeof user.role === 'object' ? (user.role.roleName || user.role.name) : (user.role || ''),
				status: user.status === 'Active' || user.status === 'active' || user.loginStatus === 'Logged In' || user.isActive === true || user.status === true,
			});
		}
	}, [userResponse]);

	const roleOptions = useMemo(() => {
		if (!rolesData) return [];

		const rawRoles = (Array.isArray(rolesData) ? rolesData :
			(Array.isArray((rolesData as any)?.data) ? (rolesData as any).data :
				(Array.isArray((rolesData as any)?.roles) ? (rolesData as any).roles :
					(Array.isArray((rolesData as any)?.docs) ? (rolesData as any).docs :
						[]))));

		return rawRoles
			.filter((role: any) => (role._id || role.id))
			.map((role: any) => ({
				value: role.roleName, // Using roleName as value to match current implementation
				label: role.roleName
			}));
	}, [rolesData]);

	const handleInputChange = (field: string) => (value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			await updateTeamMember({
				id: userId,
				data: {
					firstName: formData.firstName,
					lastName: formData.lastName,
					phone: formData.phone,
					role: formData.role,
					status: formData.status ? 'Active' : 'Inactive'
				}
			}).unwrap();
			toast.success('User updated successfully');
			router.push('/users');
		} catch (error) {
			console.error('Failed to update user:', error);
			toast.error('Failed to update user');
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
				} catch (error) {
					console.error('Failed to update password:', error);
					toast.error('Failed to update password');
				}
			} else {
				toast.error('Passwords do not match');
			}
		}
	};

	if (isUserLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div>Loading...</div>
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
							className="text-xl font-semibold dark:text-gray-300"
							style={{ color: 'var(--text-secondary)' }}
						>
							{formData.firstName[0]}{formData.lastName[0]}
						</span>
					</div>
					<div>
						<h2
							className="text-2xl font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							{formData.firstName} {formData.lastName}
						</h2>
						<p
							className="text-sm dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{formData.email}
						</p>
						<p
							className="text-sm dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{formData.phone}
						</p>
					</div>
				</div>

				{/* Tabs */}
				<div
					className="flex gap-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<button
						onClick={() => setActiveTab('profile')}
						className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'profile'
							? 'border-b-2'
							: 'dark:text-gray-400 dark:hover:text-gray-200'
							}`}
						style={activeTab === 'profile'
							? { borderColor: primaryColor, color: primaryColor }
							: { color: 'var(--text-tertiary)' }
						}
						onMouseEnter={(e) => {
							if (activeTab !== 'profile') {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}
						}}
						onMouseLeave={(e) => {
							if (activeTab !== 'profile') {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}
						}}
					>
						Profile
					</button>
					<button
						onClick={() => setActiveTab('security')}
						className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'security'
							? 'border-b-2'
							: 'dark:text-gray-400 dark:hover:text-gray-200'
							}`}
						style={activeTab === 'security'
							? { borderColor: primaryColor, color: primaryColor }
							: { color: 'var(--text-tertiary)' }
						}
						onMouseEnter={(e) => {
							if (activeTab !== 'security') {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}
						}}
						onMouseLeave={(e) => {
							if (activeTab !== 'security') {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}
						}}
					>
						Security
					</button>
				</div>
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
							value={formData.phone}
							onChange={handleInputChange('phone')}
							placeholder="Enter Mobile Number"
							type="tel"
						/>

						<Dropdown
							label="Role"
							value={formData.role}
							onChange={(value) => handleInputChange('role')(Array.isArray(value) ? value[0] : value)}
							options={roleOptions}
							placeholder="Select Role"
						/>

						<div>
							<label
								className="block text-sm font-medium dark:text-gray-300 mb-2"
								style={{ color: 'var(--text-secondary)' }}
							>
								Status
							</label>
							<div className="flex items-center gap-3">
								<span
									className="text-sm dark:text-gray-300"
									style={{ color: 'var(--text-secondary)' }}
								>
									{formData.status ? 'Active' : 'Inactive'}
								</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={formData.status}
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
								className="flex-1 text-sm dark:text-orange-400"
								style={{ color: '#EA580C' }}
							>
								You&apos;re about to change the password of {formData.firstName} {formData.lastName}. The user will be logged out immediately.
							</div>
							<button
								onClick={() => setShowAlert(false)}
								className="shrink-0 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
								style={{ color: '#F97316' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = '#EA580C';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = '#F97316';
								}}
								aria-label="Close alert"
							>
								<Cross2Icon className="w-4 h-4" />
							</button>
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
							value={passwordData.confirmPassword}
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
							disabled={!passwordData.newPassword || !passwordData.confirmPassword}
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
