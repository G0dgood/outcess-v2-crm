'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDropdown: React.FC<{ inputClassName?: string }> = ({ inputClassName }) => {
	const { isDarkMode, setTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Close dropdown on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen]);

	const handleThemeSelect = (theme: 'light' | 'dark') => {
		setTheme(theme);
		setIsOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			setIsOpen((prev) => !prev);
		} else if (event.key === 'Escape') {
			setIsOpen(false);
		}
	};

	return (
		<div className="relative dropdown-container" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				onKeyDown={handleKeyDown}
				className={`dropdown-trigger flex items-center gap-2 ${isOpen ? 'open' : ''} ${inputClassName}`}
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				<span className="flex items-center gap-2 dropdown-text">
					{isDarkMode ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
					<span className="hidden md:inline text-sm font-medium whitespace-nowrap">
						{isDarkMode ? 'Dark Mode' : 'Light Mode'}
					</span>
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
				<div className="dropdown-menu dropdown-menu-right">
					<div className="dropdown-options ">
						<button
							type="button"
							onClick={() => handleThemeSelect('light')}
							className={`cursor-pointer flex items-center gap-2 dropdown-option ${!isDarkMode ? 'selected' : ''}`}
						>
							<div className="flex items-center gap-2">

								<SunIcon className="w-4 h-4" />
								<span className='whitespace-nowrap'>Light Mode</span>
							</div>
						</button>

						<button
							type="button"
							onClick={() => handleThemeSelect('dark')}
							className={`cursor-pointer dropdown-option ${isDarkMode ? 'selected' : ''}`}
						>
							<div className="flex items-center gap-2">
								<MoonIcon className="w-4 h-4" />
								<span className='whitespace-nowrap'>Dark Mode</span>
							</div>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ThemeDropdown;

