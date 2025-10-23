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
	options: RadioOption[];
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
}) => {
	const handleChange = (optionValue: string) => {
		if (!disabled) {
			onChange?.(optionValue);
		}
	};

	const containerClass = orientation === 'horizontal'
		? 'flex flex-wrap gap-4'
		: 'space-y-2';

	return (
		<div className={`input-container ${className}`}>
			<label className="input-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>
			<div className={containerClass}>
				{options.map((option) => (
					<label
						key={option.value}
						className={`flex items-center cursor-pointer ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : ''
							}`}
					>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={value === option.value}
							onChange={() => handleChange(option.value)}
							disabled={disabled || option.disabled}
							className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2"
						/>
						<span className="text-sm text-gray-700">{option.label}</span>
					</label>
				))}
			</div>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default RadioSelect;
