'use client';

import React from 'react';
import HeroBadge from './HeroBadge';
import SectionTitle from './SectionTitle';
import SectionSubtitle from './SectionSubtitle';
import { plusJakartaStyle } from '@/components/Options';
import Image from 'next/image';

export interface IndustryItem {
	title: string;
	description: string;
	iconSrc: string;
}

interface IndustriesSectionProps {
	items: IndustryItem[];
}

const IndustriesSection: React.FC<IndustriesSectionProps> = ({ items }) => {
	return (
		<section id="industries" className="space-y-8 px-6 py-16 md:px-45 bg-[#ffffff] ">
			<div className="space-y-3 text-center flex flex-col items-center justify-center">
				<HeroBadge iconSrc="" label="Use Cases" />
				<SectionTitle title="Built for Every Industry" />
				<SectionSubtitle subtitle="Our customizable CRM adapts to your unique business needs across various sectors." />
			</div>
			<div className="flex flex-wrap gap-6 justify-center items-center">
				{items.map((industry) => (
					<div
						key={industry.title}
						className="box-border w-full sm:w-[302px] bg-white border border-[#F3F4F6] rounded-[14px] p-6">
						<Image src={industry.iconSrc} alt={industry.title} width={48} height={48} className="mb-4" />
						<h3 className="font-[Plus-Jakarta-Sans] font-semibold text-[20px] leading-[28px] flex items-center text-[#050711] mb-4" style={plusJakartaStyle} >{industry.title}</h3>
						<p className="font-normal text-[12px] md:text-[14px] leading-[26px] flex items-center text-[#4A5565]"
							style={plusJakartaStyle}>{industry.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default IndustriesSection;
