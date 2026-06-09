'use client';

import React from 'react';
import HeroBadge from './HeroBadge';
import SectionTitle from './SectionTitle';
import SectionSubtitle from './SectionSubtitle';
import Image from 'next/image';
import { plusJakartaStyle } from '@/components/Options';

export interface FeatureItem {
	title: string;
	description: string;
	icon: string;
	iconSrc: string;
}

interface FeaturesSectionProps {
	items: FeatureItem[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ items }) => {
	return (
		<section id="features" className="px-6 py-16 md:px-45">
			<div className="space-y-4 text-center flex flex-col items-center justify-center">
				<HeroBadge iconSrc="" label="Features" />
				<SectionTitle title="Everything You Need to Manage Your Call Center" />
				<SectionSubtitle
					subtitle="Powerful, easy-to-use CRM modules that centralize customer data, optimize agent performance, and keep the strategic picture in view."
				/>
			</div>
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
				{items.map((feature) => (
					<div
						key={feature.title}
						className="flex h-full flex-col gap-3 rounded-2xl border border-light bg-surface p-6 transition-shadow hover:shadow-lg hover:shadow-soft"
					>
						<Image src={feature.iconSrc} alt={feature.title} width={40} height={40} />
						<h3 className="text-[12px] md:text-[14px] font-semibold text-primary">{feature.title}</h3>
						<p className="font-[Plus-Jakarta-Sans] font-normal text-[12px] md:text-[14px] leading-[26px] flex items-center text-[#4A5565]"
							style={plusJakartaStyle}>{feature.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default FeaturesSection;
