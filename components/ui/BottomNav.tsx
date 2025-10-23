import React from 'react';
import Button from './Button';
import { colors } from '@/lib/colors';

interface BottomNavProps {
	onSave?: () => void;
	onBack?: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	buttonText?: string;
	backText?: string;
	showBack?: boolean;
	className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
	onSave,
	onBack,
	isLoading = false,
	disabled = false,
	buttonText = "Save & Continue",
	backText = "Back",
	showBack = true,
	className = '',
}) => {
	return (
		<div className={`bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between ${className}`}>
			{showBack && onBack && (
				<button
					type="button"
					onClick={onBack}
					disabled={isLoading}
					className="px-4 py-2 text-sm font-inter font-semibold border border-[#6C8B7D] text-[#6C8B7D] bg-transparent hover:bg-[#6C8B7D] hover:text-white hover:border-[#6C8B7D] focus:outline-none focus:ring-2 focus:ring-[#6C8B7D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
				>
					{backText}
				</button>
			)}
			{!showBack && <div />}
			<Button
				variant="primary"
				size="md"
				onClick={onSave}
				loading={isLoading}
				disabled={disabled || isLoading}
			>
				{buttonText}
			</Button>
		</div>
	);
};

export default BottomNav;
