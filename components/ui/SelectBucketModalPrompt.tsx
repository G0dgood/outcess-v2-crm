'use client';

import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import Button from './Button';

interface SelectBucketModalPromptProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: () => void;
}

/**
 * A modal component to prompt the user to select a bucket.
 * Follows the custom modal pattern with manual backdrop and container.
 */
export const SelectBucketModalPrompt: React.FC<SelectBucketModalPromptProps> = ({
	isOpen,
	onClose,
	onSelect,
}) => {
	// Handle body scroll
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
				onClick={onClose} 
			/>
			
			{/* Modal Container */}
			<div 
				className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border dark:border-gray-800 animate-in fade-in zoom-in duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
					<h2 className="text-[16px] font-semibold dark:text-white" style={{ color: 'var(--text-primary)' }}>
						Configuration Required
					</h2>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={onClose} 
						className="p-2 h-auto rounded-full"
					>
						<X size={20} />
					</Button>
				</div>

				{/* Content */}
				<div className="p-10 flex flex-col items-center justify-center text-center">
					<div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-4">
						<Plus size={32} />
					</div>
					<h3 className="text-xl font-bold dark:text-white mb-2" style={{ color: 'var(--text-primary)' }}>
						Select a Bucket
					</h3>
					<p className="text-sm dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }}>
						Choose a bucket to start configuring its unique customer data fields. Each bucket can have its own set of fields.
					</p>
				</div>

				{/* Footer */}
				<div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={(e) => {
							e.stopPropagation();
							onSelect();
						}}
					>
						Select Bucket
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SelectBucketModalPrompt;


