'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';
import { useTheme } from '@/contexts/ThemeContext';
import { useCampaign } from '@/contexts/CampaignContext';

interface DeactivateBusinessModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	businessName?: string;
}

const DeactivateBusinessModal: React.FC<DeactivateBusinessModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	businessName = 'Business',
}) => {
	const { campaignData } = useCampaign();
	const { isDarkMode } = useTheme();
	const primaryColor = campaignData?.primaryColor || '#050711';
	const [selectedReason, setSelectedReason] = useState<string>('');
	const [showConfirmation, setShowConfirmation] = useState(false);

	// Helper function to convert hex to rgba
	const hexToRgba = (hex: string, alpha: number): string => {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	const deactivationReasons = [
		{
			id: 'billing-issues',
			title: 'Billing Issues',
			description: 'Business has outstanding unpaid invoices or payment problems.',
		},
		{
			id: 'extended-inactivity',
			title: 'Extended Inactivity',
			description: 'No user activity for an extended period.',
		},
		{
			id: 'business-closure',
			title: 'Business Closure',
			description: 'Business has ceased operations or been dissolved.',
		},
		{
			id: 'other-reason',
			title: 'Other Reason',
			description: 'Reason not listed above.',
		},
	];

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedReason('');
			setShowConfirmation(false);
		}
	}, [isOpen]);

	const handleContinue = () => {
		if (selectedReason) {
			setShowConfirmation(true);
		}
	};

	const handleConfirm = () => {
		if (selectedReason) {
			onConfirm(selectedReason);
			setSelectedReason('');
			setShowConfirmation(false);
			onClose();
		}
	};

	const handleBack = () => {
		setShowConfirmation(false);
	};

	// Confirmation View
	if (showConfirmation) {
		return (
			<Modal
				isOpen={isOpen && showConfirmation}
				onClose={handleBack}
				title=""
				size="md"
				className="!bg-[rgba(251,146,60,0.1)] dark:bg-orange-900/30 !border-2 border-[rgba(251,146,60,0.3)] dark:border-orange-800"
				showCloseButton={false}
			>
				<div className="p-6">
					{/* Warning Icon and Message */}
					<div className="flex items-start gap-3 mb-6">
						<ExclamationTriangleIcon
							className="w-6 h-6 dark:text-orange-400 shrink-0 mt-0.5"
							style={{ color: '#F97316' }}
						/>
						<div>
							<h2
								className="text-[12px] md:text-[14px] font-bold dark:text-orange-400 mb-1"
								style={{ color: '#EA580C' }}
							>
								Confirm Business Deactivation
							</h2>
							<p
								className="text-[10px] md:text-[12px] dark:text-orange-400"
								style={{ color: '#EA580C' }}
							>
								You are about to deactivate: <span className="font-semibold">{businessName}</span>
							</p>
						</div>
					</div>

					{/* Footer */}
					<div
						className="flex items-center justify-end gap-3 pt-4 border-t dark:border-orange-800"
						style={{ borderColor: 'rgba(251, 146, 60, 0.3)' }}
					>
						<button
							onClick={handleBack}
							className="px-4 py-2 text-[10px] md:text-[12px] font-medium dark:text-orange-400 dark:hover:text-orange-300 transition-colors cursor-pointer"
							style={{ color: '#EA580C' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = '#C2410C';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = '#EA580C';
							}}
						>
							Cancel
						</button>
						<Button
							variant="danger"
							size="md"
							onClick={handleConfirm}
						>
							Deactivate
						</Button>
					</div>
				</div>
			</Modal>
		);
	}

	// Reason Selection View
	return (
		<Modal
			isOpen={isOpen && !showConfirmation}
			onClose={onClose}
			title="Business Deactivation"
			size="xl"
		>
			<div className="p-6">
				<p
					className="text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-4"
					style={{ color: 'var(--text-secondary)' }}
				>
					Why are you deactivating this business?
				</p>

				{/* Reason Options */}
				<div className="space-y-3 mb-6">
					{deactivationReasons.map((reason) => {
						const isSelected = selectedReason === reason.id;
						return (
							<button
								key={reason.id}
								onClick={() => setSelectedReason(reason.id)}
								className={`w-full text-left p-4 border-2 transition-all ${isSelected
									? ''
									: 'dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50'
									}`}
								style={
									isSelected
										? {
											borderColor: primaryColor,
											backgroundColor: isDarkMode ? hexToRgba(primaryColor, 0.3) : hexToRgba(primaryColor, 0.15),
										}
										: {
											borderColor: 'var(--light-gray)',
											backgroundColor: 'var(--accent-white)'
										}
								}
								onMouseEnter={(e) => {
									if (!isSelected) {
										e.currentTarget.style.borderColor = '#94A3B8';
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}
								}}
								onMouseLeave={(e) => {
									if (!isSelected) {
										e.currentTarget.style.borderColor = 'var(--light-gray)';
										e.currentTarget.style.backgroundColor = 'var(--accent-white)';
									}
								}}
							>
								<div className="flex items-start gap-3">
									<div
										className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? '' : 'dark:border-gray-600'
											}`}
										style={
											isSelected
												? {
													borderColor: primaryColor,
													backgroundColor: primaryColor,
												}
												: {
													borderColor: 'var(--light-gray)'
												}
										}
									>
										{isSelected && (
											<div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
										)}
									</div>
									<div className="flex-1">
										<h3
											className="text-[10px] md:text-[12px] font-semibold dark:text-gray-100 mb-1"
											style={{ color: 'var(--text-primary)' }}
										>
											{reason.title}
										</h3>
										<p
											className="text-[10px] md:text-[12px] dark:text-gray-400"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{reason.description}
										</p>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{/* Footer */}
				<div
					className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
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
						onClick={handleContinue}
						disabled={!selectedReason}
					>
						Continue
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default DeactivateBusinessModal;
