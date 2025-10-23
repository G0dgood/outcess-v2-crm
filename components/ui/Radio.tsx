import React from 'react';

interface RadioOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface RadioProps {
	name: string;
	options: RadioOption[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

const Radio: React.FC<RadioProps> = ({
	name,
	options,
	value,
	onChange,
	disabled = false,
	className = ''
}) => {
	const handleChange = (optionValue: string) => {
		if (!disabled && !options.find(opt => opt.value === optionValue)?.disabled) {
			onChange(optionValue);
		}
	};

	return (
		<div className={`radio-container ${className}`}>
			{options.map((option) => {
				const optionId = `${name}-${option.value}`;
				const isOptionDisabled = disabled || option.disabled;

				return (
					<div key={option.value} className="radio">
						<input
							type="radio"
							id={optionId}
							name={name}
							value={option.value}
							checked={value === option.value}
							onChange={() => handleChange(option.value)}
							disabled={isOptionDisabled}
							className="radio-input"
						/>
						<label htmlFor={optionId} className="radio-label">
							{option.label}
						</label>
					</div>
				);
			})}
		</div>
	);
};

export default Radio;