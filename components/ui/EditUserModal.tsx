'use client';

import React from 'react';
import Input from './Input';
import Dropdown from './Dropdown';
import Button from './Button';
import Icon from './Icon';

interface EditUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
	}) => void;
	userData: {
		name: string;
		email: string;
		phone: string;
		role: string;
	};
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
	isOpen,
	onClose,
	onSave,
	userData,
}) => {
	const [formData, setFormData] = React.useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
	});

	const roleOptions = [
		{ value: 'administrator', label: 'Administrator' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'user', label: 'User' },
		{ value: 'viewer', label: 'Viewer' }
	];

	// Update form data when userData changes
	React.useEffect(() => {
		if (userData) {
			const nameParts = userData.name.split(' ');
			setFormData({
				firstName: nameParts[0] || '',
				lastName: nameParts.slice(1).join(' ') || '',
				email: userData.email,
				phone: userData.phone,
				role: userData.role,
			});
		}
	}, [userData]);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		if (formData.firstName && formData.lastName && formData.email && formData.phone && formData.role) {
			onSave(formData);
			onClose();
		}
	};

	const handleCancel = () => {
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#0b0d1293]/50 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white w-full max-w-md mx-4">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4 p-6">
					<h2 className="font-inter text-xl font-semibold text-[#050711]">Edit User</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6">
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
						label="Phone"
						placeholder="Enter Mobile Number"
						value={formData.phone}
						onChange={handleInputChange('phone')}
						type="tel"
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
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end gap-3 p-6">
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
						disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role}
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EditUserModal;
