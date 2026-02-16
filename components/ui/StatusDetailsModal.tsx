import React from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface StatusDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	loginStatus: string;
	status?: {
		status: string;
		color?: string;
		reason?: string;
	};
}

const StatusDetailsModal: React.FC<StatusDetailsModalProps> = ({
	isOpen,
	onClose,
	loginStatus,
	status,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Status Details"
			size="sm"
		>
			<div className="space-y-6 pt-4 px-4 pb-4 sm:px-6 sm:pb-6">
				<div
					className="flex items-center justify-between p-4  border dark:border-gray-700"
					style={{
						backgroundColor: 'var(--bg-primary)',
						borderColor: 'var(--light-gray)',
					}}
				>
					<span
						className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Current Status
					</span>
					<div className="flex items-center gap-3">
						{(status?.color || loginStatus === 'Logged In') && (
							<span
								className="w-3 h-3 rounded-full shadow-sm ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-transparent"
								style={{ backgroundColor: status?.color || '#22C55E' }}
							/>
						)}
						<span
							className="font-semibold text-base dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							{loginStatus}
						</span>
					</div>
				</div>

				<div className="space-y-2">
					<span
						className="text-[10px] md:text-[12px] font-medium dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Reason
					</span>
					<div
						className="p-4  border min-h-20 text-[10px] md:text-[12px] leading-relaxed dark:border-gray-700"
						style={{
							backgroundColor: 'var(--bg-primary)',
							borderColor: 'var(--light-gray)',
							color: 'var(--text-primary)',
						}}
					>
						{status?.reason ? (
							status.reason
						) : (
							<span className="italic opacity-60">No reason provided</span>
						)}
					</div>
				</div>

				<div className="flex justify-end pt-2">
					<Button
						variant="secondary"
						onClick={onClose}
						className="w-full sm:w-auto"
					>
						Close
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default StatusDetailsModal;

