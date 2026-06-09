'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import Checkbox from './Checkbox';
import { Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';

interface ModulePermissionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (roles: string[]) => void;
	selectedRoles: string[];
	availableRoles: { id: string; label: string }[];
}

export const ModulePermissionModal: React.FC<ModulePermissionModalProps> = ({
	isOpen,
	onClose,
	onSave,
	selectedRoles: initialSelectedRoles,
	availableRoles,
}) => {
	const [selectedRoles, setSelectedRoles] = useState<string[]>(initialSelectedRoles);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen) {
			setSelectedRoles(initialSelectedRoles);
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
	}, [isOpen, initialSelectedRoles, onClose]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleRoleToggle = (roleId: string) => {
		setSelectedRoles(prev => {
			if (prev.includes(roleId)) {
				return prev.filter(id => id !== roleId);
			} else {
				return [...prev, roleId];
			}
		});
	};

	const handleRemoveRole = (roleId: string) => {
		setSelectedRoles(prev => prev.filter(id => id !== roleId));
	};

	const handleSave = () => {
		onSave(selectedRoles);
		onClose();
	};





	if (!isOpen) return null;

	const selectedRoleLabels = selectedRoles.map(roleId => {
		const role = availableRoles.find(r => r.id === roleId);
		return { id: roleId, label: role ? role.label : roleId };
	});

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 overflow-hidden flex flex-col max-h-[90vh]"
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
						Module Permission
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

				{/* Form Content */}
				<div className="flex-1 p-6 space-y-4 overflow-y-auto">
					<p
						className="text-[10px] md:text-[12px] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Select the roles that should have access to the module.
					</p>

					<div ref={dropdownRef} className="relative">
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-2"
							style={{ color: 'var(--text-secondary)' }}
						>
							Roles
						</label>
						<div
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="w-full px-3 py-2 dark:border-gray-600 dark:bg-gray-700 text-left flex items-center justify-between dark:hover:border-gray-500 transition-colors min-h-[42px] cursor-pointer"
							style={{
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)',
								borderWidth: '1px',
								borderStyle: 'solid'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = '#94A3B8';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = 'var(--light-gray)';
							}}
						>
							<div className="flex flex-wrap gap-2 flex-1">
								{selectedRoleLabels.length === 0 ? (
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Select roles
									</span>
								) : (
									selectedRoleLabels.map((role) => (
										<span
											key={role.id}
											className="inline-flex items-center gap-1 px-2 py-1 dark:bg-gray-600 dark:border-gray-500 text-[10px] md:text-[12px] dark:text-gray-300"
											style={{
												backgroundColor: 'var(--bg-primary)',
												borderColor: 'var(--light-gray)',
												borderWidth: '1px',
												borderStyle: 'solid',
												color: 'var(--text-primary)'
											}}
										>
											{role.label}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveRole(role.id);
												}}
												className="dark:hover:text-red-400 transition-colors"
												style={{ color: 'var(--text-tertiary)' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = '#DC2626';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = 'var(--text-tertiary)';
												}}
												aria-label={`Remove ${role.label}`}
											>
												<Cross2Icon className="w-3 h-3" />
											</button>
										</span>
									))
								)}
							</div>
							<ChevronDownIcon
								className={`w-4 h-4 dark:text-gray-400 transition-transform shrink-0 ml-2 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
								style={{ color: 'var(--text-tertiary)' }}
							/>
						</div>
						{isDropdownOpen && (
							<div
								className="absolute top-full left-0 right-0 mt-1 dark:bg-gray-800 dark:border-gray-600 shadow-lg z-50 max-h-48 overflow-y-auto"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)',
									borderWidth: '1px',
									borderStyle: 'solid'
								}}
							>
								<div className="py-2">
									{availableRoles.map((role) => (
										<label
											key={role.id}
											className="flex items-center gap-3 px-4 py-2 dark:hover:bg-gray-700 cursor-pointer"
											style={{ backgroundColor: 'transparent' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'transparent';
											}}
										>
											<Checkbox
												checked={selectedRoles.includes(role.id)}
												onChange={() => handleRoleToggle(role.id)}
												size="medium"
											/>
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{role.label}
											</span>
										</label>
									))}
								</div>
							</div>
						)}
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
						onClick={handleSave}
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ModulePermissionModal;

