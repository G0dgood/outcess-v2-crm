'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';

interface BackButtonProps {
	onClick?: () => void;
	label?: string;
	className?: string;
	useCustomColor?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
	onClick,
	label = 'Back',
	className = '',
	useCustomColor = true,
}) => {
	const router = useRouter();
	const { setupData } = useSetup();
	const { isDarkMode } = useTheme();
	const primaryColor = setupData?.primaryColor || '#050711';

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			router.back();
		}
	};

	return (
		<button
			onClick={handleClick}
			className={`curson-pointer inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 ${useCustomColor
				? 'dark:text-gray-100' // Override dark mode to ensure visibility
				: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
				} ${className}`}
			style={useCustomColor ? {
				color: isDarkMode ? '#F3F4F6' : primaryColor, // Use light color in dark mode, custom color in light mode
			} : {}}
			onMouseEnter={(e) => {
				if (useCustomColor) {
					e.currentTarget.style.opacity = '0.8';
				}
			}}
			onMouseLeave={(e) => {
				if (useCustomColor) {
					e.currentTarget.style.opacity = '1';
					e.currentTarget.style.color = isDarkMode ? '#F3F4F6' : primaryColor;
				}
			}}
			aria-label={label}
		>
			<ArrowLeftIcon className="w-4 h-4" />
			<span>{label}</span>
		</button>
	);
};

export default BackButton;
