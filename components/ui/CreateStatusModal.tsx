'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Checkbox from './Checkbox';
import { Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';

interface StatusFormData {
	name: string;
	description: string;
	roleSelection: 'all' | 'selected';
	selectedRoles: string[];
}

interface CreateStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: StatusFormData) => void;
	initialData?: Partial<StatusFormData> | null;
}

const roleOptions = [
	{ id: 'agents', label: 'Agents' },
	{ id: 'supervisors', label: 'Supervisors' },
	{ id: 'admin', label: 'Admin' },
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
	isOpen,
	onClose,
	onCreate,
	initialData,
}) => {
	const [formData, setFormData] = useState<StatusFormData>({
		name: '',
		description: '',
		roleSelection: 'all',
		selectedRoles: [],
	});
	const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const isEditMode = !!initialData;

	useEffect(() => {
		if (isOpen && initialData) {
			setFormData({
				name: initialData.name || '',
				description: initialData.description || '',
				roleSelection: initialData.roleSelection || 'all',
				selectedRoles: initialData.selectedRoles || [],
			});
		} else if (isOpen && !initialData) {
			setFormData({
				name: '',
				description: '',
				roleSelection: 'all',
				selectedRoles: [],
			});
		}
	}, [isOpen, initialData]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
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

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsRoleDropdownOpen(false);
			}
		};

		if (isRoleDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isRoleDropdownOpen]);

	const handleRoleToggle = (roleId: string) => {
		setFormData(prev => ({
			...prev,
			selectedRoles: prev.selectedRoles.includes(roleId)
				? prev.selectedRoles.filter(id => id !== roleId)
				: [...prev.selectedRoles, roleId],
		}));
	};

	const handleCreate = () => {
		if (formData.name.trim()) {
			onCreate(formData);
		}
	};

	const getRoleSelectionDisplay = () => {
		if (formData.selectedRoles.length === 0) {
			return 'Select roles';
		}
		const selectedLabels = roleOptions
			.filter(role => formData.selectedRoles.includes(role.id))
			.map(role => role.label)
			.join(', ');
		return selectedLabels;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div className="bg-white shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900">
						{isEditMode ? 'Edit Status' : 'Create Status'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<Input
						label="Name"
						placeholder="Enter Status Name"
						value={formData.name}
						onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
						required
					/>

					<Textarea
						label="Description"
						placeholder="Enter Description"
						value={formData.description}
						onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
						rows={4}
					/>

					{/* Role Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-3">Role</label>
						<div className="space-y-3">
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="radio"
									name="roleSelection"
									value="all"
									checked={formData.roleSelection === 'all'}
									onChange={() => setFormData(prev => ({ ...prev, roleSelection: 'all' }))}
									className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
								/>
								<span className="text-sm font-medium text-gray-900">All Roles</span>
							</label>
							<div>
								<label className="flex items-center gap-3 cursor-pointer">
									<input
										type="radio"
										name="roleSelection"
										value="selected"
										checked={formData.roleSelection === 'selected'}
										onChange={() => setFormData(prev => ({ ...prev, roleSelection: 'selected' }))}
										className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
									/>
									<span className="text-sm font-medium text-gray-900">Only Selected Roles</span>
								</label>
								{formData.roleSelection === 'selected' && (
									<div ref={dropdownRef} className="ml-7 mt-2 relative">
										<button
											type="button"
											onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
										>
											<span className="text-sm text-gray-600">
												{getRoleSelectionDisplay()}
											</span>
											<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${isRoleDropdownOpen ? 'transform rotate-180' : ''}`} />
										</button>
										{isRoleDropdownOpen && (
											<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
												<div className="py-2">
													{roleOptions.map((role) => (
														<label
															key={role.id}
															className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
														>
															<Checkbox
																checked={formData.selectedRoles.includes(role.id)}
																onChange={() => handleRoleToggle(role.id)}
															/>
															<span className="text-sm text-gray-900">{role.label}</span>
														</label>
													))}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t border-gray-200 shrink-0">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
					>
						Cancel
					</button>
					<Button
						variant="primary"
						size="md"
						onClick={handleCreate}
						disabled={!formData.name.trim()}
					>
						{isEditMode ? 'Save' : 'Create Status'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateStatusModal;

