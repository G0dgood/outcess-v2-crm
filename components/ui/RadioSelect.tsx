'use client';

import React from 'react';

interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface RadioSelectProps {
	label: string;
	name: string;
	value?: string;
	onChange?: (value: string) => void;
	options?: RadioOption[];
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	orientation?: 'vertical' | 'horizontal';
}

export const RadioSelect: React.FC<RadioSelectProps> = ({
	label,
	name,
	value = '',
	onChange,
	options,
	required = false,
	disabled = false,
	error,
	className = '',
	orientation = 'vertical',
	checked: checkedProp = false,
	onCheckedChange,
}) => {
	const handleChange = (optionValue: string) => {
		if (!disabled) {
			onChange?.(optionValue);
		}
	};

	const containerClass = orientation === 'horizontal'
		? 'flex flex-wrap gap-4'
		: 'flex flex-col gap-2';

	return (
		<div className={`input-container ${className}`}>
			<label className="input-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			{options && options.length > 0 ? (
				<div className={containerClass}>
					{options.map((option) => {
						const optionId = `${name}-${option.value}`;
						const isDisabled = disabled || option.disabled;
						return (
							<div key={option.value} className={`radio ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
								<input
									type="radio"
									id={optionId}
									name={name}
									value={option.value}
									checked={value === option.value}
									onChange={() => handleChange(option.value)}
									disabled={isDisabled}
								/>
								<label htmlFor={optionId} className="radio-label">
									{option.label}
								</label>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex gap-4">
					<div className={`radio ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
						<input
							type="radio"
							id={`${name}-yes`}
							name={name}
							value="true"
							checked={!!checkedProp}
							onChange={() => !disabled && onCheckedChange?.(true)}
							disabled={disabled}
						/>
						<label htmlFor={`${name}-yes`} className="radio-label">Yes</label>
					</div>
					<div className={`radio ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
						<input
							type="radio"
							id={`${name}-no`}
							name={name}
							value="false"
							checked={!checkedProp}
							onChange={() => !disabled && onCheckedChange?.(false)}
							disabled={disabled}
						/>
						<label htmlFor={`${name}-no`} className="radio-label">No</label>
					</div>
				</div>
			)}
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default RadioSelect;
