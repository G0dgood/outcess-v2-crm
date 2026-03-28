import React from 'react';
import Button from './Button';
import Icon from './Icon';

interface SearchWithSendProps {
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	onSearch?: (value: string) => void;
	className?: string;
	disabled?: boolean;
	buttonColor?: string;
}

const SearchWithSend: React.FC<SearchWithSendProps> = ({
	placeholder = 'Search...',
	value = '',
	onChange,
	onSearch,
	className = '',
	disabled = false,
	buttonColor,
}) => {
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && onSearch) {
			onSearch(value);
		}
	};

	const handleSearchClick = () => {
		if (onSearch) {
			onSearch(value);
		}
	};

	return (
		<div
			className={`flex items-center ${className}`}
		>
			<div
				className="relative flex-1 flex items-center pl-[14px] pr-1 py-[4px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors h-[40px]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					onKeyPress={handleKeyPress}
					disabled={disabled}
					className="flex-1 bg-transparent border-none outline-none text-[10px] md:text-[12px] font-normal leading-[150%] dark:text-gray-300 ml-2"
					style={{ color: 'var(--text-secondary)' }}
				/>
				<button
					onClick={handleSearchClick}
					disabled={disabled}
					className="h-[32px] w-[32px] flex items-center justify-center transition-colors !rounded-none"
					style={{
						backgroundColor: buttonColor || '#000000',
						color: 'white'
					}}
				>
					<Icon name="search-refraction" size="sm" color="white" />
				</button>
			</div>
		</div>
	);
};

export default SearchWithSend;
