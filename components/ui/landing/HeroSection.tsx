'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { plusJakartaStyle } from '@/components/Options';
import HeroBadge from './HeroBadge';

interface HeroSectionProps {
	agents: string[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ agents }) => {

	return (
		<section className="flex flex-col gap-12 md:flex-row md:items-center md:gap-16 px-6 md:px-45 pt-45 pb-18">
			<div className="w-full md:w-1/2">
				<HeroBadge iconSrc="/logo/lighting.svg" label="Trusted by 100+ Call Centers" />

				<h1
					className="mt-4 text-primary font-bold text-[34px] leading-[1.15] sm:text-[48px] sm:leading-[1.1] lg:text-[72px] lg:leading-[1.05] text-[#050711]"
					style={plusJakartaStyle}
				>
					<span className="inline md:block">Customizable</span>{' '}
					<span className="inline md:block">CRM Built for Call</span>{' '}
					<span className="inline md:block">Centers</span>
				</h1>
				<p className="font-normal text-[16px] leading-[24px] sm:text-[20px] sm:leading-[32px] flex items-center text-[#4A5565] mt-6 sm:pr-16" style={plusJakartaStyle}>
					Streamline operations, boost agent productivity, and deliver exceptional customer experiences in one seamless CRM platform
					designed for busy call center teams.
				</p>
				<div className="mt-8 flex flex-col gap-4 sm:flex-row">
					<Link
						href="/signup"
						className="flex flex-row justify-center items-center px-[16px] py-[12px] gap-[8px] h-[48px] bg-[#050711] font-[Plus-Jakarta-Sans] font-medium text-[14px] leading-[20px] text-center text-white" style={plusJakartaStyle}>
						Start Free 14-Day Trial
						<Image src="/logo/margin.svg" alt="Arrow Right" width={20} height={20} />
					</Link>
					<Link
						href="/demo"
						className="box-border flex flex-row justify-center items-center px-[16px] py-[12px] gap-[8px] h-[48px] bg-white border border-[#050711] font-[Plus-Jakarta-Sans] font-medium text-[14px] leading-[20px] text-center text-[#050711]" style={plusJakartaStyle}>
						<Image src="/logo/play.svg" alt="Play" width={16} height={16} />
						Schedule Demo
					</Link>
				</div>
				<div className="mt-10 flex items-center gap-2 text-sm text-tertiary">
					<div className="flex flex-row items-center gap-2 font-normal text-[16px] leading-[24px] text-[#4A5565]">
						<Image src="/logo/circleCheck.svg" alt="Check" width={16} height={16} />
						No credit card required.
					</div>
					<div className="flex flex-row items-center gap-2 font-normal text-[16px] leading-[24px] text-[#4A5565]">
						<Image src="/logo/circleCheck.svg" alt="Check" width={16} height={16} />
						Cancel anytime.
					</div>
				</div>
			</div>
			<div className="w-full md:w-1/2 flex justify-center md:justify-end">
				<Image src="/logo/callCenter.svg" alt="Hero Section" width={616} height={500} className="w-full h-auto md:h-full object-cover" />
			</div>
		</section>
	);
};

export default HeroSection;
