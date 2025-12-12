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

		// Play slow network sound (warning tone)
		if (networkSpeed === 'slow' && isOnline && !hasPlayedSlowNetworkSound.current) {
			hasPlayedSlowNetworkSound.current = true;
			playNotificationSound('warning', 'offlineBanner');
		}

		// Reset slow network sound flag when network is fast
		if (networkSpeed === 'fast') {
			hasPlayedSlowNetworkSound.current = false;
		}
	}, [isReconnected, networkSpeed, isOnline, pathname]);

	// Show reconnected banner (green)
	if (isReconnected) {
		return (
			<div
				className="fixed top-0 left-0 right-0 z-[9999] text-white px-4 py-3 shadow-lg transition-all duration-300 animate-in slide-in-from-top"
				style={{
					backgroundColor: 'var(--status-success)',
					color: 'var(--text-inverse)',
				}}
			>
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<svg
							className="w-5 h-5 shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
							<span className="font-medium text-sm sm:text-base">
								Connection restored!
							</span>
							{queueSize > 0 && (
								<span className="text-xs sm:text-sm opacity-90">
									Sending {queueSize} {queueSize === 1 ? 'message' : 'messages'}...
								</span>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-white rounded-full"></div>
						<span className="text-xs sm:text-sm opacity-90">Online</span>
					</div>
				</div>
			</div>
		);
	}

	// Show slow network banner (yellow/orange)
	if (networkSpeed === 'slow' && isOnline && status === 'connected') {
		return (
			<div
				className="fixed top-0 left-0 right-0 z-[9999] text-white px-4 py-3 shadow-lg transition-all duration-300"
				style={{
					backgroundColor: 'var(--status-warning)',
					color: 'var(--text-inverse)',
				}}
			>
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<svg
							className="w-5 h-5 shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
							<span className="font-medium text-sm sm:text-base">
								Slow network connection detected
							</span>
							<span className="text-xs sm:text-sm opacity-90">
								Some features may be slower than usual
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
						<span className="text-xs sm:text-sm opacity-90">Slow</span>
					</div>
				</div>
			</div>
		);
	}

	// Show offline banner (red)
	if (isOffline || status === 'offline' || !isOnline) {
		return (
			<div
				className="fixed top-0 left-0 right-0 z-[9999] text-white px-4 py-3 shadow-lg transition-all duration-300"
				style={{
					backgroundColor: 'var(--status-error)',
					color: 'var(--text-inverse)',
				}}
			>
				<div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<svg
							className="w-5 h-5 shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
							/>
						</svg>
						<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
							<span className="font-medium text-sm sm:text-base">
								You&apos;re currently offline
							</span>
							{queueSize > 0 && (
								<span className="text-xs sm:text-sm opacity-90">
									{queueSize} {queueSize === 1 ? 'message' : 'messages'} queued
								</span>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
						<span className="text-xs sm:text-sm opacity-90">Reconnecting...</span>
					</div>
				</div>
			</div>
		);
	}

	return null;
};

export default OfflineBanner;
