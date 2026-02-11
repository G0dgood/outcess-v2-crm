import React from 'react';

interface SingleRadioProps {
  label?: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  disabled?: boolean;
  className?: string;
}

const SingleRadio: React.FC<SingleRadioProps> = ({
  label,
  name,
  checked,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="flex items-center gap-4 mt-4">
        <div className={`radio flex items-center gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="radio"
            id={`${name}-yes`}
            name={name}
            value="true"
            checked={!!checked}
            onChange={() => !disabled && onChange(true)}
            disabled={disabled}
          />
          <label htmlFor={`${name}-yes`} className="radio-label">{yesLabel}</label>
        </div>
        <div className={`radio flex items-center gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="radio"
            id={`${name}-no`}
            name={name}
            value="false"
            checked={!checked}
            onChange={() => !disabled && onChange(false)}
            disabled={disabled}
          />
          <label htmlFor={`${name}-no`} className="radio-label">{noLabel}</label>
        </div>
      </div>
    </div>
  );
};

export default SingleRadio;
