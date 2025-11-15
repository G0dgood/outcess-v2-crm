'use client';

import React from 'react';
import HeroBadge from './HeroBadge';
import SectionTitle from './SectionTitle';
import SectionSubtitle from './SectionSubtitle';
import Image from 'next/image';
import { plusJakartaStyle } from '@/components/Options';

export interface TestimonialItem {
	name: string;
	title: string;
	quote: string;
	iconSrc: string;
}

interface TestimonialsSectionProps {
	items: TestimonialItem[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ items }) => {
	return (
		<section id="testimonials" className="space-y-8 p-[64px_80px] px-6 md:px-45 bg-[#F9FAFB]">
			<div className="space-y-3 text-center flex flex-col items-center justify-center">
				<HeroBadge iconSrc="" label="Testimonials" />
				<SectionTitle title="Trusted by Industry Leaders" />
				<SectionSubtitle subtitle="See what our customers have to say about transforming their call center operations." />
			</div>
			<div className="grid gap-6 sm:grid-cols-3">
				{items.map((testimonial) => (
					<div key={testimonial.name} className="box-border flex flex-col justify-between items-start p-[33px] w-[405.33px] h-[250px] bg-white border border-[#F3F4F6] rounded-[16px]">
						<div>
							<div className="flex flex-wrap gap-2 items-center">
								<Image src={testimonial.iconSrc} alt={testimonial.name} width={25} height={25} className="mb-4" />
								<Image src={testimonial.iconSrc} alt={testimonial.name} width={25} height={25} className="mb-4" />
								<Image src={testimonial.iconSrc} alt={testimonial.name} width={25} height={25} className="mb-4" />
								<Image src={testimonial.iconSrc} alt={testimonial.name} width={25} height={25} className="mb-4" />
								<Image src={testimonial.iconSrc} alt={testimonial.name} width={25} height={25} className="mb-4" />
							</div>
							<p className="font-[Plus-Jakarta-Sans] italic font-normal text-[16px] leading-[26px] flex items-center text-[#364153]" style={plusJakartaStyle}>“{testimonial.quote.replace(/“|”/g, '')}”</p>
						</div>
						<div>
							<p className="font-semibold text-[16px] leading-[24px] flex items-center text-[#050711]" style={plusJakartaStyle}>{testimonial.name}</p>
							<p className="font-normal text-[14px] leading-[20px] flex items-center text-[#6A7282]" style={plusJakartaStyle}>{testimonial.title}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default TestimonialsSection;

