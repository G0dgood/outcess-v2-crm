'use client';

import React, { useEffect } from 'react';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

interface DeleteStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	statusName: string;
	isLoading?: boolean;
}

export const DeleteStatusModal: React.FC<DeleteStatusModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	statusName,
	isLoading,
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
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 overflow-hidden flex flex-col rounded-[var(--radius)]"
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
						Delete Status
					</h2>
					<Button
						variant="ghost"
						size="sm"
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
					</Button>
				</div>

				{/* Content */}
				<div className="flex-1 p-6">
					<p
						className="text-[10px] md:text-[12px] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Are you sure you want to delete the <span
							className="font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>&apos;{statusName}&apos;</span> status? This action cannot be undone.
					</p>
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
						onClick={onConfirm}
						loading={isLoading}
						disabled={isLoading}
					>
						Delete Status
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DeleteStatusModal;
