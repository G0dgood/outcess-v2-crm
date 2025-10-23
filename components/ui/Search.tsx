import React from 'react';
import Icon from './Icon';

interface SearchProps {
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
	inputClassName?: string;
	disabled?: boolean;
	onSearch?: (value: string) => void;
	onClear?: () => void;
	showClearButton?: boolean;
}

const Search: React.FC<SearchProps> = ({
	placeholder = 'Search',
	value,
	onChange,
	className = '',
	inputClassName = '',
	disabled = false,
	onSearch,
	onClear,
	showClearButton = true,
}) => {
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && onSearch) {
			onSearch(value);
		}
	};

	const handleClear = () => {
		onChange('');
		onClear?.();
	};

	return (
		<div className={`relative ${className}`}>
			{/* Search Icon */}
			<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<Icon name="Search_light" size="sm" className="text-gray-400" />
			</div>

			{/* Input Field */}
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyPress={handleKeyPress}
				disabled={disabled}
				className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${inputClassName} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
					}`}
			/>

			{/* Clear Button */}
			{showClearButton && value && (
				<button
					onClick={handleClear}
					className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
					type="button"
				>
					<Icon name="Close_round_light" size="sm" />
				</button>
			)}
		</div>
	);
};

export default Search;
