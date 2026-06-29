import React, { useState } from 'react';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';

interface InputProps {
	label?: string;
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
	description?: string;
	min?: number | string;
	max?: number | string;
	readOnly?: boolean;
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
	description,
	min,
	max,
	readOnly = false,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === 'password';

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	const inputId = id || name || `input-${(label || 'field').replace(/\s+/g, '-').toLowerCase()}`;

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className={`input-container ${className}`}>
			{label && (
				<label className="input-label" htmlFor={inputId}>
					{label}
					{required && <span className="required-asterisk">*</span>}
				</label>
			)}
			{description && (
				<p className="mb-2 text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
					{description}
				</p>
			)}
			<div className="relative">
				<input
					id={inputId}
					name={name}
					type={isPassword && showPassword ? 'text' : type}
					value={value}
					onChange={handleChange}
					onKeyPress={onKeyPress}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readOnly}
					className={`input-field ${error ? 'error' : ''} ${inputClassName} ${isPassword ? 'pr-10' : ''}`}
					required={required}
					autoComplete={autoComplete}
					min={min}
					max={max}
					suppressHydrationWarning
				/>
				{isPassword && (
					<Button
						variant="ghost"
						size="sm"
						type="button"
						onClick={togglePasswordVisibility}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none p-1 h-auto"
						title={showPassword ? 'Hide password' : 'Show password'}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? (
							<EyeOpenIcon className="w-4 h-4" />
						) : (
							<EyeNoneIcon className="w-4 h-4" />
						)}
					</Button>
				)}
			</div>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default Input;
