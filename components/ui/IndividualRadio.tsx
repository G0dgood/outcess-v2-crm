import React from 'react';

interface IndividualRadioProps {
	name: string;
	value: string;
	checked: boolean;
	onChange: (value: string) => void;
	label: string;
	disabled?: boolean;
	className?: string;
}

const IndividualRadio: React.FC<IndividualRadioProps> = ({
	name,
	value,
	checked,
	onChange,
	label,
	disabled = false,
	className = ''
}) => {
	const radioId = `${name}-${value}`;

	const handleChange = () => {
		if (!disabled) {
			onChange(value);
		}
	};

	return (
		<div className={`radio ${className}`}>
			<input
				type="radio"
				id={radioId}
				name={name}
				value={value}
				checked={checked}
				onChange={handleChange}
				disabled={disabled}
				className="radio-input"
			/>
			<label htmlFor={radioId} className="radio-label">
				{label}
			</label>
		</div>
	);
};

export default IndividualRadio;
