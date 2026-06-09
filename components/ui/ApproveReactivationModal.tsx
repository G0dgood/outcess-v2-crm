'use client';

import React from 'react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import { Button } from './Button';
import { Modal } from './Modal';
import { useCampaign } from '@/contexts/CampaignContext';

interface ApproveReactivationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	userName: string;
	isLoading?: boolean;
	reactivationReason?: string;
}

export const ApproveReactivationModal: React.FC<ApproveReactivationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	userName,
	isLoading = false,
	reactivationReason,
}) => {
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#2563EB';

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title=""
			size="md"
			className="!bg-white dark:!bg-gray-900 !border-2 border-green-500 dark:border-green-600 shadow-2xl"
			showCloseButton={false}
		>
			<div className="p-8 text-center">
				<div className="flex flex-col items-center gap-4 mb-6">
					<div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
						<CheckCircledIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Approve Reactivation?
						</h2>
						<p className="text-gray-500 dark:text-gray-400 max-w-sm">
							You are about to reactivate the account for <span className="font-semibold text-gray-900 dark:text-white">{userName}</span>. This will restore their access to the platform immediately.
						</p>
					</div>
				</div>

				{reactivationReason && (
					<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-8 text-left border border-gray-100 dark:border-gray-700">
						<p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
							User&apos;s Reason for Request:
						</p>
						<p className="text-[14px] text-gray-700 dark:text-gray-300 italic">
							&quot;{reactivationReason}&quot;
						</p>
					</div>
				)}

				<div className="flex flex-col sm:flex-row items-center gap-3 w-full">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
						className="w-full order-2 sm:order-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={onConfirm}
						loading={isLoading}
						className="w-full order-1 sm:order-2 text-white"
						style={{ backgroundColor: primaryColor }}
					>
						Approve & Reactivate
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ApproveReactivationModal;
