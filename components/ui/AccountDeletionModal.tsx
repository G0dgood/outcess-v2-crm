'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, TrashIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';
import { useCampaign } from '@/contexts/CampaignContext';

interface AccountDeletionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (confirmationText: string) => void;
	username: string;
	isLoading?: boolean;
}

const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	username,
	isLoading = false,
}) => {
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#050711';

	const [confirmationInput, setConfirmationInput] = useState('');
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	const expectedText = `${username}/delete-account`;
	const isMatched = confirmationInput === expectedText;
	const canDelete = isMatched && agreedToTerms && !isLoading;

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setConfirmationInput('');
			setAgreedToTerms(false);
		}
	}, [isOpen]);

	const handleConfirm = () => {
		if (canDelete) {
			onConfirm(confirmationInput);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Delete Account & Workspace"
			size="lg"
		>
			<div className="p-6">
				{/* Danger Banner */}
				<div className="flex items-start gap-4 mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[var(--radius)]">
					<ExclamationTriangleIcon
						className="w-6 h-6 text-red-600 shrink-0 mt-0.5"
					/>
					<div>
						<h3 className="text-[14px] font-bold text-red-800 dark:text-red-400 mb-1">
							This action is permanent and irreversible
						</h3>
						<p className="text-[12px] text-red-700 dark:text-red-300">
							Deletions will purge all team members, dispositions, campaigns, settings, and your personal account data. Once started, this process cannot be stopped or undone.
						</p>
					</div>
				</div>

				<div className="space-y-6">
					{/* Terms Checkbox */}
					<div className="flex items-start space-x-3 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
						<div
							className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${agreedToTerms ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-red-400'
								}`}
						>
							{agreedToTerms && (
								<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							)}
						</div>
						<p className="text-[12px] text-gray-700 dark:text-gray-300 select-none">
							I have read and agree to the <span className="font-semibold underline">Terms and Conditions</span> for account deletion and understand that all data will be lost forever.
						</p>
					</div>

					{/* GitHub Style Deletion Confirmation */}
					<div className="space-y-3 pt-2">
						<p className="text-[12px] font-medium dark:text-gray-300" style={{ color: 'var(--text-secondary)' }}>
							To confirm, type <span className="font-bold text-red-600 dark:text-red-400 select-all">{expectedText}</span> in the box below:
						</p>
						<input
							type="text"
							value={confirmationInput}
							onChange={(e) => setConfirmationInput(e.target.value)}
							placeholder={expectedText}
							className="w-full p-3 text-[12px] rounded-[var(--radius)] border-2 transition-all outline-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
							style={{
								borderColor: isMatched ? '#10B981' : 'var(--light-gray)',
							}}
							disabled={isLoading}
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
						variant="danger"
						size="md"
						onClick={handleConfirm}
						disabled={!canDelete}
						loading={isLoading}
						style={{ borderRadius: 'var(--radius)' }}
						className="flex items-center gap-2"
					>
						<TrashIcon className="w-4 h-4" />
						Permanently Delete Account
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default AccountDeletionModal;
