'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { Cross2Icon } from '@radix-ui/react-icons';

interface RenameModuleModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
	currentName: string;
}

export const RenameModuleModal: React.FC<RenameModuleModalProps> = ({
	isOpen,
	onClose,
	onSave,
	currentName,
}) => {
	const [moduleName, setModuleName] = useState(currentName);

	useEffect(() => {
		if (isOpen) {
			setModuleName(currentName);
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
	}, [isOpen, currentName, onClose]);

	const handleSave = () => {
		if (moduleName.trim()) {
			onSave(moduleName.trim());
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 overflow-hidden flex flex-col"
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
						Rename Module
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full"
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
				<div className="flex-1 p-6">
					<Input
						label="Module Name"
						placeholder="Enter module name"
						value={moduleName}
						onChange={setModuleName}
						required
					/>
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
						disabled={!moduleName.trim()}
					>
						Save
					</Button>
				</div>
			</div>
		</div>
	);
};

export default RenameModuleModal;

