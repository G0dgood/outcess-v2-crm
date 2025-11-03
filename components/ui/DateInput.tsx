'use client';

import React, { forwardRef } from 'react';

interface DateInputProps {
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

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({
	label,
	value = '',
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error,
	className = '',
	inputClassName = '',
}, ref) => {
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
				ref={ref}
				type="date"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				disabled={disabled}
				className={`input-field ${error ? 'error' : ''} ${inputClassName}`}
				required={required}
				style={{
					appearance: 'none',
					WebkitAppearance: 'none',
				}}
			/>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
});

DateInput.displayName = 'DateInput';

export default DateInput;
