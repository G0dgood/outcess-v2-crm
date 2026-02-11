import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  orientation = 'vertical',
}) => {
  const containerClass = orientation === 'horizontal'
    ? 'flex flex-wrap items-center gap-4 mt-4'
    : 'flex flex-col items-start gap-4 mt-4';

  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={containerClass}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          return (
            <div key={option.value} className={`radio flex items-center gap-4 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={isDisabled}
              />
              <label htmlFor={optionId} className="radio-label">
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadioGroup;
