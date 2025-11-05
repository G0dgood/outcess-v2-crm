'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Checkbox from './Checkbox';
import Dropdown from './Dropdown';
import IndividualRadio from './IndividualRadio';
import { Cross2Icon } from '@radix-ui/react-icons';

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
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div className="bg-white dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
						{isEditMode ? 'Edit Status' : 'Create Status'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Role</label>
						<div className="space-y-3">
							<IndividualRadio
								name="roleSelection"
								value="all"
								checked={formData.roleSelection === 'all'}
								onChange={(value) => setFormData(prev => ({ ...prev, roleSelection: value as 'all' | 'selected' }))}
								label="All Roles"
							/>
							<div>
								<IndividualRadio
									name="roleSelection"
									value="selected"
									checked={formData.roleSelection === 'selected'}
									onChange={(value) => setFormData(prev => ({ ...prev, roleSelection: value as 'all' | 'selected' }))}
									label="Only Selected Roles"
								/>
								{formData.roleSelection === 'selected' && (
									<div className="ml-7 mt-2" ref={dropdownRef}>
										<div className="dropdown-container">
											<div className="dropdown-wrapper relative">
												<button
													type="button"
													onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
													className="dropdown-trigger w-full"
												>
													<span className={`dropdown-text ${formData.selectedRoles.length === 0 ? 'placeholder' : ''}`}>
														{getRoleSelectionDisplay()}
													</span>
													<svg
														className={`dropdown-chevron ${isRoleDropdownOpen ? 'open' : ''}`}
														width="12"
														height="12"
														viewBox="0 0 12 12"
														fill="none"
													>
														<path
															d="M3 4.5L6 7.5L9 4.5"
															stroke="currentColor"
															strokeWidth="1.5"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</button>
												{isRoleDropdownOpen && (
													<div className="dropdown-menu">
														<div className="dropdown-options">
															{roleOptions.map((role) => (
																<label
																	key={role.id}
																	className="dropdown-option flex items-center gap-3 cursor-pointer"
																	onClick={(e) => e.stopPropagation()}
																>
																	<Checkbox
																		checked={formData.selectedRoles.includes(role.id)}
																		onChange={() => handleRoleToggle(role.id)}
																		size="small"
																		label={role.label}
																	/>

																</label>
															))}
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 shrink-0">
					<Button
						variant="danger"
						size="md"
						onClick={onClose}
					>
						Cancel
					</Button>
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

