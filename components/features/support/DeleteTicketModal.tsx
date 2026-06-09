import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DeleteTicketModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	ticketId: string;
	isLoading: boolean;
}

export const DeleteTicketModal: React.FC<DeleteTicketModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	ticketId,
	isLoading
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Confirm Deletion"
			size="sm"
		>
			<div className="p-6">
				<div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900/20">
					<AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
				</div>
				<div className="mt-4 text-center">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Delete Ticket?
					</h3>
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
						Are you sure you want to delete <span className="font-semibold">{ticketId}</span>?
						This action cannot be undone and all messages will be lost.
					</p>
				</div>
				<div className="flex gap-3 mt-8">
					<Button
						variant="ghost"
						className="flex-1 dark:text-gray-400 dark:hover:bg-gray-800"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						className="flex-1 bg-red-600 hover:bg-red-700 text-white"
						onClick={onConfirm}
						loading={isLoading}
					>
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	);
};
