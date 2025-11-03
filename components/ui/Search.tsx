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
		<div className={`box-border flex flex-row items-center px-[14px] py-[10px] gap-2 w-[320px] h-[40px] bg-white border border-[#E5E7EB] relative ${maxWidth} ${className}`}>
			<Icon name="search-refraction" size="sm" />
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={disabled}
				className={`flex-1 text-sm font-normal leading-[150%] text-(--text-secondary) focus:outline-none ${showClearButton && value ? 'pr-10' : ''}`}
			/>
			{showClearButton && value && (
				<button
					onClick={handleClear}
					className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
					type="button"
				>
					<Icon name="Close_round_light" size="sm" />
				</button>
			)}
		</div>
	);
};

export default Search;

