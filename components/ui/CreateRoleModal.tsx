'use client';

import React from 'react';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import Icon from './Icon';

interface CreateRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (roleData: {
		name: string;
		description: string;
	}) => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
	isOpen,
	onClose,
	onCreate,
}) => {
	const [formData, setFormData] = React.useState({
		name: '',
		description: '',
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleCreate = () => {
		if (formData.name && formData.description) {
			onCreate(formData);
			setFormData({ name: '', description: '' });
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({ name: '', description: '' });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
			<div 
				className="dark:bg-gray-800 w-full max-w-md mx-4"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div 
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2 
						className="font-inter text-xl font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Create New Role
					</h2>
					<button
						onClick={onClose}
						className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6">
					<Input
						label="Role Name"
						placeholder="Enter Role Name"
						value={formData.name}
						onChange={handleInputChange('name')}
						required
					/>

					<Textarea
						label="Role Description"
						placeholder="Describe the purpose and responsibilities of this role"
						value={formData.description}
						onChange={handleInputChange('description')}
						rows={4}
						resize="vertical"
						required
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
						disabled={!formData.name || !formData.description}
					>
						Create
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateRoleModal;
