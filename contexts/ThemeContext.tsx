'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface ThemeContextType {
	isDarkMode: boolean;
	toggleTheme: () => void;
	setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LIGHT_ONLY_PATH_PREFIXES = ['/blog', '/about', '/careers'];

const isLightOnlyPath = (path: string) =>
	LIGHT_ONLY_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	// Initialize from localStorage on mount
	useEffect(() => {
		setMounted(true);
		// Check localStorage for saved theme preference
		const savedTheme = localStorage.getItem('darkMode');
		const shouldBeDark = savedTheme === 'true';
		setIsDarkMode(shouldBeDark);
		
		// Marketing pages stay in light mode; login and app pages respect saved preference
		if (isLightOnlyPath(window.location.pathname)) {
			document.documentElement.classList.remove('dark');
		} else if (shouldBeDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}, []);

	// Update DOM and localStorage when isDarkMode changes (after mount)
	useEffect(() => {
		if (!mounted) return;
		
		if (pathname && isLightOnlyPath(pathname)) {
			document.documentElement.classList.remove('dark');
			return;
		}

		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('darkMode', 'true');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('darkMode', 'false');
		}
	}, [isDarkMode, mounted, pathname]);

	const applyThemeToDocument = (dark: boolean) => {
		if (typeof window !== 'undefined' && isLightOnlyPath(window.location.pathname)) {
			document.documentElement.classList.remove('dark');
			return;
		}

		if (dark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('darkMode', 'true');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('darkMode', 'false');
		}
	};

	const toggleTheme = () => {
		setIsDarkMode((prev) => {
			const newValue = !prev;
			applyThemeToDocument(newValue);
			return newValue;
		});
	};

	const setTheme = (theme: 'light' | 'dark') => {
		const newValue = theme === 'dark';
		setIsDarkMode(newValue);
		applyThemeToDocument(newValue);
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

