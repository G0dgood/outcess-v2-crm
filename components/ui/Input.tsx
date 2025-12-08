import React from 'react';

interface InputProps {
	label: string;
	name?: string;
	id?: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	type?: 'text' | 'email' | 'password' | 'number' | 'tel';
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
	onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
	label,
	name,
	id,
	placeholder,
	value,
	onChange,
	type = 'text',
	required = false,
	disabled = false,
	error,
	className = '',
	inputClassName = '',
	onKeyPress,
	autoComplete,
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	const inputId = id || name || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

	return (
		<div className={`input-container ${className}`}>
			{label && (
				<label className="input-label" htmlFor={inputId}>
					{label}
					{required && <span className="required-asterisk">*</span>}
				</label>
			)}
			<input
				id={inputId}
				name={name}
				type={type}
				value={value}
				onChange={handleChange}
				onKeyPress={onKeyPress}
				placeholder={placeholder}
				disabled={disabled}
				className={`input-field ${error ? 'error' : ''} ${inputClassName}`}
				required={required}
				autoComplete={autoComplete}
			/>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default Input;
