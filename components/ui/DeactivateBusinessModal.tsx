'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Button from './Button';
import Modal from './Modal';

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
	const [selectedReason, setSelectedReason] = useState<string>('');
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [selectedReasonLabel, setSelectedReasonLabel] = useState<string>('');

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
				className="bg-[#FFF8E1] border-2 border-orange-300 rounded-lg"
				showCloseButton={false}
			>
				<div className="p-6">
					{/* Warning Icon and Message */}
					<div className="flex items-start gap-3 mb-6">
						<ExclamationTriangleIcon className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
						<div>
							<h2 className="text-lg font-bold text-orange-700 mb-1">
								Confirm Business Deactivation
							</h2>
							<p className="text-sm text-orange-600">
								You are about to deactivate: <span className="font-semibold">{businessName}</span>
							</p>
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-3 pt-4 border-t border-orange-200">
						<button
							onClick={handleBack}
							className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
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
				<p className="text-sm font-medium text-gray-700 mb-4">
					Why are you deactivating this business?
				</p>

				{/* Reason Options */}
				<div className="space-y-3 mb-6">
					{deactivationReasons.map((reason) => (
						<button
							key={reason.id}
							onClick={() => setSelectedReason(reason.id)}
							className={`w-full text-left p-4 border-2 rounded-lg transition-all ${selectedReason === reason.id
								? 'border-blue-600 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
								}`}
						>
							<div className="flex items-start gap-3">
								<div
									className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedReason === reason.id
										? 'border-blue-600 bg-blue-600'
										: 'border-gray-300'
										}`}
								>
									{selectedReason === reason.id && (
										<div className="w-2 h-2 bg-white rounded-full"></div>
									)}
								</div>
								<div className="flex-1">
									<h3 className="text-sm font-semibold text-gray-900 mb-1">
										{reason.title}
									</h3>
									<p className="text-sm text-gray-600">{reason.description}</p>
								</div>
							</div>
						</button>
					))}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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

