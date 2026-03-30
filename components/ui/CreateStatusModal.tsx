'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import Checkbox from './Checkbox';
import IndividualRadio from './IndividualRadio';
import ColorPicker from './ColorPicker';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useCreateStatusMutation, useUpdateStatusMutation } from '@/store/services/statusApi';
import { useGetRolesByLineOfBusinessIdQuery, Role } from '@/store/services/roleApi';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface StatusFormData {
	name: string;
	description: string;
	roleSelection: 'all' | 'selected';
	selectedRoles: string[];
	color: string;
	isHibernate: boolean;
	duration: number;
}

interface RoleOption {
	id: string;
	label: string;
}

interface CreateStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialData?: Partial<StatusFormData> | null;
	statusId?: string;
}

// Removed static roleOptions

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
	isOpen,
	onClose,
	initialData,
	statusId,
}) => {
	const [formData, setFormData] = useState<StatusFormData>({
		name: '',
		description: '',
		roleSelection: 'all',
		selectedRoles: [],
		color: '#6C8B7D',
		isHibernate: false,
		duration: 0,
	});
	const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { user } = useUserInfo();
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const companyId = user?.companyId || user?.company?._id;

	const { data: rolesData } = useGetRolesByLineOfBusinessIdQuery(selectedLineOfBusinessId || '', {
		skip: !selectedLineOfBusinessId
	});

	const roleOptions: RoleOption[] = React.useMemo(() => {
		if (!rolesData) return [];

		const rawRoles = (Array.isArray(rolesData) ? rolesData :
			(Array.isArray((rolesData as unknown as { data?: unknown })?.data) ? (rolesData as unknown as { data: unknown[] }).data :
				(Array.isArray((rolesData as unknown as { roles?: unknown })?.roles) ? (rolesData as unknown as { roles: unknown[] }).roles :
					(Array.isArray((rolesData as unknown as { docs?: unknown })?.docs) ? (rolesData as unknown as { docs: unknown[] }).docs :
						[]))));

		return (rawRoles as Role[])
			.filter((role: Role) => (role._id || role.id))
			.map((role: Role) => ({
				id: (role._id || role.id)!,
				label: role.roleName
			}));
	}, [rolesData]);

	const [createStatus] = useCreateStatusMutation();
	const [updateStatus] = useUpdateStatusMutation();

	const isEditMode = !!statusId;

	useEffect(() => {
		if (isOpen && initialData) {
			setFormData({
				name: initialData.name || '',
				description: initialData.description || '',
				roleSelection: initialData.roleSelection || 'all',
				selectedRoles: initialData.selectedRoles || [],
				color: initialData.color || '#6C8B7D',
				isHibernate: initialData.isHibernate || false,
				duration: initialData.duration || 0,
			});
		} else if (isOpen && !initialData) {
			setFormData({
				name: '',
				description: '',
				roleSelection: 'all',
				selectedRoles: [],
				color: '#6C8B7D',
				isHibernate: false,
				duration: 0,
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

	const handleCreate = async () => {
		if (formData.name.trim()) {
			try {
				if (isEditMode && statusId) {
					// Update existing status
					await updateStatus({
						id: statusId,
						statusData: formData
					}).unwrap();
					toastSuccess('Status updated successfully');
				} else {
					// Create new status
					if (companyId) {
						await createStatus({
							...formData,
							companyId,
							lineOfBusinessId: selectedLineOfBusinessId || undefined
						}).unwrap();
						toastSuccess('Status created successfully');
					} else {
						console.error("Company ID missing, cannot create status");
						toastError('Company ID missing, cannot create status');
						return;
					}
				}
				onClose();
			} catch (error) {
				console.error("Failed to save status:", error);
				toastError('Failed to save status');
			}
		}
	};

	const getRoleSelectionDisplay = () => {
		if (formData.selectedRoles.length === 0) {
			return 'Select roles';
		}
		const selectedLabels = roleOptions
			.filter((role: RoleOption) => formData.selectedRoles.includes(role.id))
			.map((role: RoleOption) => role.label)
			.join(', ');
		return selectedLabels;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-lg mx-4 h-[85vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{isEditMode ? 'Edit Status' : 'Create Status'}
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors !rounded-none"
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
					</Button>
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

					<ColorPicker
						label="Status Color"
						value={formData.color}
						onChange={(color) => setFormData(prev => ({ ...prev, color }))}
					/>

					<div className="flex items-center justify-between gap-4 p-4 border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
						<div className="flex-1">
							<label className="text-[12px] font-medium text-gray-900 dark:text-gray-100 block mb-1">
								Hibernate Status
							</label>
							<p className="text-[10px] text-gray-500 dark:text-gray-400">
								Locks the platform entirely when this status is active.
							</p>
						</div>
						<Checkbox
							checked={formData.isHibernate}
							onChange={(checked) => setFormData(prev => ({ ...prev, isHibernate: checked }))}
							size="medium"
						/>
					</div>

					<Input
						label="Duration (minutes)"
						type="number"
						placeholder="E.g., 15"
						value={formData.duration.toString()}
						onChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) || 0 }))}
						description="Maximum time allowed in this status before notifying supervisors. Set to 0 for unlimited."
					/>

					{/* Role Selection */}
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-3"
							style={{ color: 'var(--text-secondary)' }}
						>
							Role
						</label>
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
												<Button
													variant="outline"
													size="md"
													type="button"
													onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
													className="dropdown-trigger w-full !rounded-none justify-between"
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
												</Button>
												{isRoleDropdownOpen && (
													<div className="dropdown-menu">
														<div className="dropdown-options">
															{roleOptions.map((role: RoleOption) => (
																<label
																	key={role.id}
																	className="dropdown-option flex items-center gap-3 cursor-pointer"
																	onClick={(e) => e.stopPropagation()}
																>
																	<div className="flex items-center gap-2">
																		<Checkbox
																			checked={formData.selectedRoles.includes(role.id)}
																			onChange={() => handleRoleToggle(role.id)}
																			size="medium"
																		/>
																		<span className="text-[10px] md:text-[12px] dark:text-gray-300" style={{ color: 'var(--text-primary)' }}>
																			{role.label}
																		</span>
																	</div>
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
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
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
