import React from 'react';

interface ButtonProps {
	children: React.ReactNode;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'muted-sage-green' | 'muted-sage-green-outline';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	className?: string;
	style?: React.CSSProperties;
	icon?: React.ReactNode;
	iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	fullWidth = false,
	onClick,
	type = 'button',
	className = '',
	style,
	icon,
	iconPosition = 'left',
}) => {
	const baseClasses = 'inline-flex items-center justify-center font-inter font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg active:shadow-md';

	const sizeClasses = {
		sm: 'px-3 py-2 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
	};

	const variantClasses = {
		primary: 'bg-[#050711] dark:bg-gray-700 text-white dark:text-gray-100 hover:bg-[#04060e] dark:hover:bg-gray-600 focus:ring-[#050711] dark:focus:ring-gray-500 active:bg-[#03050c] dark:active:bg-gray-800 cursor-pointer',
		secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 dark:focus:ring-gray-400 active:bg-gray-300 dark:active:bg-gray-800 cursor-pointer',
		outline: 'border border-[#050711] dark:border-gray-400 text-[#050711] dark:text-gray-100 bg-transparent hover:bg-[#050711] dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-100 focus:ring-[#050711] dark:focus:ring-gray-400 active:bg-[#04060e] dark:active:bg-gray-800 cursor-pointer',
		ghost: 'text-[#050711] dark:text-gray-300 bg-transparent hover:bg-[#050711]/10 dark:hover:bg-gray-700/50 focus:ring-[#050711] dark:focus:ring-gray-400 active:bg-[#050711]/20 dark:active:bg-gray-700/70 cursor-pointer',
		danger: 'bg-red-600 dark:bg-red-700 text-white dark:text-gray-100 hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400 active:bg-red-800 dark:active:bg-red-800 cursor-pointer',
		'muted-sage-green': 'bg-(--interactive-secondary) dark:bg-gray-700 text-white dark:text-gray-100 border-(--muted-sage-green) dark:border-gray-600 hover:bg-(--muted-sage-green)/90 dark:hover:bg-gray-600 focus:ring-(--muted-sage-green) dark:focus:ring-gray-500 active:bg-(--muted-sage-green)/80 dark:active:bg-gray-800 cursor-pointer',
		'muted-sage-green-outline': 'border border-(--muted-sage-green) dark:border-gray-400 text-(--muted-sage-green) dark:text-gray-300 bg-transparent hover:bg-(--interactive-secondary) dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-100 focus:ring-(--muted-sage-green) dark:focus:ring-gray-400 active:bg-(--muted-sage-green)/90 dark:active:bg-gray-800 cursor-pointer',
	};

	const widthClasses = fullWidth ? 'w-full' : '';

	const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClasses}
    ${loading ? 'cursor-wait' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

	const handleClick = () => {
		if (!disabled && !loading && onClick) {
			onClick();
		}
	};

	const renderIcon = () => {
		if (loading) {
			return (
				<div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
			);
		}
		return icon;
	};

	const renderContent = () => {
		const iconElement = renderIcon();

		if (!iconElement) {
			return children;
		}

		if (iconPosition === 'left') {
			return (
				<>
					{iconElement}
					<span className="ml-2">{children}</span>
				</>
			);
		}

		return (
			<>
				<span className="mr-2">{children}</span>
				{iconElement}
			</>
		);
	};

	return (
		<button
			type={type}
			className={buttonClasses}
			style={style}
			onClick={handleClick}
			disabled={disabled || loading}
			aria-disabled={disabled || loading}
		>
			{renderContent()}
		</button>
	);
};

export default Button;
