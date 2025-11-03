'use client';

import React from 'react';
import Input from './Input';
import Dropdown from './Dropdown';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (userData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		role: string;
	}) => void;
	roleOptions: { value: string; label: string; }[];
	onAddFields?: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
	isOpen,
	onClose,
	onSave,
	roleOptions,
	onAddFields,
}) => {
	const [formData, setFormData] = React.useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		if (formData.firstName && formData.lastName && formData.email && formData.phone && formData.role) {
			onSave(formData);
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
				role: '',
			});
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			role: '',
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white  w-full max-w-md mx-4">
				{/* Modal Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Add User</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="p-6 space-y-6">
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
				<div className="flex justify-between items-center p-6 border-t border-gray-200">
					<button
						onClick={onAddFields}
						className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
					>
						Add Fields
					</button>
					<div className="flex gap-3">
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
		</div>
	);
};

export default AddUserModal;
