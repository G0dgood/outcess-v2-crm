'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setNavigating } from '@/utils/navigationState';
import { playNotificationSound } from '@/utils/soundEffects';

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

		// Play navigation sound if enabled
		// We play it here so it's tied to the actual route change
		playNotificationSound('info', 'navigation');
	}, [pathname]);

	return <>{children}</>;
};

