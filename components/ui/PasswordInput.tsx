import React, { useState } from 'react';

interface PasswordInputProps {
	label: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	showHelpIcon?: boolean;
	onHelpClick?: () => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
	label,
	placeholder = "Enter your password",
	value,
	onChange,
	required = false,
	disabled = false,
	error,
	className = '',
	showHelpIcon = true,
	onHelpClick,
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

	return (
		<div className={`password-container ${className}`}>
			<label className="password-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			<div className="password-input-wrapper">
				<input
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={handleChange}
					placeholder={placeholder}
					disabled={disabled}
					className={`password-field ${error ? 'error' : ''}`}
					required={required}
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
