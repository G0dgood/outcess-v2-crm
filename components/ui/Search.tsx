import React from 'react';
import Icon from './Icon';
import Button from './Button';

interface SearchProps {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
	maxWidth?: string;
	disabled?: boolean;
	onSearch?: (value: string) => void;
	onClear?: () => void;
	showClearButton?: boolean;
}

const Search: React.FC<SearchProps> = ({
	placeholder = 'Search',
	value = '',
	onChange,
	className = '',
	maxWidth = 'max-w-md',
	disabled = false,
	onSearch,
	onClear,
	showClearButton = false,
}) => {
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && onSearch) {
			onSearch(value);
		}
	};

	const handleClear = () => {
		onChange?.('');
		onClear?.();
	};

	return (
		<div
			className={`box-border flex flex-row items-center px-[14px] py-[10px] gap-2 w-full sm:w-[320px] md:w-[300px] lg:w-[400px] h-[40px] dark:bg-gray-800 border dark:border-gray-700 dark:focus-within:border-white relative ${maxWidth} ${className} transition-colors duration-200 rounded-[var(--radius)]`}
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<Icon name="search-refraction" size="sm" />
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={disabled}
				className={`search-input flex-1 text-[10px] md:text-[12px] font-normal leading-[150%] dark:text-gray-300 bg-transparent dark:placeholder:text-gray-500 focus:outline-none ${showClearButton && value ? 'pr-10' : ''}`}
				style={{
					color: 'var(--text-secondary)',
				}}
				onFocus={(e) => {
					e.target.style.color = 'var(--text-secondary)';
				}}
			/>
			{showClearButton && value && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClear}
					className="flex items-center dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 h-auto"
					style={{ color: 'var(--text-tertiary)' }}
					onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
						e.currentTarget.style.color = 'var(--text-secondary)';
					}}
					onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
						e.currentTarget.style.color = 'var(--text-tertiary)';
					}}
					type="button"
					title="Clear Search"
				>
					<Icon name="Close_round_light" size="sm" />
				</Button>
			)}
		</div>
	);
};

export default Search;
