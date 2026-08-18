'use client';

import React from 'react';
import { useSocket } from '@/contexts/SocketContext';

export const NetworkStatusDot: React.FC<{ className?: string }> = ({ className = '' }) => {
	const { isOffline, isOnline, status, networkSpeed, isReconnected } = useSocket();

	let dotColor = 'bg-emerald-500';
	let titleText = 'Online';
	let isPulsing = false;

	if (isOffline || status === 'offline' || !isOnline) {
		dotColor = 'bg-red-500';
		titleText = 'Offline';
		isPulsing = true;
	} else if (networkSpeed === 'very-slow') {
		dotColor = 'bg-orange-500';
		titleText = 'Very Slow Network';
		isPulsing = true;
	} else if (networkSpeed === 'slow') {
		dotColor = 'bg-amber-500';
		titleText = 'Slow Network';
		isPulsing = true;
	} else if (isReconnected) {
		dotColor = 'bg-emerald-500';
		titleText = 'Online';
		isPulsing = false;
	}

	return (
		<div
			className={`relative flex items-center justify-center ${className}`}
			title={titleText}
		>
			<span
				className={`w-2.5 h-2.5 rounded-full ${dotColor} ${isPulsing ? 'animate-pulse' : ''} transition-colors duration-300`}
			/>
			{isPulsing && (
				<span
					className={`absolute w-2.5 h-2.5 rounded-full ${dotColor} opacity-75 animate-ping`}
				/>
			)}
		</div>
	);
};

export default NetworkStatusDot;
