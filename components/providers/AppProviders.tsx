'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PrivilegeProvider } from '@/contexts/PrivilegeContext';

interface AppProvidersProps {
	children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
	return (
		<ThemeProvider>
			<PrivilegeProvider>
				{children}
			</PrivilegeProvider>
		</ThemeProvider>
	);
};

