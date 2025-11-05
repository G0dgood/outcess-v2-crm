'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';

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
	const { setupData } = useSetup();
	const { isDarkMode } = useTheme();
	const primaryColor = setupData.primaryColor || '#050711';
	const [selectedReason, setSelectedReason] = useState<string>('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [selectedReasonLabel, setSelectedReasonLabel] = useState<string>('');

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
			setSelectedReasonLabel('');
		}
	}, [isOpen]);

	const handleContinue = () => {
		if (selectedReason) {
			const reason = deactivationReasons.find(r => r.id === selectedReason);
			setSelectedReasonLabel(reason?.title || '');
			setShowConfirmation(true);
		}
	};

	const handleConfirm = () => {
		if (selectedReason) {
			onConfirm(selectedReason);
			setSelectedReason('');
			setShowConfirmation(false);
			setSelectedReasonLabel('');
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
				className="bg-[#FFF8E1] dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-800"
				showCloseButton={false}
			>
				<div className="p-6">
					{/* Warning Icon and Message */}
					<div className="flex items-start gap-3 mb-6">
						<ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
						<div>
							<h2 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-1">
								Confirm Business Deactivation
							</h2>
							<p className="text-sm text-orange-600 dark:text-orange-400">
								You are about to deactivate: <span className="font-semibold">{businessName}</span>
							</p>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-orange-200 dark:border-orange-800">
						<button
							onClick={handleBack}
							className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
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
				<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
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
									: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
									}`}
								style={
									isSelected
										? {
											borderColor: primaryColor,
											backgroundColor: isDarkMode ? hexToRgba(primaryColor, 0.3) : hexToRgba(primaryColor, 0.15),
										}
										: undefined
								}
							>
								<div className="flex items-start gap-3">
									<div
										className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? '' : 'border-gray-300 dark:border-gray-600'
											}`}
										style={
											isSelected
												? {
													borderColor: primaryColor,
													backgroundColor: primaryColor,
												}
												: undefined
										}
									>
										{isSelected && (
											<div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
										)}
									</div>
									<div className="flex-1">
										<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
											{reason.title}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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

