'use client';

import React from 'react';
import Button from './Button';

interface BillingToggleProps {
	billingCycle: 'monthly' | 'annual';
	onChange: (cycle: 'monthly' | 'annual') => void;
	primaryColor?: string;
	className?: string;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
	billingCycle,
	onChange,
	primaryColor = '#050711',
	className = '',
}) => {
	return (
		<div className={`inline-flex items-center p-1 ${className}`} style={{ backgroundColor: 'var(--light-gray)' }}>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onChange('monthly')}
				className={`px-6 py-2 font-medium transition-all ${billingCycle === 'monthly'
					? 'shadow-sm'
					: 'hover:opacity-80'
					}`}
				style={{
					backgroundColor: billingCycle === 'monthly' ? 'var(--accent-white)' : 'transparent',
					color: billingCycle === 'monthly' ? 'var(--text-primary)' : 'var(--text-tertiary)'
				}}
			>
				Monthly
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onChange('annual')}
				className={`px-6 py-2 font-medium transition-all relative ${billingCycle === 'annual'
					? 'shadow-sm'
					: 'hover:opacity-80'
					}`}
				style={{
					backgroundColor: billingCycle === 'annual' ? 'var(--accent-white)' : 'transparent',
					color: billingCycle === 'annual' ? 'var(--text-primary)' : 'var(--text-tertiary)'
				}}
			>
				Annual
				<span
					className="ml-2 text-[8px] md:text-[10px] text-white px-2 py-0.5 rounded-full"
					style={{ backgroundColor: primaryColor }}
				>
					Save 17%
				</span>
			</Button>
		</div>
	);
};

export default BillingToggle;
