'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SupportStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (status: string) => void;
	type: 'Resolve' | 'Close' | 'Reopen';
	lineOfBusinessData?: {
		primaryColor?: string;
	};
}

export const SupportStatusModal: React.FC<SupportStatusModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	type,
	lineOfBusinessData,
}) => {
	const config = {
		Resolve: {
			title: 'Resolve Ticket',
			confirmText: 'Yes, Resolve',
			description: 'Are you sure you want to mark this ticket as resolved? This action will notify the customer.',
			icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
			iconBg: 'bg-green-100 dark:bg-green-900/20',
			status: 'Resolved',
		},
		Close: {
			title: 'Close Ticket',
			confirmText: 'Yes, Close',
			description: 'Are you sure you want to close this ticket? It will be archived and no further updates may be allowed.',
			icon: <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
			iconBg: 'bg-red-100 dark:bg-red-900/20',
			status: 'Closed',
		},
		Reopen: {
			title: 'Reopen Ticket',
			confirmText: 'Yes, Reopen',
			description: 'Are you sure you want to reopen this ticket? It will be set back to In Progress status.',
			icon: <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
			iconBg: 'bg-blue-100 dark:bg-blue-900/20',
			status: 'In Progress',
		},
	};

	const current = config[type];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={current.title}
			size="sm"
		>
			<div className="p-6">
				<div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${current.iconBg}`}>
					{current.icon}
				</div>
				<h3 className="text-lg font-semibold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
					{current.title}?
				</h3>
				<p className="text-sm text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>
					{current.description}
				</p>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						className="flex-1"
						onClick={onClose}
					>
						No, Cancel
					</Button>
					<Button
						variant="primary"
						className="flex-1 text-white"
						style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
						onClick={() => onConfirm(current.status)}
					>
						{current.confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default SupportStatusModal;
