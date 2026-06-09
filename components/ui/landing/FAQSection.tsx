'use client';

import React, { useState } from 'react';
import HeroBadge from './HeroBadge';
import SectionTitle from './SectionTitle';
import SectionSubtitle from './SectionSubtitle';
import Image from 'next/image';
import { plusJakartaStyle } from '@/components/Options';

export interface FAQItem {
	question: string;
	answer: string;
}

interface FAQSectionProps {
	items: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
	const [activeIndex, setActiveIndex] = useState<number | null>(0);

	const handleToggle = (index: number) => {
		setActiveIndex((prev) => (prev === index ? null : index));
	};

	return (
		<section id="faqs" className="space-y-8 p-[64px_80px] px-6 md:px-45 bg-[#ffffff]">
			<div className="space-y-3 text-center flex flex-col items-center justify-center">
				<HeroBadge iconSrc="" label="FAQS" />
				<SectionTitle title="Frequently Asked Questions" />
				<SectionSubtitle subtitle="Answers to common questions about our call center CRM software." />
			</div>
			<div
				className={`space-y-4 flex flex-col items-center justify-center rounded-[32px] p-6 transition-colors duration-500 `}
			>
				{items.map((faq, index) => {
					const isActive = activeIndex === index;
					return (
						<div
							key={faq.question}
							className={`w-full max-w-[768px] rounded-2xl border transition-all duration-500 ${isActive ? 'bg-[#6C8B7D] border-transparent ' : 'bg-surface border-transparent'
								}`}
						>
							<button
								type="button"
								className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
								onClick={() => handleToggle(index)}
								aria-expanded={isActive}
							>
								<h3
									className={`font-semibold text-[20px] leading-[28px] flex-1 ${isActive ? 'text-[#050711]' : 'text-[#0F172A]'
										}`}
									style={plusJakartaStyle}
								>
									{faq.question}
								</h3>
								<span className="shrink-0">
									<Image
										src={isActive ? '/logo/minus-outline.svg' : '/logo/plus.svg'}
										alt={isActive ? 'Collapse answer' : 'Expand answer'}
										width={24}
										height={24}
									/>
								</span>
							</button>
							{isActive && (
								<div className="px-6 pb-6">
									<p
										className="font-normal text-[12px] md:text-[14px] leading-[24px] text-[#4A5565]"
										style={plusJakartaStyle}
									>
										{faq.answer}
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default FAQSection;

