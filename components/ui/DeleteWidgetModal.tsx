'use client';

import React from 'react';
import Button from './Button';
import { Modal } from './Modal';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface DeleteWidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	widgetTitle?: string;
}

export const DeleteWidgetModal: React.FC<DeleteWidgetModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	widgetTitle = 'this widget',
}) => {
	const handleDelete = () => {
		onConfirm();
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Delete Widget"
			size="md"
		>
			<div className="p-6">
				{/* Warning Message */}
				<div
					className="mb-6 p-4 dark:bg-orange-900/30 border dark:border-orange-800 flex items-start gap-3 rounded"
					style={{
						backgroundColor: 'rgba(251, 146, 60, 0.1)',
						borderColor: 'rgba(251, 146, 60, 0.3)'
					}}
				>
					<div className="shrink-0 mt-0.5">
						<ExclamationTriangleIcon
							className="w-5 h-5 dark:text-orange-400"
							style={{ color: '#F97316' }}
						/>
					</div>
					<div
						className="font-lato font-normal text-[13px] leading-[150%] dark:text-orange-400"
						style={{ color: '#EA580C' }}
					>
                        Are you sure you want to delete <span className="font-semibold">&apos;{widgetTitle}&apos;</span>? This action cannot be undone.
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3">
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						size="md"
						onClick={handleDelete}
					>
						Delete Widget
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default DeleteWidgetModal;
