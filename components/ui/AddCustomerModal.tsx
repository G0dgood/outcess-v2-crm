'use client';

import React from 'react';
import Input from './Input';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

interface AddCustomerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (customerData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	}) => void;
	onAddFields?: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
	isOpen,
	onClose,
	onSave,
	onAddFields,
}) => {
	const [formData, setFormData] = React.useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		if (formData.firstName && formData.lastName && formData.email && formData.phone) {
			onSave(formData);
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
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
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4"
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
						Add Customer
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

				{/* Modal Form */}
				<div className="p-6 space-y-6">
					<Input
						label="First Name"
						placeholder="Enter First Name"
						value={formData.firstName}
						onChange={handleInputChange('firstName')}
						required
						inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>

					<Input
						label="Last Name"
						placeholder="Enter Last Name"
						value={formData.lastName}
						onChange={handleInputChange('lastName')}
						required
						inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>

					<Input
						label="Email Address"
						placeholder="Enter Email"
						value={formData.email}
						onChange={handleInputChange('email')}
						type="email"
						required
						inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>

					<Input
						label="Mobile"
						placeholder="Enter Mobile Number"
						value={formData.phone}
						onChange={handleInputChange('phone')}
						type="tel"
						required
						inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-between items-center p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<button
						onClick={onAddFields}
						className="font-medium transition-colors"
						style={{ color: '#EA580C' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = '#C2410C';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = '#EA580C';
						}}
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
							disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
						>
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddCustomerModal;

