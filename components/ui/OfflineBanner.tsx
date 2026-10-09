'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { setNavigating } from '@/utils/navigationState';
import { playNotificationSound } from '@/utils/soundEffects';

const OfflineBanner: React.FC = () => {
	const { isOffline, getQueueSize, status, isOnline, isReconnected, networkSpeed } = useSocket();
	const pathname = usePathname();
	const queueSize = getQueueSize();
	const hasPlayedReconnectSound = useRef(false);
	const hasPlayedSlowNetworkSound = useRef(false);
	const previousPathname = useRef(pathname);
	const isNavigating = useRef(false);

	// Track navigation to prevent sounds during page switches
	useEffect(() => {
		if (previousPathname.current !== pathname) {
			isNavigating.current = true;
			previousPathname.current = pathname;
			// Set global navigation state
			setNavigating(true);
			// Reset navigation flag after a short delay
			setTimeout(() => {
				isNavigating.current = false;
			}, 1000);
		}
	}, [pathname]);

	// Play sound notifications (but not during navigation)
	useEffect(() => {
		if (typeof window === 'undefined') return;

		// Don't play sounds if we're navigating between pages
		if (isNavigating.current) return;

		// Play reconnection sound (successful chime)
		if (isReconnected && !hasPlayedReconnectSound.current) {
			hasPlayedReconnectSound.current = true;
			playNotificationSound('success', 'offlineBanner');
		}

		// Reset reconnect sound flag when not reconnected
		if (!isReconnected) {
			hasPlayedReconnectSound.current = false;
		}

		// Play slow network sound (warning tone) for slow / very-slow
		if ((networkSpeed === 'slow' || networkSpeed === 'very-slow') && isOnline && !hasPlayedSlowNetworkSound.current) {
			hasPlayedSlowNetworkSound.current = true;
			playNotificationSound('warning', 'offlineBanner');
		}

		// Reset slow network sound flag when network is healthy again
		if (networkSpeed === 'fast') {
			hasPlayedSlowNetworkSound.current = false;
		}
	}, [isReconnected, networkSpeed, isOnline, pathname]);

	// Banners converted to tiny dot in header; return null here so the UI is never blocked
	return null;
};

export default OfflineBanner;
