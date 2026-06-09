'use client';

import React from 'react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';
import { useCampaign } from '@/contexts/CampaignContext';

interface ActivateBusinessModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	businessName?: string;
	isLoading?: boolean;
}

const ActivateBusinessModal: React.FC<ActivateBusinessModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	businessName = 'Business',
	isLoading = false,
}) => {
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#2563EB';

	const handleConfirm = () => {
		onConfirm();
	};

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
				<div className="flex flex-col items-center gap-4 mb-8">
					<div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
						<CheckCircledIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
							Activate Business?
						</h2>
						<p className="text-gray-500 dark:text-gray-400 max-w-sm">
							You are about to reactivate <span className="font-semibold text-gray-900 dark:text-white">{businessName}</span>. This will restore access for all team members and resume all business operations.
						</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row items-center gap-3 w-full">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}
						className="w-full order-2 sm:order-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						No, Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleConfirm}
						loading={isLoading}
						className="w-full order-1 sm:order-2 text-white"
						style={{ backgroundColor: primaryColor }}
					>
						Yes, Activate Business
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ActivateBusinessModal;
