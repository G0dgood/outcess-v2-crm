'use client';

import React from 'react';
import Image from 'next/image';
import { plusJakartaStyle } from '@/components/Options';

interface HeroBadgeProps {
	iconSrc: string;
	label: string;
}

const HeroBadge: React.FC<HeroBadgeProps> = ({ iconSrc, label }) => {
	return (
		<div className="flex flex-row justify-center items-center gap-1 w-[201px] h-[22px]">
			<p
				className="font-medium text-[12px] leading-[16px] items-center text-center text-[#6C8B7D] box-border flex flex-row justify-center px-[9px] py-[3px] gap-[4px] w-auto h-[22px] bg-[rgba(108,139,125,0.1)] border border-[rgba(108,139,125,0.2)] rounded-[8px] whitespace-nowrap"
				style={plusJakartaStyle}
			>
				{iconSrc && (
					<Image src={iconSrc} alt={label} width={16} height={16} />
				)}
				{label}
			</p>
		</div>
	);
};

export default HeroBadge;

