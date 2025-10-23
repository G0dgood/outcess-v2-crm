import React from 'react';

interface InputProps {
	label: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	type?: 'text' | 'email' | 'password' | 'number' | 'tel';
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
	label,
	placeholder,
	value,
	onChange,
	type = 'text',
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
			{label && (
				<label className="input-label">
					{label}
					{required && <span className="required-asterisk">*</span>}
				</label>
			)}
			<input
				type={type}
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
				disabled={disabled}
				className={`input-field ${error ? 'error' : ''} ${inputClassName}`}
				required={required}
			/>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default Input;
