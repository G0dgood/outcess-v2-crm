import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
	value: string;
	label: string;
}

interface DropdownProps {
	label: string;
	placeholder?: string;
	options: DropdownOption[];
	value?: string;
	onChange?: (value: string) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
	label,
	placeholder = "Select option",
	options,
	value,
	onChange,
	required = false,
	disabled = false,
	error,
	className = '',
	inputClassName = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find(option => option.value === value);

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	};

	const handleSelect = (optionValue: string) => {
		onChange?.(optionValue);
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleToggle();
		} else if (e.key === 'Escape') {
			setIsOpen(false);
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className={`dropdown-container ${className}`}>
			<label className="dropdown-label">
				{label}
				{required && <span className="required-asterisk">*</span>}
			</label>

			<div
				ref={dropdownRef}
				className={`dropdown-wrapper ${isOpen ? 'open' : ''} ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
			>
				<button
					type="button"
					className={`dropdown-trigger ${inputClassName}`}
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span className={`dropdown-text ${!selectedOption ? 'placeholder' : ''}`}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<svg
						className={`dropdown-chevron ${isOpen ? 'open' : ''}`}
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
					>
						<path
							d="M3 4.5L6 7.5L9 4.5"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>

				{isOpen && (
					<div className="dropdown-menu">
						<div className="dropdown-options">
							{options.length === 0 ? (
								<div className="dropdown-empty-state">
									<div className="dropdown-empty-icon">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
											<path
												d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>
									<div className="dropdown-empty-text">
										<p className="dropdown-empty-title">No options available</p>
										<p className="dropdown-empty-description">Add options to see them here</p>
									</div>
								</div>
							) : (
								options.map((option) => (
									<button
										key={option.value}
										type="button"
										className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
										onClick={() => handleSelect(option.value)}
									>
										{option.label}
									</button>
								))
							)}
						</div>
					</div>
				)}
			</div>

			{error && <span className="dropdown-error">{error}</span>}
		</div>
	);
};

export default Dropdown;
