'use client';

import React from 'react';
import { plusJakartaStyle } from '@/components/Options';

interface SectionSubtitleProps {
	subtitle: React.ReactNode;
	className?: string;
}

const SectionSubtitle: React.FC<SectionSubtitleProps> = ({ subtitle, className = '' }) => (
	<p
		className={`mx-auto max-w-2xl text-secondary font-normal ${className}`}
		style={plusJakartaStyle}
	>
		{subtitle}
	</p>
);

export default SectionSubtitle;

