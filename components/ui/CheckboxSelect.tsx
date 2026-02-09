'use client';

import React from 'react';

interface CheckboxOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface CheckboxSelectProps {
	label: string;
	value?: string[];
	onChange?: (values: string[]) => void;
	options: CheckboxOption[];
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	orientation?: 'vertical' | 'horizontal';
}

export const CheckboxSelect: React.FC<CheckboxSelectProps> = ({
	label,
	value = [],
	onChange,
	options,
	required = false,
	disabled = false,
	error,
	className = '',
	orientation = 'vertical',
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
							type="checkbox"
							value={option.value}
							checked={value.includes(option.value)}
							onChange={(e) => handleChange(option.value, e.target.checked)}
							disabled={disabled || option.disabled}
							className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded"
						/>
						<span className="text-[10px] md:text-[12px] text-gray-700">{option.label}</span>
					</label>
				))}
			</div>
			{error && <span className="input-error">{error}</span>}
		</div>
	);
};

export default CheckboxSelect;
