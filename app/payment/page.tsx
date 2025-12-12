'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Checkbox from '@/components/ui/Checkbox';
import { useSetup } from '@/contexts/SetupContext';
import { SetupProvider } from '@/contexts/SetupContext';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

function PaymentPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { lineOfBusinessData } = useLineOfBusiness();

	const planName = searchParams.get('plan') || 'Pro';
	const planPrice = searchParams.get('price') || '$12/month';
	const billingCycle = (searchParams.get('billing') as 'monthly' | 'annual') || 'monthly';
	const planId = searchParams.get('planId') || 'pro';

	const [formData, setFormData] = useState({
		cardNumber: '',
		expiryDate: '',
		cvv: '',
		zipCode: '',
		country: 'US',
		isBusiness: false,
		paymentMethod: 'card' as 'card' | 'paypal',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isProcessing, setIsProcessing] = useState(false);
	const [showPromoCode, setShowPromoCode] = useState(false);
	const [promoCode, setPromoCode] = useState('');
	const [orderBillingCycle, setOrderBillingCycle] = useState<'monthly' | 'annual'>(billingCycle);

	// Extract numeric price for calculations
	const priceMatch = planPrice.match(/\$?(\d+)/);
	const basePrice = priceMatch ? parseInt(priceMatch[1]) : 12;
	const isAnnual = billingCycle === 'annual';
	const baseMonthlyPrice = isAnnual ? basePrice / 12 : basePrice;

	// Calculate price based on order billing cycle
	const orderPrice = orderBillingCycle === 'annual' ? Math.round(baseMonthlyPrice * 12 * 0.83) : baseMonthlyPrice;

	const primaryColor = lineOfBusinessData.primaryColor || '#9333EA';

	const countries = [
		{ value: 'US', label: 'United States' },
		{ value: 'CA', label: 'Canada' },
		{ value: 'GB', label: 'United Kingdom' },
		{ value: 'NG', label: 'Nigeria' },
		{ value: 'DE', label: 'Germany' },
		{ value: 'FR', label: 'France' },
		{ value: 'NL', label: 'Netherlands' },
		{ value: 'AU', label: 'Australia' },
	];

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
		if (formData.paymentMethod === 'card') {
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
		}

		if (!formData.zipCode.trim()) {
			newErrors.zipCode = 'Zip code is required';
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			// Simulate payment processing
			setTimeout(() => {
				setIsProcessing(false);
				console.log('Payment successful for plan:', planId);
				router.push('/login?payment=success');
			}, 2000);
		} else {
			setIsProcessing(false);
		}
	};


	return (
		<div className="min-h-screen bg-white overflow-y-auto">
			{/* Main Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Two Column Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
					{/* Left Column - Payment Form */}
					<div className="lg:col-span-2">
						<h2 className="text-3xl font-bold text-gray-900 mb-8">Choose how to pay</h2>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Payment Methods */}
							<div className="space-y-4">
								{/* Card Payment Option */}
								<div
									className={`border-2  p-6 transition-all cursor-pointer relative ${formData.paymentMethod === 'card' ? '' : 'border-gray-200 hover:border-gray-300'}`}
									style={formData.paymentMethod === 'card' ? { borderColor: primaryColor } : {}}
								>
									<button
										type="button"
										onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
										className="absolute inset-0 w-full h-full z-10"
										aria-label="Select card payment"
									/>
									<div className="flex items-center justify-between mb-4 relative z-0 pointer-events-none">
										<div className="flex items-center gap-3">
											<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
											</svg>
											<span className="text-lg font-semibold text-gray-900">Card</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-400 font-medium">VISA</span>
											<span className="text-xs text-gray-400 font-medium">MC</span>
											<span className="text-xs text-gray-400 font-medium">AMEX</span>
										</div>
									</div>

									{formData.paymentMethod === 'card' && (
										<div className="space-y-4 relative z-0 pointer-events-auto">
											<div>
												<Input
													label="Card number"
													placeholder="1234 5678 9012 3456"
													type="text"
													value={formData.cardNumber}
													onChange={handleInputChange('cardNumber')}
													required
													error={errors.cardNumber}
												/>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<Input
														label="Expiration date"
														placeholder="MM/YY"
														type="text"
														value={formData.expiryDate}
														onChange={handleInputChange('expiryDate')}
														required
														error={errors.expiryDate}
													/>
												</div>
												<div>
													<div className="flex items-center gap-2">
														<div className="flex-1">
															<Input
																label="Security code"
																placeholder="123"
																type="text"
																value={formData.cvv}
																onChange={handleInputChange('cvv')}
																required
																error={errors.cvv}
															/>
														</div>
														<div className="pt-8">
															<div className="w-10 h-6 border border-gray-300 text-xs flex items-center justify-center text-gray-500">
																123
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* PayPal Payment Option */}
								<div
									className={`border-2 p-6 transition-all cursor-pointer relative ${formData.paymentMethod === 'paypal' ? '' : 'border-gray-200 hover:border-gray-300'}`}
									style={formData.paymentMethod === 'paypal' ? { borderColor: primaryColor } : {}}
								>
									<button
										type="button"
										onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
										className="absolute inset-0 w-full h-full z-10"
										aria-label="Select PayPal payment"
									/>
									<div className="flex items-center justify-between relative z-0 pointer-events-none">
										<div className="flex items-center gap-3">
											<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
												<path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 7.291-10.125 7.291H9.95c-.315 0-.588.19-.692.477l-1.533 4.569a1.035 1.035 0 01-.98.714l-3.38-.02a.813.813 0 01-.73-.456l-1.125-2.639a.723.723 0 00-.677-.45H.49a.49.49 0 01-.49-.49c0-.258.21-.49.49-.49h2.586c.315 0 .588-.19.692-.477l.423-1.266c.287-.86.978-1.465 1.844-1.465h6.16c3.528 0 6.226-1.456 7.11-4.18.538-1.682.441-3.177-.28-4.39-.72-1.213-2.11-1.82-4.165-1.82H7.998c-.524 0-.972.382-1.054.901L5.47 20.597h1.606z" />
											</svg>
											<span className="text-lg font-semibold text-gray-900">PayPal</span>
										</div>
									</div>
								</div>
							</div>

							{/* Billing Address */}
							<div className="grid grid-cols-2 gap-4">
								<Input
									label="Zip code"
									placeholder="12345"
									type="text"
									value={formData.zipCode}
									onChange={handleInputChange('zipCode')}
									required
									error={errors.zipCode}
								/>
								<Dropdown
									label="Country"
									options={countries}
									value={formData.country}
									onChange={(value) => setFormData(prev => ({ ...prev, country: Array.isArray(value) ? value[0] : value }))}
								/>
							</div>

							{/* Business Purchase Checkbox */}
							<Checkbox
								checked={formData.isBusiness}
								onChange={(checked) => setFormData(prev => ({ ...prev, isBusiness: checked }))}
								label="I am purchasing for a business."
								size="small"
							/>

							{/* Legal Text */}
							<div className="space-y-3 text-sm text-gray-600">
								<p>
									By purchasing a plan you agree that you have read, understand and agree to be bound by the{' '}
									<a href="#" className="underline hover:opacity-80" style={{ color: primaryColor }}>Terms of Service</a> and{' '}
									<a href="#" className="underline hover:opacity-80" style={{ color: primaryColor }}>Privacy Statement</a>.
								</p>
								<p>
									After the first {orderBillingCycle === 'annual' ? 'year' : 'month'}, your subscription will renew and your payment method will be charged{' '}
									<span className="font-semibold">US${orderPrice}</span> unless you cancel. You can cancel anytime through your account settings.
								</p>
							</div>

							{/* Submit Button */}
							<Button
								type="submit"
								variant="primary"
								fullWidth
								size="lg"
								loading={isProcessing}
								disabled={isProcessing}
								style={{ backgroundColor: primaryColor }}
							>
								{isProcessing ? 'Processing...' : `Purchase ${planName}`}
							</Button>
						</form>
					</div>

					{/* Right Column - Order Summary */}
					<div className="lg:col-span-1">
						<div className="lg:sticky lg:top-8">
							<h3 className="text-sm font-medium text-gray-700 mb-4">Your plan</h3>

							<div className="bg-white border border-gray-200 p-6 space-y-4">
								{/* Plan Name */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<h4 className="text-2xl font-bold text-gray-900">{planName}</h4>
										<ChevronDownIcon className="w-5 h-5 text-gray-400" />
									</div>
									<p className="text-sm text-gray-600">{lineOfBusinessData.companyName || ''} workspace</p>
								</div>

								{/* Billing Cycle */}
								<button
									type="button"
									onClick={() => setOrderBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
									className="flex items-center justify-between w-full py-3 border-t border-gray-200 hover:bg-gray-50 transition-colors"
								>
									<span className="text-sm text-gray-600">Billing cycle</span>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-gray-900 capitalize">{orderBillingCycle}</span>
										<ChevronDownIcon className="w-4 h-4 text-gray-400" />
									</div>
								</button>

								{/* Price Breakdown */}
								<div className="flex items-center justify-between py-3 border-t border-gray-200">
									<span className="text-sm text-gray-600">
										US${orderPrice} x {orderBillingCycle === 'annual' ? '1 year' : '1 month'}
									</span>
									<span className="text-sm font-medium text-gray-900">US${orderPrice}</span>
								</div>

								{/* Promo Code */}
								<div className="flex items-center justify-between py-3 border-t border-gray-200">
									<span className="text-sm text-gray-600">Promo code</span>
									{!showPromoCode ? (
										<button
											type="button"
											onClick={() => setShowPromoCode(true)}
											className="text-sm font-medium hover:underline"
											style={{ color: primaryColor }}
										>
											Add
										</button>
									) : (
										<div className="flex items-center gap-2">
											<input
												type="text"
												value={promoCode}
												onChange={(e) => setPromoCode(e.target.value)}
												placeholder="Enter code"
												className="text-sm border border-gray-300 px-2 py-1 w-24"
											/>
											<button
												type="button"
												onClick={() => {
													setShowPromoCode(false);
													setPromoCode('');
												}}
												className="text-sm text-gray-600 hover:text-gray-900"
											>
												Cancel
											</button>
										</div>
									)}
								</div>

								{/* Total */}
								<div
									className="flex items-center justify-between pt-3 border-t-2"
									style={{ borderColor: primaryColor }}
								>
									<span className="text-sm font-medium text-gray-900">Today&apos;s total</span>
									<span
										className="text-2xl font-bold"
										style={{ color: primaryColor }}
									>
										US${orderPrice}
									</span>
								</div>

								{/* Savings Offer */}
								{orderBillingCycle === 'monthly' && (
									<div className="pt-4 border-t border-gray-200">
										<div
											className="flex items-start gap-2 p-3"
											style={{ backgroundColor: `${primaryColor}15` }}
										>
											<svg
												className="w-5 h-5 shrink-0 mt-0.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												style={{ color: primaryColor }}
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
											</svg>
											<p className="text-xs text-gray-700">
												Save 17% by{' '}
												<button
													type="button"
													onClick={() => setOrderBillingCycle('annual')}
													className="underline hover:text-gray-900"
													style={{ color: primaryColor }}
												>
													switching to yearly billing
												</button>
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PaymentPage() {
	return (
		<SetupProvider>
			<Suspense fallback={
				<div className="min-h-screen bg-white flex items-center justify-center">
					<div className="text-gray-600">Loading...</div>
				</div>
			}>
				<PaymentPageContent />
			</Suspense>
		</SetupProvider>
	);
}
