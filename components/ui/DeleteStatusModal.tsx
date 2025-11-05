'use client';

import React, { useEffect } from 'react';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DeleteStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	statusName: string;
}

export const DeleteStatusModal: React.FC<DeleteStatusModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	statusName,
}) => {
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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div className="bg-white dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 overflow-hidden flex flex-col">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Status</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 p-6">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Are you sure you want to delete the <span className="font-semibold text-gray-900 dark:text-gray-100">'{statusName}'</span> status? This action cannot be undone.
					</p>
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
						onClick={onConfirm}
					>
						Delete Status
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DeleteStatusModal;

