'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setNavigating } from '@/utils/navigationState';

/**
 * NavigationProvider
 * Tracks route changes globally and prevents sounds during navigation
 */
export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const pathname = usePathname();

	useEffect(() => {
		// Set navigation state immediately when pathname changes
		// This happens before components re-render
		setNavigating(true);
	}, [pathname]);

	return <>{children}</>;
};

