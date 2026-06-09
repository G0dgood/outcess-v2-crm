'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertCircle } from 'lucide-react';

interface UnsavedChangesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaveAndExit: () => Promise<void>;
	onBackWithoutSaving: () => void;
	isLoading?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
	isOpen,
	onClose,
	onSaveAndExit,
	onBackWithoutSaving,
	isLoading = false,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Unsaved Changes"
			size="sm"
		>
			<div className="p-8 text-center">
				<div className="flex justify-center mb-6">
					<div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
						<AlertCircle size={36} />
					</div>
				</div>

				<h3 
					className="text-[18px] md:text-[20px] font-semibold mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Wait, don&apos;t go yet!
				</h3>
				<p 
					className="text-[14px] md:text-[15px] mb-8"
					style={{ color: 'var(--text-secondary)' }}
				>
					You have unsaved changes on this step. How would you like to proceed?
				</p>

				<div className="flex flex-col gap-3">
					<Button
						variant="primary"
						fullWidth
						onClick={onSaveAndExit}
						loading={isLoading}
						className="rounded-[var(--radius)] h-12 text-[14px] font-semibold"
					>
						Save and exit
					</Button>
					<Button
						variant="outline"
						fullWidth
						onClick={onBackWithoutSaving}
						disabled={isLoading}
						className="rounded-[var(--radius)] h-12 text-[14px] font-medium border-rose-200 text-rose-500 hover:bg-rose-50"
					>
						Back without saving
					</Button>
					<Button
						variant="ghost"
						fullWidth
						onClick={onClose}
						disabled={isLoading}
						className="rounded-[var(--radius)] h-12 text-[14px] font-medium"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Cancel
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default UnsavedChangesModal;
