import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';

interface AddTeamMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: any) => void;
	editingMember?: any;
	roles: { label: string; value: string }[];
	supervisors: { label: string; value: string }[];
	shiftHours: { label: string; value: string }[];
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
	isOpen,
	onClose,
	onSave,
	editingMember,
	roles,
	supervisors,
	shiftHours,
}) => {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		role: '',
		supervisorId: '',
		shiftHourId: '',
		password: '',
	});

	useEffect(() => {
		if (editingMember) {
			const nameParts = editingMember.fullName?.split(' ') || ['', ''];
			setFormData({
				firstName: nameParts[0] || '',
				lastName: nameParts.slice(1).join(' ') || '',
				email: editingMember.email || '',
				phone: editingMember.phone || '',
				role: editingMember.roleId || editingMember.role || '',
				supervisorId: editingMember.supervisorId || '',
				shiftHourId: editingMember.shiftHourId || '',
				password: '', // Don't pre-fill password on edit
			});
		} else {
			setFormData({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
				role: '',
				supervisorId: '',
				shiftHourId: '',
				password: '',
			});
		}
	}, [editingMember, isOpen]);

	if (!isOpen) return null;

	const handleSubmit = () => {
		if (!formData.firstName || !formData.email || !formData.role) {
			return; // Basic validation
		}
		onSave(formData);
	};

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-2xl bg-white rounded-[var(--radius)] shadow-2xl flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
					<div>
						<h2 className="text-lg font-semibold dark:text-gray-100">
							{editingMember ? 'Edit Team Member' : 'Add Team Member'}
						</h2>
						<p className="text-xs text-gray-500 mt-1">
							{editingMember ? 'Update account details and permissions.' : 'Create a new account for your team.'}
						</p>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose} className="p-2 h-auto text-gray-400">
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>

				{/* Body */}
				<div className="p-6 overflow-y-auto space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="First Name"
							placeholder="John"
							value={formData.firstName}
							onChange={(val) => setFormData((prev) => ({ ...prev, firstName: val }))}
						/>
						<Input
							label="Last Name"
							placeholder="Doe"
							value={formData.lastName}
							onChange={(val) => setFormData((prev) => ({ ...prev, lastName: val }))}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Email Address"
							placeholder="john@example.com"
							value={formData.email}
							onChange={(val) => setFormData((prev) => ({ ...prev, email: val }))}
						/>
						<Input
							label="Phone Number"
							placeholder="+1 234 567 890"
							value={formData.phone}
							onChange={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Dropdown
							label="Role"
							placeholder="Select a role"
							options={roles}
							value={formData.role}
							onChange={(val) => setFormData((prev) => ({ ...prev, role: Array.isArray(val) ? val[0] : val }))}
						/>
						<Dropdown
							label="Supervisor (Optional)"
							placeholder="Select a supervisor"
							options={supervisors}
							value={formData.supervisorId}
							onChange={(val) => setFormData((prev) => ({ ...prev, supervisorId: Array.isArray(val) ? val[0] : val }))}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Dropdown
							label="Shift Hour (Optional)"
							placeholder="Select a shift"
							options={shiftHours}
							value={formData.shiftHourId}
							onChange={(val) => setFormData((prev) => ({ ...prev, shiftHourId: Array.isArray(val) ? val[0] : val }))}
						/>
						{!editingMember && (
							<Input
								label="Password"
								type="password"
								placeholder="••••••••"
								value={formData.password}
								onChange={(val) => setFormData((prev) => ({ ...prev, password: val }))}
							/>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button variant="primary" onClick={handleSubmit}>
						{editingMember ? 'Update Member' : 'Create Member'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddTeamMemberModal;
