'use client';

import { plusJakartaStyle } from '@/components/Options';
import React from 'react';

export interface StatItem {
	label: string;
	value: string;
}

interface StatsSectionProps {
	items: StatItem[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ items }) => {
	return (
		<section className="flex flex-row items-center justify-around p-[64px_80px] h-[208px] bg-[#050711] ">
			{items.map((stat) => (
				<div key={stat.label} className="text-center sm:text-left flex flex-col items-center justify-center">
					<p className="flex items-center text-center font-bold text-[48px] leading-[48px] text-white" style={plusJakartaStyle}>{stat.value}</p>
					<p className="mt-2 font-normal text-[16px] leading-[24px] flex 
					items-center text-center text-[#6C8B7D]" style={plusJakartaStyle}>{stat.label}</p>
				</div>
			))}
		</section>
	);
};

export default StatsSection;

