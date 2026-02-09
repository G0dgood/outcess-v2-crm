'use client';

import React, { useState, useRef, useEffect } from 'react';
import Input from './Input';

interface ColorPickerProps {
	value: string;
	onChange: (color: string) => void;
	label?: string;
	className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
	value,
	onChange,
	label,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
	const [alpha, setAlpha] = useState(100);
	const [positionAbove, setPositionAbove] = useState(false);
	const squareRef = useRef<HTMLDivElement>(null);
	const hueRef = useRef<HTMLDivElement>(null);
	const alphaRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Convert hex to HSL
	const hexToHsl = (hex: string) => {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0, s = 0; const l = (max + min) / 2;

		if (max !== min) {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	};

	// Convert HSL to hex
	const hslToHex = (h: number, s: number, l: number) => {
		h /= 360;
		s /= 100;
		l /= 100;

		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		let r, g, b;
		if (s === 0) {
			r = g = b = l;
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		const toHex = (c: number) => {
			const hex = Math.round(c * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	// Initialize HSL from hex value
	useEffect(() => {
		if (value && value.startsWith('#')) {
			const hslValue = hexToHsl(value);
			setHsl(hslValue);
		}
	}, [value]);

	// Check available space and position picker accordingly
	const checkPosition = () => {
		if (!triggerRef.current) return;

		const triggerRect = triggerRef.current.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const pickerHeight = 400; // Approximate height of the color picker
		const spaceBelow = viewportHeight - triggerRect.bottom;
		const spaceAbove = triggerRect.top;

		// If not enough space below but enough space above, position above
		if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
			setPositionAbove(true);
		} else {
			setPositionAbove(false);
		}
	};

	// Close picker when clicking outside and handle positioning
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleResize = () => {
			if (isOpen) {
				checkPosition();
			}
		};

		if (isOpen) {
			checkPosition();
			document.addEventListener('mousedown', handleClickOutside);
			window.addEventListener('resize', handleResize);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			window.removeEventListener('resize', handleResize);
		};
	}, [isOpen]);

	const handleSquareClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!squareRef.current) return;

		const rect = squareRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const saturation = Math.round((x / rect.width) * 100);
		const lightness = Math.round(100 - (y / rect.height) * 100);

		const newHsl = { ...hsl, s: saturation, l: lightness };
		setHsl(newHsl);
		onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
	};

	const handleHueClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!hueRef.current) return;

		const rect = hueRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const hue = Math.round((x / rect.width) * 360);

		const newHsl = { ...hsl, h: hue };
		setHsl(newHsl);
		onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
	};

	const handleAlphaClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!alphaRef.current) return;

		const rect = alphaRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const newAlpha = Math.round((x / rect.width) * 100);

		setAlpha(newAlpha);
	};

	const currentColor = value && value.startsWith('#') ? value : hslToHex(hsl.h, hsl.s, hsl.l);

	return (
		<div className={`relative ${className}`} ref={pickerRef}>
			{label && (
				<label className="font-inter text-[10px] md:text-[12px] font-medium text-[#050711] mb-2 block">
					{label}
				</label>
			)}

			<div className="flex items-center gap-3">
				<div
					ref={triggerRef}
					className="w-8 h-8 border border-gray-300 cursor-pointer rounded shadow-sm"
					style={{ backgroundColor: currentColor }}
					onClick={() => setIsOpen(!isOpen)}
					title={currentColor}
				/>

				<div className="flex-1">
					<Input
						label=""
						value={value}
						onChange={onChange}
						placeholder="#000000"
						className="font-mono"
						inputClassName="h-8"
					/>
				</div>
			</div>

			{isOpen && (
				<div className={`absolute left-0 bg-white border border-gray-200 shadow-lg p-4 z-50 min-w-[280px] ${positionAbove
					? 'bottom-full mb-2'
					: 'top-full mt-2'
					}`}>
					{/* Color Square */}
					<div className="mb-4">
						<div
							ref={squareRef}
							className="w-full h-32   border border-gray-300 cursor-crosshair relative"
							style={{
								background: `linear-gradient(to right, hsl(${hsl.h}, 0%, 50%), hsl(${hsl.h}, 100%, 50%)), linear-gradient(to bottom, white, black)`
							}}
							onClick={handleSquareClick}
						>
							<div
								className="absolute w-3 h-3 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
								style={{
									left: `${hsl.s}%`,
									top: `${100 - hsl.l}%`,
									backgroundColor: currentColor
								}}
							/>
						</div>
					</div>

					{/* Hue Slider */}
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-2">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z" fill="#6B7280" />
							</svg>
							<span className="text-[10px] md:text-[12px] font-medium text-gray-700">Hue</span>
						</div>
						<div
							ref={hueRef}
							className="w-full h-4 rounded border border-gray-300 cursor-pointer relative"
							style={{
								background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
							}}
							onClick={handleHueClick}
						>
							<div
								className="absolute w-3 h-3 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
								style={{
									left: `${(hsl.h / 360) * 100}%`,
									top: '50%',
									backgroundColor: currentColor
								}}
							/>
						</div>
					</div>

					{/* Alpha Slider */}
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-[10px] md:text-[12px] font-medium text-gray-700">Opacity</span>
						</div>
						<div
							ref={alphaRef}
							className="w-full h-4 rounded border border-gray-300 cursor-pointer relative"
							style={{
								backgroundImage: `
                  linear-gradient(to right, transparent, ${currentColor}),
                  linear-gradient(45deg, #ccc 25%, transparent 25%), 
                  linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #ccc 75%), 
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
								backgroundSize: '100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
								backgroundPosition: '0 0, 0 0, 0 4px, 4px -4px, -4px 0px'
							}}
							onClick={handleAlphaClick}
						>
							<div
								className="absolute w-3 h-3 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
								style={{
									left: `${alpha}%`,
									top: '50%',
									backgroundColor: currentColor
								}}
							/>
						</div>
					</div>

					{/* Color Values */}
					<div className="mb-4">
						<div className="flex items-center gap-2 mb-2">
							<select className="text-[10px] md:text-[12px] font-medium text-gray-700 bg-transparent border-none outline-none">
								<option>HSL</option>
							</select>
						</div>
						<div className="grid grid-cols-4 gap-2">
							<Input
								label=""
								value={hsl.h.toString()}
								onChange={(value) => {
									const newHsl = { ...hsl, h: parseInt(value) || 0 };
									setHsl(newHsl);
									onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
								}}
								placeholder="H"
								className="text-center"
								inputClassName="h-10"
							/>
							<Input
								label=""
								value={hsl.s.toString()}
								onChange={(value) => {
									const newHsl = { ...hsl, s: parseInt(value) || 0 };
									setHsl(newHsl);
									onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
								}}
								placeholder="S"
								className="text-center"
								inputClassName="h-10"
							/>
							<Input
								label=""
								value={hsl.l.toString()}
								onChange={(value) => {
									const newHsl = { ...hsl, l: parseInt(value) || 0 };
									setHsl(newHsl);
									onChange(hslToHex(newHsl.h, newHsl.s, newHsl.l));
								}}
								placeholder="L"
								className="text-center"
								inputClassName="h-10"
							/>
							<Input
								label=""
								value={alpha.toString()}
								onChange={(value) => setAlpha(parseInt(value) || 100)}
								placeholder="A"
								className="text-center"
								inputClassName="h-10"
							/>
						</div>
					</div>

					{/* Close button */}
					<div className="flex justify-end">
						<button
							onClick={() => setIsOpen(false)}
							className="px-3 py-1 text-[10px] md:text-[12px] text-gray-600 hover:text-gray-800"
						>
							Done
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ColorPicker;
