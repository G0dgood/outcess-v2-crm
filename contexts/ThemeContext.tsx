'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
	isDarkMode: boolean;
	toggleTheme: () => void;
	setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Initialize from localStorage on mount
	useEffect(() => {
		setMounted(true);
		// Check localStorage for saved theme preference
		const savedTheme = localStorage.getItem('darkMode');
		const shouldBeDark = savedTheme === 'true';
		setIsDarkMode(shouldBeDark);
		
		// Update DOM immediately
		if (shouldBeDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, []);

	// Update DOM and localStorage when isDarkMode changes (after mount)
	useEffect(() => {
		if (!mounted) return;
		
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('darkMode', 'true');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('darkMode', 'false');
		}
	}, [isDarkMode, mounted]);

	const toggleTheme = () => {
		setIsDarkMode((prev) => {
			const newValue = !prev;
			
			// Update DOM immediately for instant feedback
			const htmlElement = document.documentElement;
			if (newValue) {
				htmlElement.classList.add('dark');
				localStorage.setItem('darkMode', 'true');
			} else {
				htmlElement.classList.remove('dark');
				localStorage.setItem('darkMode', 'false');
			}
			
			return newValue;
		});
	};

	const setTheme = (theme: 'light' | 'dark') => {
		const newValue = theme === 'dark';
		setIsDarkMode(newValue);
		// Update DOM immediately
		if (newValue) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('darkMode', 'true');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('darkMode', 'false');
		}
	};

	return (
		<ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

