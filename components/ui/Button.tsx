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
	onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
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
	onMouseEnter: customOnMouseEnter,
	onMouseLeave: customOnMouseLeave,
}) => {
	const baseClasses = 'inline-flex items-center justify-center font-inter font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg active:shadow-md';

	const sizeClasses = {
		sm: 'px-3 py-2 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
	};

	const variantClasses = {
		primary: 'dark:bg-gray-700 text-white dark:text-gray-100 dark:hover:bg-gray-600 focus:ring-[#050711] dark:focus:ring-gray-500 dark:active:bg-gray-800 cursor-pointer',
		secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500 dark:focus:ring-gray-400 active:bg-gray-300 dark:active:bg-gray-800 cursor-pointer',
		outline: 'dark:border-gray-400 dark:text-gray-100 bg-transparent dark:hover:bg-gray-700 hover:text-white dark:hover:text-gray-100 focus:ring-[#050711] dark:focus:ring-gray-400 dark:active:bg-gray-800 cursor-pointer',
		ghost: 'dark:text-gray-300 bg-transparent dark:hover:bg-gray-700/50 focus:ring-[#050711] dark:focus:ring-gray-400 dark:active:bg-gray-700/70 cursor-pointer',
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

	const getButtonStyles = (): React.CSSProperties => {
		const baseStyle = style || {};
		
		if (variant === 'primary') {
			return {
				...baseStyle,
				backgroundColor: baseStyle.backgroundColor ?? 'var(--text-primary)',
				color: baseStyle.color ?? 'var(--accent-white)',
			};
		}
		
		if (variant === 'outline') {
			return {
				...baseStyle,
				borderColor: baseStyle.borderColor ?? 'var(--text-primary)',
				color: baseStyle.color ?? 'var(--text-primary)',
				backgroundColor: baseStyle.backgroundColor ?? 'transparent',
			};
		}
		
		if (variant === 'ghost') {
			return {
				...baseStyle,
				color: baseStyle.color ?? 'var(--text-primary)',
				backgroundColor: baseStyle.backgroundColor ?? 'transparent',
			};
		}
		
		return baseStyle;
	};

	const getHoverStyles = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (variant === 'primary') {
			e.currentTarget.style.backgroundColor = 'var(--primary-normal)';
		} else if (variant === 'outline') {
			e.currentTarget.style.backgroundColor = 'var(--text-primary)';
			e.currentTarget.style.color = 'var(--accent-white)';
		} else if (variant === 'ghost') {
			e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
		}
	};

	const getLeaveStyles = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (variant === 'primary') {
			e.currentTarget.style.backgroundColor = style?.backgroundColor ?? 'var(--text-primary)';
		} else if (variant === 'outline') {
			e.currentTarget.style.backgroundColor = style?.backgroundColor ?? 'transparent';
			e.currentTarget.style.color = style?.color ?? 'var(--text-primary)';
		} else if (variant === 'ghost') {
			e.currentTarget.style.backgroundColor = style?.backgroundColor ?? 'transparent';
		}
	};

	const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (customOnMouseEnter) {
			customOnMouseEnter(event);
		} else {
			getHoverStyles(event);
		}
	};

	const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (customOnMouseLeave) {
			customOnMouseLeave(event);
		} else {
			getLeaveStyles(event);
		}
	};

	return (
		<button
			type={type}
			className={buttonClasses}
			style={getButtonStyles()}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			disabled={disabled || loading}
			aria-disabled={disabled || loading}
		>
			{renderContent()}
		</button>
	);
};

export default Button;
