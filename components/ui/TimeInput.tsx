'use client';

import React from 'react';

interface TimeInputProps {
	label: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
	label,
	value = '',
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error,
	className = '',
	inputClassName = '',
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	return (
		<div className={`input-container ${className}`}>
			<label className="input-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			<div className="relative">
				<input
					type="time"
					value={value}
					onChange={handleChange}
					onClick={(e) => {
						if (!disabled) {
							try {
								(e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
							} catch (err) {
								console.error('showPicker failed:', err);
							}
						}
					}}
					placeholder={placeholder}
					disabled={disabled}
					className={`input-field pr-10 cursor-pointer ${error ? 'error' : ''} ${inputClassName}`}
					required={required}
					suppressHydrationWarning
				/>
				<div 
					className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="12 6 12 12 16 14"></polyline>
					</svg>
				</div>
			</div>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default TimeInput;

