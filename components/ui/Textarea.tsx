'use client';

import React from 'react';

interface TextareaProps {
	label: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
	rows?: number;
	resize?: 'none' | 'both' | 'horizontal' | 'vertical';
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	name?: string;
	readOnly?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
	label,
	value = '',
	onChange,
	placeholder,
	required = false,
	disabled = false,
	error,
	className = '',
	inputClassName = '',
	rows = 3,
	resize = 'vertical',
	onKeyDown,
	name,
	readOnly = false,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange?.(e.target.value);
	};

	const resizeClass = {
		none: 'resize-none',
		both: 'resize',
		horizontal: 'resize-x',
		vertical: 'resize-y',
	}[resize];

	return (
		<div className={`input-container ${className}`}>
			<label className="input-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			<textarea
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}
				rows={rows}
				className={`input-field ${error ? 'error' : ''} ${resizeClass} ${inputClassName}`}
				required={required}
				onKeyDown={onKeyDown}
				name={name}
				suppressHydrationWarning
			/>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default Textarea;
