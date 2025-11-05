import React from 'react';
import Icon from './Icon';

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
		<div className={`box-border flex flex-row items-center px-[14px] py-[10px] gap-2 w-[320px] h-[40px] bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 relative ${maxWidth} ${className} transition-colors duration-200`}>
			<Icon name="search-refraction" size="sm" />
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={disabled}
				className={`flex-1 text-sm font-normal leading-[150%] text-(--text-secondary) dark:text-gray-300 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none ${showClearButton && value ? 'pr-10' : ''}`}
			/>
			{showClearButton && value && (
				<button
					onClick={handleClear}
					className="flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					type="button"
				>
					<Icon name="Close_round_light" size="sm" />
				</button>
			)}
		</div>
	);
};

export default Search;

