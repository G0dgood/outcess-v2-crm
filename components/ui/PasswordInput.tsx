import React, { useState } from 'react';

interface PasswordInputProps {
	label: string;
	name?: string;
	id?: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	showHelpIcon?: boolean;
	onHelpClick?: () => void;
	autoComplete?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
	label,
	name,
	id,
	placeholder = "Enter your password",
	value,
	onChange,
	required = false,
	disabled = false,
	error,
	className = '',
	showHelpIcon = true,
	onHelpClick,
	autoComplete,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.value);
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleHelpClick = () => {
		if (onHelpClick) {
			onHelpClick();
		} else {
			// Default help behavior - could show a tooltip or modal
			alert('Password requirements:\n• At least 8 characters\n• Mix of letters and numbers\n• Special characters recommended');
		}
	};

	const inputId = id || name || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

	return (
		<div className={`password-container ${className}`}>
			<label className="password-label" htmlFor={inputId}>
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			<div className="password-input-wrapper">
				<input
					id={inputId}
					name={name}
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={handleChange}
					placeholder={placeholder}
					disabled={disabled}
					className={`password-field ${error ? 'error' : ''}`}
					required={required}
					autoComplete={autoComplete}
				/>
				<div className="password-icons">
					{showHelpIcon && (
						<button
							type="button"
							className="help-icon"
							onClick={handleHelpClick}
							disabled={disabled}
							aria-label="Password help"
						>
							?
						</button>
					)}
					<button
						type="button"
						className="toggle-visibility"
						onClick={togglePasswordVisibility}
						disabled={disabled}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? '👁️' : '👁️‍🗨️'}
					</button>
				</div>
			</div>
			{error && <span className="password-error">{error}</span>}
		</div>
	);
};

export default PasswordInput;
