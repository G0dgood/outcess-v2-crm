'use client';

import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';
import { useCampaign } from '@/contexts/CampaignContext';

interface ReactivationRequestModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	email: string;
	deactivationReason?: string;
	isLoading?: boolean;
}

const ReactivationRequestModal: React.FC<ReactivationRequestModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	email,
	deactivationReason,
	isLoading = false
}) => {
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#050711';
	const [reason, setReason] = useState<string>('');

	const handleSubmit = () => {
		if (reason.trim()) {
			onConfirm(reason);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Account Reactivation Request"
			size="lg"
		>
			<div className="p-6">
				{/* Warning Icon and Message */}
				<div className="flex items-start gap-4 mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-[var(--radius)]">
					<ExclamationTriangleIcon
						className="w-6 h-6 text-orange-500 shrink-0 mt-0.5"
					/>
					<div>
						<h3 className="text-[14px] font-bold text-orange-800 dark:text-orange-400 mb-1">
							Your account is currently deactivated
						</h3>
						<p className="text-[12px] text-orange-700 dark:text-orange-300">
							{deactivationReason
								? `Reason for deactivation: ${deactivationReason}`
								: "This account has been deactivated by the user or an administrator."}
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<p className="text-[12px] font-medium dark:text-gray-300 mb-2" style={{ color: 'var(--text-secondary)' }}>
							To reactivate your account, please provide a reason for the request. A Super Admin will review your request and notify you via email at <span className="font-semibold">{email}</span>.
						</p>
						<textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Please explain why you would like to reactivate your account..."
							className="w-full h-32 p-3 text-[12px] rounded-[var(--radius)] border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 transition-all resize-none"
							style={{
								borderColor: 'var(--light-gray)',
							}}
							onFocus={(e) => e.target.style.borderColor = primaryColor}
							onBlur={(e) => e.target.style.borderColor = 'var(--light-gray)'}
						/>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
						disabled={isLoading}
                        style={{ borderRadius: 'var(--radius)' }}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSubmit}
						disabled={!reason.trim() || isLoading}
						loading={isLoading}
						style={{ backgroundColor: primaryColor, borderRadius: 'var(--radius)' }}
					>
						Send Request
					</Button>
				</div>

			</div>
		</Modal>
	);
};

export default ReactivationRequestModal;
