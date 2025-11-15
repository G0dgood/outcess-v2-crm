'use client';

import React from 'react';
import { plusJakartaStyle } from '@/components/Options';

interface SectionTitleProps {
	title: string;
	className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, className = '' }) => {
	return (
		<h2
			className={`font-[Plus-Jakarta-Sans] font-bold text-[48px] leading-[48px] flex items-center text-center text-[#050711] ${className}`}
			style={plusJakartaStyle}
		>
			{title}
		</h2>
	);
};

export default SectionTitle;

