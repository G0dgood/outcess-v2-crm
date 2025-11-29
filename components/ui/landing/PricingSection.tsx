'use client';

import React from 'react';
import Link from 'next/link';
import HeroBadge from './HeroBadge';
import SectionTitle from './SectionTitle';
import SectionSubtitle from './SectionSubtitle';
import { plusJakartaStyle } from '@/components/Options';
import Image from 'next/image';

export interface PricingTier {
	title: string;
	price: string;
	description: string;
	highlight: boolean;
	features: string[];
}

interface PricingSectionProps {
	tiers: PricingTier[];
}

const PricingSection: React.FC<PricingSectionProps> = ({ tiers }) => {
	return (
		<section id="pricing" className="space-y-8 px-6 py-16 md:px-45 bg-[#F9FAFB]">
			<div className="space-y-3 text-center flex flex-col items-center justify-center">
				<HeroBadge iconSrc="" label="Pricing" />
				<SectionTitle title="Simple, Transparent Pricing" />
				<SectionSubtitle subtitle="Choose the perfect plan for your team. All plans include a 14-day free trial with no credit card required." />
			</div>
			<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center items-stretch">
				{tiers.map((tier) => (
					<div
						key={tier.title}
						className={`box-border flex flex-col items-start p-[34px] gap-2 w-full bg-white border-2 border-[#F3F4F6] border-light bg-surface shadow-md ${tier.highlight ? 'shadow-soft' : ''
							}`}
					>
						<div className="space-y-2">
							<p className="font-['Plus_Jakarta_Sans'] not-italic font-bold text-[24px] leading-[32px] flex items-center text-[#050711]">
								{tier.title}
							</p>
							<p className="not-italic font-normal text-[14px] leading-[24px] flex items-center text-[#4A5565]" style={plusJakartaStyle}>{tier.description}</p>
							<h3 className="font-['Plus_Jakarta_Sans'] not-italic font-bold text-[32px] leading-[36px] sm:text-[48px] sm:leading-[48px] flex items-center text-[#050711]">{tier.price}</h3>
						</div>
						<Link
							href="/signup"
							className={`mt-8 inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold transition-transform ${tier.highlight
								? 'bg-[#050711] text-white hover:-translate-y-0.5'
								: 'border bg-[#6C8B7D] text-white  border-light hover:border-transparent hover:bg-muted'
								}`}
						>
							{tier.highlight ? 'Start Free Trial' : 'Talk to Sales'}
						</Link>
						<ul className="flex flex-1 flex-col gap-2 text-sm text-secondary">
							{tier.features.map((feature) => (
								<div key={feature} className="flex items-center gap-2">
									<div className="flex items-center gap-2 mt-2">
										<Image src="/logo/mark.svg" alt="mark" width={20} height={20} />
										<span className="not-italic font-normal text-[16px] leading-[24px] flex items-center text-[#364153]" style={plusJakartaStyle}>{feature}</span>
									</div>
								</div>
							))}
						</ul>

					</div>
				))}
			</div>
		</section>
	);
};

export default PricingSection;
