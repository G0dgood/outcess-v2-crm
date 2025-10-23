'use client';

import React from 'react';

interface RadioProps {
	name: string;
	value: string;
	checked: boolean;
	onChange: (value: string) => void;
	label: string;
	className?: string;
	disabled?: boolean;
}

const Radio: React.FC<RadioProps> = ({
	name,
	value,
	checked,
	onChange,
	label,
	className = '',
	disabled = false,
}) => {
	return (
		<label className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
			<input
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className="sr-only"
			/>
			<div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${checked
					? 'border-[#050711] bg-[#050711]'
					: 'border-gray-300 hover:border-gray-400'
				} ${disabled ? 'border-gray-200' : ''}`}>
				{checked && (
					<div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
				)}
			</div>
			<span className={`font-lato text-sm ${checked ? 'text-[#050711]' : 'text-gray-600'
				} ${disabled ? 'text-gray-400' : ''}`}>
				{label}
			</span>
		</label>
	);
};

export default Radio;
