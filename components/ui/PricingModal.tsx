'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import Button from './Button';
import BillingToggle from './BillingToggle';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

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
	const router = useRouter();
	const { lineOfBusinessData } = useLineOfBusiness();
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const secondaryColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';

	const plans: PricingPlan[] = [
		{
			id: 'free',
			name: 'Free',
			description: 'Perfect for getting started',
			monthlyPrice: 0,
			annualPrice: 0,
			features: [
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
			monthlyPrice: 12000,
			annualPrice: 120000,
			popular: true,
			features: [
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
			monthlyPrice: 25000,
			annualPrice: 250000,
			features: [
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



	const getDisplayPrice = (plan: PricingPlan) => {
		if (plan.monthlyPrice === 0) return 'Free';
		const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
		return `₦${price}${billingCycle === 'annual' ? '/year' : '/month'}`;
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
			<div className="p-8 h-full overflow-y-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
				{/* Header */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Choose Your Plan</h2>
					<p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>Select the perfect plan for your needs</p>

					<BillingToggle
						billingCycle={billingCycle}
						onChange={setBillingCycle}
						primaryColor={primaryColor}
					/>
				</div>

				{/* Pricing Cards */}
				<div className="flex flex-col md:flex-row gap-6 mb-8">
					{plans.map((plan) => {
						return (
							<div
								key={plan.id}
								className={`relative border-2 p-6 transition-all duration-300 flex-1 flex flex-col cursor-pointer ${plan.popular ? 'shadow-md' : ''
									} hover:shadow-lg hover:scale-105 hover:-translate-y-1`}
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: plan.popular ? primaryColor : 'var(--light-gray)'
								}}
								onMouseEnter={(e) => {
									if (!plan.popular) {
										e.currentTarget.style.borderColor = secondaryColor;
									}
								}}
								onMouseLeave={(e) => {
									if (!plan.popular) {
										e.currentTarget.style.borderColor = 'var(--light-gray)';
									}
								}}
							>

								{/* Plan Header */}
								<div className="mb-5">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-[14px] md:text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
										{plan.popular && (
											<span
												className="text-[8px] md:text-[10px] font-semibold px-3 py-1 rounded-full text-white"
												style={{ backgroundColor: primaryColor }}
											>
												Most Popular
											</span>
										)}
									</div>
									<p className="text-[10px] md:text-[12px] mb-4" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
									<div className="flex items-baseline gap-2 mb-3">
										<span className="text-[20px] md:text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
											{getDisplayPrice(plan)}
										</span>
										{/* {billingCycle === 'annual' && savings && (
											<span className="text-[10px] md:text-[12px] font-medium" style={{ color: secondaryColor }}>
												{savings}
											</span>
										)} */}
									</div>
								</div>

								{/* Features */}
								<ul className="space-y-3 mb-6 grow">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-3">
											<CheckIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
											<span className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
										</li>
									))}
									{plan.limitations?.map((limitation, index) => (
										<li key={index} className="flex items-start gap-3">
											<Cross2Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
											<span className="text-[10px] md:text-[12px] line-through" style={{ color: 'var(--text-tertiary)' }}>{limitation}</span>
										</li>
									))}
								</ul>

								{/* CTA Button */}
								<div className="mt-auto">
									<Button
										variant={plan.popular ? 'primary' : 'outline'}
										size="md"
										fullWidth
										className={`font-lato not-italic font-semibold text-[10px] md:text-[12px] leading-[150%] !dark:text-gray-100 cursor-pointer `}
										// style={{ color: 'var(--text-primary)' }}
										onClick={() => handleSelectPlan(plan.id)}
									// style={plan.popular ? { backgroundColor: primaryColor } : undefined}
									>
										{plan.monthlyPrice === 0 ? 'Get Started' : 'Get Started'}
									</Button>
								</div>
							</div>
						);
					})}
				</div>

				{/* Footer Note */}
				<div className="text-[10px] md:text-[12px] space-y-1" style={{ color: 'var(--text-tertiary)' }}>
					<p>All plans include a 14-day free trial. Cancel anytime.</p>
					<p>
						Need help choosing? <a href="#"
							className={`font-lato not-italic font-semibold text-[10px] md:text-[12px] leading-[150%] dark:text-gray-100 cursor-pointer hover:underline`}
							style={{ color: 'var(--text-primary)' }}
						> Contact sales</a>
					</p>
				</div>
			</div>
		</Modal>
	);
};

export default PricingModal;

