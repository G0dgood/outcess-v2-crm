'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface LogoutConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isLoading?: boolean;
	initials?: string;
	status?: string;
	statusColor?: string;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	isLoading = false,
	initials = 'U',
	status = 'Online',
	statusColor = '#22C55E',
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Sign Out"
			size="sm"
		>
			<div className="p-8 text-center">
				<div className="relative inline-block mb-6">
					<div
						className="w-20 h-20 rounded-full flex items-center justify-center text-[24px] font-bold shadow-lg"
						style={{
							backgroundColor: 'var(--primary)',
							color: 'var(--primary-foreground)',
						}}
					>
						{initials}
					</div>
					<div
						className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
						style={{ backgroundColor: statusColor }}
						title={status}
					/>
				</div>

				<h3
					className="text-[18px] md:text-[20px] font-semibold mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Sign Out
				</h3>
				<p
					className="text-[14px] md:text-[15px] mb-8"
					style={{ color: 'var(--text-secondary)' }}
				>
					You are currently <span className="font-semibold" style={{ color: statusColor }}>{status}</span>. Are you sure you want to sign out?
				</p>

				<div className="flex flex-col gap-3">
					<Button
						variant="primary"
						fullWidth
						onClick={onConfirm}
						loading={isLoading}
						className="rounded-[var(--radius)] h-12 text-[14px] font-semibold"
					>
						Yes, Sign Out
					</Button>
					<Button
						variant="ghost"
						fullWidth
						onClick={onClose}
						disabled={isLoading}
						className="rounded-[var(--radius)] h-12 text-[14px] font-medium"
						style={{ color: 'var(--text-tertiary)' }}
					>
						No, Stay Logged In
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default LogoutConfirmationModal;
