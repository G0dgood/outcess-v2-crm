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
			<input
				type="time"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				disabled={disabled}
				className={`input-field ${error ? 'error' : ''} ${inputClassName}`}
				required={required}
				suppressHydrationWarning
			/>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default TimeInput;

