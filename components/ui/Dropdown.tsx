import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
	value: string;
	label: string;
	status?: string;
}

interface DropdownProps {
	label: string;
	placeholder?: string;
	options: DropdownOption[];
	value?: string | string[];
	onChange?: (value: string | string[]) => void;
	required?: boolean;
	disabled?: boolean;
	error?: string;
	className?: string;
	inputClassName?: string;
	multiple?: boolean;
	rightElement?: React.ReactNode;
	renderOptionRight?: (option: DropdownOption) => React.ReactNode;
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
	multiple = false,
	rightElement,
	renderOptionRight,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isMultiple = multiple;
	const selectedValues: string[] = isMultiple
		? (Array.isArray(value) ? value : [])
		: (typeof value === 'string' && value ? [value] : []);

	const selectedOption = !isMultiple && typeof value === 'string'
		? options.find(option => option.value === value)
		: null;

	const getDisplayText = () => {
		if (!mounted) {
			return placeholder;
		}

		if (isMultiple) {
			if (selectedValues.length === 0) {
				return placeholder;
			}
			if (selectedValues.length === 1) {
				const option = options.find(opt => opt.value === selectedValues[0]);
				return option ? option.label : placeholder;
			}
			return `${selectedValues.length} selected`;
		}
		return selectedOption ? selectedOption.label : placeholder;
	};

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	};

	const handleSelect = (optionValue: string) => {
		if (isMultiple) {
			const currentValues: string[] = Array.isArray(value) ? value : [];
			const newValues: string[] = currentValues.includes(optionValue)
				? currentValues.filter(v => v !== optionValue)
				: [...currentValues, optionValue];
			onChange?.(newValues);
			// Don't close dropdown for multiple select
		} else {
			onChange?.(optionValue as string);
			setIsOpen(false);
		}
	};

	const isSelected = (optionValue: string): boolean => {
		if (isMultiple) {
			return selectedValues.includes(optionValue);
		}
		return typeof value === 'string' && value === optionValue;
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
					<span className="flex items-center justify-between w-full gap-2">
						<span className={`dropdown-text ${(isMultiple ? selectedValues.length === 0 : !selectedOption) ? 'placeholder' : ''}`}>
							{getDisplayText()}
						</span>
						{rightElement && (
							<span className="flex items-center">
								{rightElement}
							</span>
						)}
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
					</span>
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
										className={`dropdown-option ${isSelected(option.value) ? 'selected' : ''} ${isMultiple ? 'dropdown-option-multiple' : ''}`}
										onClick={() => handleSelect(option.value)}
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											gap: '8px',
										}}
									>
										{isMultiple && (
											<span className="dropdown-checkbox" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
												{isSelected(option.value) ? (
													<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
														<rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
														<path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
													</svg>
												) : (
													<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
														<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
													</svg>
												)}
											</span>
										)}
										<span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
										{renderOptionRight && !isMultiple && (
											<span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
												{renderOptionRight(option)}
											</span>
										)}
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
