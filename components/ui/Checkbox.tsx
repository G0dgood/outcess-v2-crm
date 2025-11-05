import React, { useId } from 'react';

interface CheckboxProps {
	id?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
	size?: 'default' | 'small' | 'medium';
}

const Checkbox: React.FC<CheckboxProps> = ({
	id,
	checked,
	onChange,
	label,
	disabled = false,
	className = '',
	size = 'default'
}) => {
	const generatedId = useId();
	const checkboxId = id || generatedId;
	const sizeClass = size === 'small' ? 'checkbox-small' : size === 'medium' ? 'checkbox-medium' : '';

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.checked);
	};

	return (
		<div className={`checkbox-container ${sizeClass} ${className}`}>
			<div className="checkbox-round">
				<input
					type="checkbox"
					id={checkboxId}
					checked={checked}
					onChange={handleChange}
					disabled={disabled}
					className="checkbox-input"
				/>
				<label htmlFor={checkboxId} className="checkbox-label"></label>
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
