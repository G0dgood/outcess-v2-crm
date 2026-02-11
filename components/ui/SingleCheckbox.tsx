import React, { useId } from 'react';

interface SingleCheckboxProps {
  id?: string;
  name?: string;
  label?: string;
  yesLabel?: string;
  noLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const SingleCheckbox: React.FC<SingleCheckboxProps> = ({
  id,
  name,
  label,
  yesLabel = 'Yes',
  noLabel = 'No',
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  const generatedId = useId();
  const checkboxId = id || `${name || 'checkbox'}-${generatedId}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) onChange(e.target.checked);
  };

  return (
    <div className={`input-container ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="checkbox-container flex flex-row items-center gap-4 mt-4">
        <div className="checkbox-round">
          <input
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="checkbox-input"
          />
          <label htmlFor={checkboxId} className="checkbox-label"></label>
        </div>
        <label htmlFor={checkboxId} className="checkbox-text-label pl-4">
          {checked ? yesLabel : noLabel}
        </label>
      </div>
    </div>
  );
};

export default SingleCheckbox;
