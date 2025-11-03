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
			<div className="bg-white  shadow-lg w-full max-w-md mx-4">
				<div className="p-6">
					{/* Title */}
					<h2 className="font-lato font-medium text-[16px] leading-[150%] text-[#3A4050] mb-5">
						Are you sure you want to delete this user from the CRM?
					</h2>

					{/* Warning Message */}
					<div className="mb-6 p-4 bg-orange-50 border border-orange-200  flex items-start gap-3">
						<div className="shrink-0 mt-0.5">
							<ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
						</div>
						<div className="font-lato font-normal text-[13px] leading-[150%] text-[#E17E2F]">
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

