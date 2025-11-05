'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDropdown: React.FC = () => {
	const { isDarkMode, toggleTheme, setTheme } = useTheme();
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

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
				title={isDarkMode ? 'Dark mode active' : 'Light mode active'}
				type="button"
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				{isDarkMode ? (
					<MoonIcon className="w-5 h-5" />
				) : (
					<SunIcon className="w-5 h-5" />
				)}
				<span className="hidden md:inline text-sm font-medium">
					{isDarkMode ? 'Dark' : 'Light'}
				</span>
				<svg
					className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
					<div className="py-1">
						<button
							onClick={() => handleThemeSelect('light')}
							className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
								!isDarkMode
									? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
							}`}
							type="button"
						>
							<SunIcon className="w-4 h-4" />
							<span>Light Mode</span>
							{!isDarkMode && (
								<svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</button>
						<button
							onClick={() => handleThemeSelect('dark')}
							className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${
								isDarkMode
									? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
							}`}
							type="button"
						>
							<MoonIcon className="w-4 h-4" />
							<span>Dark Mode</span>
							{isDarkMode && (
								<svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ThemeDropdown;

