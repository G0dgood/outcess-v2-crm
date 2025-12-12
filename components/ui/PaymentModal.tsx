'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	planName: string;
	planPrice: string;
	billingCycle: 'monthly' | 'annual';
	onPaymentSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
	isOpen,
	onClose,
	planName,
	planPrice,
	billingCycle,
	onPaymentSuccess,
}) => {
	const [formData, setFormData] = useState({
		cardNumber: '',
		expiryDate: '',
		cvv: '',
		cardholderName: '',
		email: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isProcessing, setIsProcessing] = useState(false);

	const primaryColor = '#050711';

	const handleInputChange = (field: string) => (value: string) => {
		// Format card number
		if (field === 'cardNumber') {
			const cleaned = value.replace(/\s/g, '');
			if (cleaned.length <= 16) {
				const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
				setFormData(prev => ({ ...prev, [field]: formatted }));
			}
		}
		// Format expiry date
		else if (field === 'expiryDate') {
			const cleaned = value.replace(/\D/g, '');
			if (cleaned.length <= 4) {
				const formatted = cleaned.length > 2
					? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
					: cleaned;
				setFormData(prev => ({ ...prev, [field]: formatted }));
			}
		}
		// Format CVV (only numbers, max 4 digits)
		else if (field === 'cvv') {
			const cleaned = value.replace(/\D/g, '');
			if (cleaned.length <= 4) {
				setFormData(prev => ({ ...prev, [field]: cleaned }));
			}
		}
		else {
			setFormData(prev => ({ ...prev, [field]: value }));
		}

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsProcessing(true);

		const newErrors: Record<string, string> = {};

		// Validation
		const cardNumber = formData.cardNumber.replace(/\s/g, '');
		if (!cardNumber || cardNumber.length < 16) {
			newErrors.cardNumber = 'Please enter a valid card number';
		}

		if (!formData.expiryDate || formData.expiryDate.length < 5) {
			newErrors.expiryDate = 'Please enter a valid expiry date';
		}

		if (!formData.cvv || formData.cvv.length < 3) {
			newErrors.cvv = 'Please enter a valid CVV';
		}

		if (!formData.cardholderName.trim()) {
			newErrors.cardholderName = 'Cardholder name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			// Simulate payment processing
			setTimeout(() => {
				setIsProcessing(false);
				if (onPaymentSuccess) {
					onPaymentSuccess();
				}
				onClose();
				// Reset form
				setFormData({
					cardNumber: '',
					expiryDate: '',
					cvv: '',
					cardholderName: '',
					email: '',
				});
			}, 2000);
		} else {
			setIsProcessing(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md"
			showCloseButton={true}
			position="center"
		>
			<div className="p-6">
				{/* Header */}
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
					<div className="flex items-center gap-3 text-sm text-gray-600">
						<span className="font-medium">{planName} Plan</span>
						<span>•</span>
						<span>{planPrice}</span>
						<span>•</span>
						<span className="capitalize">{billingCycle} billing</span>
					</div>
				</div>

				{/* Payment Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Card Number */}
					<Input
						label="Card Number"
						placeholder="1234 5678 9012 3456"
						type="text"
						value={formData.cardNumber}
						onChange={handleInputChange('cardNumber')}
						required
						error={errors.cardNumber}
					/>

					{/* Expiry and CVV */}
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Expiry Date"
							placeholder="MM/YY"
							type="text"
							value={formData.expiryDate}
							onChange={handleInputChange('expiryDate')}
							required
							error={errors.expiryDate}
						/>
						<Input
							label="CVV"
							placeholder="123"
							type="text"
							value={formData.cvv}
							onChange={handleInputChange('cvv')}
							required
							error={errors.cvv}
						/>
					</div>

					{/* Cardholder Name */}
					<Input
						label="Cardholder Name"
						placeholder="John Doe"
						type="text"
						value={formData.cardholderName}
						onChange={handleInputChange('cardholderName')}
						required
						error={errors.cardholderName}
					/>

					{/* Email */}
					<Input
						label="Email"
						placeholder="you@company.com"
						type="email"
						value={formData.email}
						onChange={handleInputChange('email')}
						required
						error={errors.email}
					/>

					{/* Security Notice */}
					<div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
						<svg
							className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<p className="text-xs text-gray-600">
							Your payment information is encrypted and secure. We never store your full card details.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="danger"
							fullWidth
							onClick={onClose}
							disabled={isProcessing}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							fullWidth
							loading={isProcessing}
							disabled={isProcessing}
							style={{ backgroundColor: primaryColor }}
						>
							{isProcessing ? 'Processing...' : `Pay ${planPrice}`}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default PaymentModal;

