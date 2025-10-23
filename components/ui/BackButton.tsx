'use client';

import React from 'react';
import { colors } from '@/lib/colors';

interface BackButtonProps {
	onClick?: () => void;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
	onClick,
	className = '',
	size = 'md',
	disabled = false,
}) => {
	const sizeClasses = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10',
		lg: 'w-12 h-12',
	};

	const iconSizes = {
		sm: 16,
		md: 20,
		lg: 24,
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`
				${sizeClasses[size]}
				flex items-center justify-center
				bg-white border border-[#E5E7EB]
				hover:bg-[#F9FAFB] hover:border-[#6C8B7D]
				focus:outline-none focus:ring-2 focus:ring-[#6C8B7D] focus:ring-offset-2
				transition-all duration-200
				${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
				${className}
			`}
			aria-label="Go back"
		>
			<svg
				width={iconSizes[size]}
				height={iconSizes[size]}
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M19 12H5M12 19L5 12L12 5"
					stroke="#050711"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</button>
	);
};

export default BackButton;
