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
			<div className="bg-white shadow-lg w-full max-w-md mx-4  overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900">Rename Module</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
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

