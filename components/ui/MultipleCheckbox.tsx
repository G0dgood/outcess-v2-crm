import React from 'react';

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultipleCheckboxProps {
  label?: string;
  name?: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: CheckboxOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const MultipleCheckbox: React.FC<MultipleCheckboxProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  orientation = 'vertical',
}) => {
  const handleToggle = (optValue: string, checked: boolean) => {
    if (disabled) return;
    const next = checked ? [...value, optValue] : value.filter(v => v !== optValue);
    onChange(next);
  };

  const containerClass = orientation === 'horizontal'
    ? 'flex flex-wrap gap-4 mt-4'
    : 'flex flex-col gap-4 mt-4';

  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={containerClass}>
        {options.map((opt) => {
          const optionId = `${name || 'checkbox'}-${opt.value}`;
          const isChecked = value.includes(opt.value);
          const isDisabled = disabled || opt.disabled;
          return (
            <div key={opt.value} className={`checkbox-container flex items-center gap-4 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="checkbox-round">
                <input
                  type="checkbox"
                  id={optionId}
                  name={name}
                  checked={isChecked}
                  onChange={(e) => handleToggle(opt.value, e.target.checked)}
                  disabled={isDisabled}
                  className="checkbox-input"
                />
                <label htmlFor={optionId} className="checkbox-label"></label>
              </div>
              <label htmlFor={optionId} className="checkbox-text-label pl-4">
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleCheckbox;
