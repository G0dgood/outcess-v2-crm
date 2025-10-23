import React from 'react';

interface CheckboxProps {
	id?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
	id,
	checked,
	onChange,
	label,
	disabled = false,
	className = ''
}) => {
	const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.checked);
	};

	return (
		<div className={`checkbox-container ${className}`}>
			<div className="checkbox-round">
				<input
					type="checkbox"
					id={checkboxId}
					checked={checked}
					onChange={handleChange}
					disabled={disabled}
					className="checkbox-input"
				/>
				<label htmlFor={checkboxId} className="checkbox-label">fff</label>
			</div>
			{label && (
				<label htmlFor={checkboxId} className="checkbox-text-label">
					{label}
				</label>
			)}
		</div>
	);
};

export default Checkbox;
