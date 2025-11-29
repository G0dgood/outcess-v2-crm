'use client';

import React from 'react';
import Button from './Button';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface DeleteUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	userName?: string;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	userName = 'this user',
}) => {
	if (!isOpen) return null;

	const handleDelete = () => {
		onConfirm();
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				<div className="p-6">
					{/* Title */}
					<h2
						className="font-lato font-medium text-[16px] leading-[150%] dark:text-gray-100 mb-5"
						style={{ color: 'var(--text-primary)' }}
					>
                    Are you sure you want to delete {userName} from the CRM?
					</h2>

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
							The user will be permanently deleted from the account.
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
							Delete User
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DeleteUserModal;
