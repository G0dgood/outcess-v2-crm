'use client';

import React from 'react';

interface CheckboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CheckboxSelectProps {
	label: string;
	name?: string;
	value?: string[];
	onChange?: (values: string[]) => void;
	options?: CheckboxOption[];
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	orientation?: 'vertical' | 'horizontal';
}

export const CheckboxSelect: React.FC<CheckboxSelectProps> = ({
	label,
	name,
	value = [],
	onChange,
	options,
	required = false,
	disabled = false,
	error,
	className = '',
	orientation = 'vertical',
	checked = false,
	onCheckedChange,
}) => {
	const handleChange = (optionValue: string, checked: boolean) => {
		if (!disabled) {
			const newValues = checked
				? [...value, optionValue]
				: value.filter(v => v !== optionValue);
			onChange?.(newValues);
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
						const optionId = `checkbox-${option.value}`;
						const isChecked = value.includes(option.value);
						const isDisabled = disabled || option.disabled;
						return (
							<div key={option.value} className={`checkbox-container ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
								<div className="checkbox-round">
									<input
										type="checkbox"
										id={optionId}
										checked={isChecked}
										onChange={(e) => handleChange(option.value, e.target.checked)}
										disabled={isDisabled}
										className="checkbox-input"
									/>
									<label htmlFor={optionId} className="checkbox-label"></label>
								</div>
								<label htmlFor={optionId} className="checkbox-text-label">
									{option.label}
								</label>
							</div>
						);
					})}
				</div>
			) : (
				<div className={`checkbox-container ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
					<div className="checkbox-round">
						<input
							type="checkbox"
							id={`${name || 'checkbox-single'}`}
							checked={!!checked}
							onChange={(e) => !disabled && onCheckedChange?.(e.target.checked)}
							disabled={disabled}
							className="checkbox-input"
						/>
						<label htmlFor={`${name || 'checkbox-single'}`} className="checkbox-label"></label>
					</div>
					<label htmlFor={`${name || 'checkbox-single'}`} className="checkbox-text-label">
						{label}
					</label>
				</div>
			)}
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default CheckboxSelect;
