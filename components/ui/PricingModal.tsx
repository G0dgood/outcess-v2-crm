'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import Button from './Button';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';

interface PricingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectPlan?: (planId: string) => void;
}

interface PricingPlan {
	id: string;
	name: string;
	description: string;
	monthlyPrice: number;
	annualPrice: number;
	features: string[];
	limitations?: string[];
	popular?: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({
	isOpen,
	onClose,
	onSelectPlan,
}) => {
	const { setupData } = useSetup();
	const router = useRouter();
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

	const primaryColor = setupData.primaryColor || '#9333EA';
	const secondaryColor = setupData.secondaryColor || '#6C8B7D';

	const plans: PricingPlan[] = [
		{
			id: 'free',
			name: 'Free',
			description: 'Perfect for getting started',
			monthlyPrice: 0,
			annualPrice: 0,
			features: [
				'2GB storage',
				'Up to 3 users',
				'Basic features',
				'Email support',
			],
			limitations: [
				'Limited storage',
				'Basic analytics',
			],
		},
		{
			id: 'pro',
			name: 'Pro',
			description: 'For growing teams',
			monthlyPrice: 12,
			annualPrice: 120,
			popular: true,
			features: [
				'50GB storage',
				'Up to 25 users',
				'Advanced features',
				'Priority support',
				'Advanced analytics',
				'Custom branding',
				'API access',
			],
		},
		{
			id: 'business',
			name: 'Business',
			description: 'For larger organizations',
			monthlyPrice: 25,
			annualPrice: 250,
			features: [
				'Unlimited storage',
				'Unlimited users',
				'All Pro features',
				'Dedicated support',
				'Advanced security',
				'SSO integration',
				'Custom integrations',
				'Onboarding assistance',
			],
		},
	];

	const handleSelectPlan = (planId: string) => {
		const plan = plans.find(p => p.id === planId);
		if (plan) {
			const price = getDisplayPrice(plan);
			// Navigate to payment page with plan details
			const params = new URLSearchParams({
				plan: plan.name,
				price: price,
				billing: billingCycle,
				planId: plan.id,
			});
			router.push(`/payment?${params.toString()}`);
		}
		if (onSelectPlan) {
			onSelectPlan(planId);
		}
	};

	const formatPrice = (price: number) => {
		if (price === 0) return 'Free';
		return `$${price}`;
	};

	const getDisplayPrice = (plan: PricingPlan) => {
		if (plan.monthlyPrice === 0) return 'Free';
		const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
		return `$${price}${billingCycle === 'annual' ? '/year' : '/month'}`;
	};

	const getSavings = (plan: PricingPlan) => {
		if (plan.monthlyPrice === 0) return null;
		const monthlyTotal = plan.monthlyPrice * 12;
		const savings = monthlyTotal - plan.annualPrice;
		return savings > 0 ? `Save $${savings}/year` : null;
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="full"
			showCloseButton={true}
			position="right"
			className="max-w-4xl"
		>
			<div className="p-8 h-full overflow-y-auto">
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
					<p className="text-base text-gray-600 mb-6">Select the perfect plan for your needs</p>

					{/* Billing Toggle */}
					<div className="inline-flex items-center bg-gray-100 p-1">
						<button
							onClick={() => setBillingCycle('monthly')}
							className={`px-6 py-2   text-sm font-medium transition-all ${billingCycle === 'monthly'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'
								}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setBillingCycle('annual')}
							className={`px-6 py-2   text-sm font-medium transition-all relative ${billingCycle === 'annual'
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-600 hover:text-gray-900'
								}`}
						>
							Annual
							<span
								className="ml-2 text-xs text-white px-2 py-0.5 rounded-full"
								style={{ backgroundColor: primaryColor }}
							>
								Save 17%
							</span>
						</button>
					</div>
				</div>

				{/* Pricing Cards */}
				<div className="flex flex-col md:flex-row gap-6 mb-8">
					{plans.map((plan) => {
						const savings = getSavings(plan);
						return (
							<div
								key={plan.id}
								className={`relative bg-white border-2 p-6 transition-all duration-300 flex-1 flex flex-col cursor-pointer ${plan.popular ? 'shadow-md' : 'border-gray-200'
									} hover:shadow-lg hover:scale-105 hover:-translate-y-1`}
								style={plan.popular ? { borderColor: primaryColor } : undefined}
								onMouseEnter={(e) => {
									if (!plan.popular) {
										e.currentTarget.style.borderColor = secondaryColor;
									}
								}}
								onMouseLeave={(e) => {
									if (!plan.popular) {
										e.currentTarget.style.borderColor = '';
									}
								}}
							>

								{/* Plan Header */}
								<div className="mb-5">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
										{plan.popular && (
											<span
												className="text-xs font-semibold px-3 py-1 rounded-full text-white"
												style={{ backgroundColor: primaryColor }}
											>
												Most Popular
											</span>
										)}
									</div>
									<p className="text-gray-600 text-sm mb-4">{plan.description}</p>
									<div className="flex items-baseline gap-2 mb-3">
										<span className="text-3xl font-bold text-gray-900">
											{getDisplayPrice(plan)}
										</span>
										{billingCycle === 'annual' && savings && (
											<span className="text-sm font-medium" style={{ color: secondaryColor }}>
												{savings}
											</span>
										)}
									</div>
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-6 grow">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
											<span className="text-sm text-gray-700">{feature}</span>
										</li>
									))}
									{plan.limitations?.map((limitation, index) => (
										<li key={index} className="flex items-start gap-3">
											<Cross2Icon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
											<span className="text-sm text-gray-400 line-through">{limitation}</span>
										</li>
									))}
								</ul>

								{/* CTA Button */}
								<div className="mt-auto">
									<Button
										variant={plan.popular ? 'primary' : 'outline'}
										size="md"
										fullWidth
										onClick={() => handleSelectPlan(plan.id)}
										style={plan.popular ? { backgroundColor: primaryColor } : undefined}
									>
										{plan.monthlyPrice === 0 ? 'Get Started' : 'Get Started'}
									</Button>
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer Note */}
				<div className="text-sm text-gray-500 space-y-1">
					<p>All plans include a 14-day free trial. Cancel anytime.</p>
					<p>
						Need help choosing? <a href="#" className="hover:underline" style={{ color: primaryColor }}>Contact sales</a>
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default PricingModal;

