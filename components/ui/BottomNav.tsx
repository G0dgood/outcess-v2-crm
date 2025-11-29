import React from 'react';
import Button from './Button';

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
		<div
			id="footer"
			className={`dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 flex items-center justify-between ${className} w-full`}
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			{showBack && onBack && (
				<button
					type="button"
					onClick={onBack}
					disabled={isLoading}
					className="px-4 py-2 text-xs sm:text-sm font-inter font-semibold border dark:border-[#6C8B7D] dark:text-[#6C8B7D] bg-transparent dark:hover:bg-[#6C8B7D] dark:hover:text-white hover:border-[#6C8B7D] focus:outline-none focus:ring-2 focus:ring-[#6C8B7D] focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
					style={{
						borderColor: '#6C8B7D',
						color: '#6C8B7D'
					}}
					onMouseEnter={(e) => {
						if (!isLoading) {
							e.currentTarget.style.backgroundColor = '#6C8B7D';
							e.currentTarget.style.color = 'white';
						}
					}}
					onMouseLeave={(e) => {
						if (!isLoading) {
							e.currentTarget.style.backgroundColor = 'transparent';
							e.currentTarget.style.color = '#6C8B7D';
						}
					}}
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
				className="text-xs sm:text-sm"
			>
				{buttonText}
			</Button>
		</div>
	);
};

export default BottomNav;
