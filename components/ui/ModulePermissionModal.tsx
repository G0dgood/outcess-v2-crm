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
}

const roleOptions = [
	{ id: 'admin', label: 'Admin' },
	{ id: 'agent', label: 'Agent' },
	{ id: 'supervisor', label: 'Supervisor' },
];

export const ModulePermissionModal: React.FC<ModulePermissionModalProps> = ({
	isOpen,
	onClose,
	onSave,
	selectedRoles: initialSelectedRoles,
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

	const getSelectedRolesDisplay = () => {
		if (selectedRoles.length === 0) {
			return 'Select roles';
		}
		return selectedRoles.map(roleId => {
			const role = roleOptions.find(r => r.id === roleId);
			return role ? role.label : roleId;
		}).join(', ');
	};

	const getSharedToDisplay = () => {
		if (selectedRoles.length === roleOptions.length) {
			return 'All roles';
		}
		if (selectedRoles.length === 0) {
			return 'No roles selected';
		}
		return selectedRoles.map(roleId => {
			const role = roleOptions.find(r => r.id === roleId);
			return role ? role.label : roleId;
		}).join(', ');
	};

	if (!isOpen) return null;

	const selectedRoleLabels = selectedRoles.map(roleId => {
		const role = roleOptions.find(r => r.id === roleId);
		return { id: roleId, label: role ? role.label : roleId };
	});

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div className="bg-white shadow-lg w-full max-w-md mx-4 overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900">Module Permission</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 p-6 space-y-4">
					<p className="text-sm text-gray-600">
						Select the roles that should have access to the module.
					</p>

					<div ref={dropdownRef} className="relative">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Roles
						</label>
						<div
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="w-full px-3 py-2 border border-gray-300   bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors min-h-[42px] cursor-pointer"
						>
							<div className="flex flex-wrap gap-2 flex-1">
								{selectedRoleLabels.length === 0 ? (
									<span className="text-sm text-gray-500">Select roles</span>
								) : (
									selectedRoleLabels.map((role) => (
										<span
											key={role.id}
											className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300   text-sm text-gray-700"
										>
											{role.label}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleRemoveRole(role.id);
												}}
												className="hover:text-red-600 transition-colors"
												aria-label={`Remove ${role.label}`}
											>
												<Cross2Icon className="w-3 h-3" />
											</button>
										</span>
									))
								)}
							</div>
							<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform shrink-0 ml-2 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
						</div>
						{isDropdownOpen && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300   shadow-lg z-50 max-h-48 overflow-y-auto">
								<div className="py-2">
									{roleOptions.map((role) => (
										<label
											key={role.id}
											className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
										>
											<Checkbox
												checked={selectedRoles.includes(role.id)}
												onChange={() => handleRoleToggle(role.id)}
											/>
											<span className="text-sm text-gray-900">{role.label}</span>
										</label>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 p-6 border-t border-gray-200 shrink-0">
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

