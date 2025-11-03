'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import PageHeading from '@/components/ui/PageHeading';
import { ExclamationTriangleIcon, Cross2Icon } from '@radix-ui/react-icons';

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

	const [loading, setLoading] = useState(true);

	// Mock user data - in a real app, fetch from API using userId
	const mockUsers: User[] = [
		{
			id: 'Sup1109',
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'janedoe@example.com',
			phone: '08023456789',
			role: 'Agent',
			loginStatus: 'Logged In',
		},
		{
			id: 'Sup1110',
			firstName: 'John',
			lastName: 'Smith',
			email: 'johnsmith@example.com',
			phone: '08023456790',
			role: 'Supervisor',
			loginStatus: 'Logged Out',
		},
		{
			id: 'Sup1111',
			firstName: 'Alice',
			lastName: 'Johnson',
			email: 'alicejohnson@example.com',
			phone: '08023456791',
			role: 'Agent',
			loginStatus: 'Logged In',
		},
	];

	useEffect(() => {
		// Find user by ID
		const user = mockUsers.find(u => u.id === userId);
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				role: user.role,
				status: user.loginStatus === 'Logged In',
			});
		}
		setLoading(false);
	}, [userId]);

	const roleOptions = [
		{ value: 'Agent', label: 'Agent' },
		{ value: 'Supervisor', label: 'Supervisor' },
		{ value: 'Admin', label: 'Admin' },
	];

	const handleInputChange = (field: string) => (value: string | boolean) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		console.log('Saving user:', formData);
		// Implement save logic here
		// After saving, navigate back to users page
		router.push('/users');
	};

	const handleCancel = () => {
		router.push('/users');
	};

	const handlePasswordChange = (field: string) => (value: string) => {
		setPasswordData(prev => ({ ...prev, [field]: value }));
	};

	const handleChangePassword = () => {
		if (passwordData.newPassword && passwordData.confirmPassword) {
			if (passwordData.newPassword === passwordData.confirmPassword) {
				console.log('Changing password for user:', userId);
				// Implement password change logic here
				router.push('/users');
			} else {
				alert('Passwords do not match');
			}
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			{/* User Header */}
			<div className="bg-white border border-gray-200 p-6 mb-6">
				<div className="flex items-center gap-4 mb-4">
					<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
						<span className="text-xl font-semibold text-gray-600">
							{formData.firstName[0]}{formData.lastName[0]}
						</span>
					</div>
					<div>
						<h2 className="text-2xl font-semibold text-gray-900">
							{formData.firstName} {formData.lastName}
						</h2>
						<p className="text-sm text-gray-500">{formData.email}</p>
						<p className="text-sm text-gray-500">{formData.phone}</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex gap-6 border-b border-gray-200">
					<button
						onClick={() => setActiveTab('profile')}
						className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'profile'
							? 'border-b-2 border-blue-600 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'
							}`}
					>
						Profile
					</button>
					<button
						onClick={() => setActiveTab('security')}
						className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'security'
							? 'border-b-2 border-blue-600 text-blue-600'
							: 'text-gray-500 hover:text-gray-700'
							}`}
					>
						Security
					</button>
				</div>
			</div>

			{/* Profile Form */}
			{activeTab === 'profile' && (
				<div className="bg-white border border-gray-200 rounded-lg p-6">
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

						<Input
							label="Email Address"
							value={formData.email}
							onChange={handleInputChange('email')}
							placeholder="Enter Email"
							type="email"
							disabled
							className="bg-gray-50"
						/>

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
							onChange={handleInputChange('role')}
							options={roleOptions}
							placeholder="Select Role"
						/>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Status
							</label>
							<div className="flex items-center gap-3">
								<span className="text-sm text-gray-700">
									{formData.status ? 'Active' : 'Inactive'}
								</span>
								<label className="relative inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={formData.status}
										onChange={(e) => handleInputChange('status')(e.target.checked)}
										className="sr-only peer"
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
								</label>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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
							onClick={handleSave}
						>
							Save
						</Button>
					</div>
				</div>
			)}

			{/* Security Form */}
			{activeTab === 'security' && (
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					{/* Alert Message */}
					{showAlert && (
						<div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
							<div className="shrink-0 mt-0.5">
								<ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
							</div>
							<div className="flex-1 text-sm text-orange-800">
								You're about to change the password of {formData.firstName} {formData.lastName}. The user will be logged out immediately.
							</div>
							<button
								onClick={() => setShowAlert(false)}
								className="shrink-0 text-orange-600 hover:text-orange-800 transition-colors"
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
					<div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
						<Button
							variant="outline"
							size="md"
							onClick={handleCancel}
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							size="md"
							onClick={handleChangePassword}
							disabled={!passwordData.newPassword || !passwordData.confirmPassword}
						>
							Change Password
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export default EditUserPage;

