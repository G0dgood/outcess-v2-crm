'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toastSuccess, toastInfo } from '@/utils/toastWithSound';
import { useAuth } from './AuthContext';

// Socket connection status
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting' | 'offline';

// Measured network quality.
// - 'fast'      : healthy round-trip latency
// - 'slow'      : elevated latency, still usable
// - 'very-slow' : latency so high / request timing out that the connection is
//                 effectively unusable ("bad network" / "network too slow")
// - 'unknown'   : not yet measured, or the browser reports offline
export type NetworkSpeed = 'fast' | 'slow' | 'very-slow' | 'unknown';

// Message types
export interface SocketMessage {
	type: string;
	payload?: unknown;
	timestamp?: number;
	[id: string]: unknown;
}

// Event handler type
export type SocketEventHandler = (message: unknown) => void;

// Socket configuration
export interface SocketConfig {
	url: string;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
	autoConnect?: boolean;
	enableOfflineMode?: boolean;
	maxQueueSize?: number;
	persistQueue?: boolean;
	queueStorageKey?: string;
}

interface SocketContextType {
	// Connection status
	status: SocketStatus;
	isConnected: boolean;
	isOnline: boolean;
	isOffline: boolean;
	isReconnected: boolean;
	networkSpeed: NetworkSpeed;
	socket: Socket | null;

	// Connection methods
	connect: (url?: string) => void;
	disconnect: () => void;
	reconnect: () => void;

	// Message methods
	emit: (event: string, data?: unknown) => void;
	send: (message: SocketMessage) => void;

	// Event listeners
	on: (event: string, handler: SocketEventHandler) => void;
	off: (event: string, handler: SocketEventHandler) => void;

	// Offline mode methods
	enableOfflineMode: () => void;
	disableOfflineMode: () => void;
	clearMessageQueue: () => void;
	getQueuedMessages: () => unknown[];
	getQueueSize: () => number;

	// Connection info
	reconnectAttempts: number;
	lastError: Error | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
	children: ReactNode;
	config?: Partial<SocketConfig>;
}

interface QueuedMessage {
	event: string;
	data: unknown;
	timestamp?: number;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, config }) => {
	const [status, setStatus] = useState<SocketStatus>('disconnected');
	const [socket, setSocket] = useState<Socket | null>(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const [lastError, setLastError] = useState<Error | null>(null);
	const [isOnline, setIsOnline] = useState(true);
	const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
	const [isReconnected, setIsReconnected] = useState(false);
	const { isAuthenticated } = useAuth();
	const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>('unknown');
	const networkSpeedRef = useRef<NetworkSpeed>('unknown');

	const socketRef = useRef<Socket | null>(null);
	const messageQueueRef = useRef<QueuedMessage[]>([]);
	const isSyncingDispositionsRef = useRef(false);

	const {
		url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
		autoConnect = true,
		enableOfflineMode: configEnableOfflineMode = true,
		maxQueueSize = 100,
		persistQueue = true,
		queueStorageKey = 'socket_message_queue',
	} = config || {};

	// Monitor network status
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleOnline = async () => {
			setIsOnline(true);

			// Show reconnected banner when network comes back
			setIsReconnected(true);
			setTimeout(() => setIsReconnected(false), 3000);

			// Update status immediately based on socket state
			if (socketRef.current?.connected) {
				setStatus('connected');
			} else {
				setStatus('connecting');
				// Attempt to reconnect
				if (socketRef.current) {
					socketRef.current.connect();
				}
			}
		};

		const handleOffline = () => {
			setIsOnline(false);
			setStatus('offline');
		};

		// Set initial state
		setIsOnline(navigator.onLine);
		if (!navigator.onLine) {
			setStatus('offline');
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Network speed monitoring
		const connection = (navigator as NavigatorWithConnection).connection ||
			(navigator as NavigatorWithConnection).mozConnection ||
			(navigator as NavigatorWithConnection).webkitConnection;

		const updateNetworkSpeed = () => {
			if (connection) {
				const type = connection.effectiveType;
				// 'slow-2g', '2g', '3g', or '4g'. This API is unsupported in
				// Safari/Firefox and only a coarse hint, so we use it just to flag
				// clearly-poor radio connections (2g). The active latency probe
				// below is authoritative for fast / slow / very-slow.
				if (type === 'slow-2g' || type === '2g') {
					networkSpeedRef.current = 'slow';
					setNetworkSpeed((prev) => (prev === 'very-slow' ? prev : 'slow'));
				}
			}
		};

		if (connection) {
			updateNetworkSpeed();
			connection.addEventListener?.('change', updateNetworkSpeed);
		}

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
			if (connection) {
				connection.removeEventListener?.('change', updateNetworkSpeed);
			}
		};
	}, []);

	// Actively measure real round-trip latency to the API and classify it. This
	// catches genuinely slow/laggy connections that the coarse
	// navigator.connection.effectiveType (unsupported in Safari/Firefox) misses,
	// and distinguishes "slow" from "very slow / unusable".
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const probeBase = (process.env.NEXT_PUBLIC_API_URL || url || '').replace(/\/+$/, '');
		if (!probeBase) return;

		const SLOW_MS = 1000;       // > 1s round-trip  -> slow
		const VERY_SLOW_MS = 2500;  // > 2.5s round-trip -> very slow / bad network
		const TIMEOUT_MS = 6000;    // no response in 6s -> treat as very slow
		const INTERVAL_MS = 30 * 60 * 1000;  // re-check every 30 minutes

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const apply = (speed: NetworkSpeed) => {
			networkSpeedRef.current = speed;
			setNetworkSpeed(speed);
		};

		const probe = async () => {
			if (cancelled) return;

			// Browser says we're offline, or the tab is hidden — don't probe. The
			// offline banner covers the offline case; hidden tabs don't need checks.
			if (!navigator.onLine || document.hidden) {
				if (!navigator.onLine) apply('unknown');
				timer = setTimeout(probe, INTERVAL_MS);
				return;
			}

			const controller = new AbortController();
			const to = setTimeout(() => controller.abort(), TIMEOUT_MS);
			const start = performance.now();
			try {
				// `no-cors` keeps this working cross-origin without CORS setup — we
				// only need the round-trip timing, not the (opaque) response body.
				await fetch(`${probeBase}/?_ping=${Date.now()}`, {
					method: 'GET',
					cache: 'no-store',
					mode: 'no-cors',
					signal: controller.signal,
				});
				const rtt = performance.now() - start;
				clearTimeout(to);
				if (cancelled) return;
				if (rtt >= VERY_SLOW_MS) apply('very-slow');
				else if (rtt >= SLOW_MS) apply('slow');
				else apply('fast');
			} catch {
				clearTimeout(to);
				if (cancelled) return;
				// Timed out or failed while the browser still reports online — the
				// connection is effectively unusable / far too slow.
				apply(navigator.onLine ? 'very-slow' : 'unknown');
			} finally {
				if (!cancelled) timer = setTimeout(probe, INTERVAL_MS);
			}
		};

		// Probe immediately, and again as soon as connectivity returns.
		probe();
		const onBackOnline = () => probe();
		window.addEventListener('online', onBackOnline);

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
			window.removeEventListener('online', onBackOnline);
		};
	}, [url]);

	// Load queued messages from localStorage on mount
	useEffect(() => {
		if (persistQueue && typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(queueStorageKey);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (Array.isArray(parsed)) {
						messageQueueRef.current = parsed;
					}
				}
			} catch (error) {
				console.error('Error loading message queue from storage:', error);
			}
		}
	}, [persistQueue, queueStorageKey]);

	// Save queued messages to localStorage
	const saveQueueToStorage = useCallback(() => {
		if (persistQueue && typeof window !== 'undefined') {
			try {
				localStorage.setItem(queueStorageKey, JSON.stringify(messageQueueRef.current));
			} catch (error) {
				console.error('Error saving message queue to storage:', error);
			}
		}
	}, [persistQueue, queueStorageKey]);

	const flushMessageQueue = useCallback(() => {
		if (!socketRef.current || !socketRef.current.connected) return;

		const queue = [...messageQueueRef.current];
		messageQueueRef.current = [];

		queue.forEach((msg) => {
			try {
				socketRef.current?.emit(msg.event, msg.data);
			} catch (error) {
				console.error('Error flushing queued message:', error);
				messageQueueRef.current.push(msg);
			}
		});

		saveQueueToStorage();
	}, [saveQueueToStorage]);

	const connect = useCallback((customUrl?: string) => {
		if (socketRef.current?.connected) return;

		const wsUrl = customUrl || url;

		try {
			setStatus('connecting');
			const newSocket = io(wsUrl, {
				autoConnect: true,
				reconnection: true,
			});

			newSocket.on('connect', () => {
				setStatus('connected');
				setLastError(null);
				setReconnectAttempts(0);
				setIsReconnected(true);
				setTimeout(() => setIsReconnected(false), 3000);
				flushMessageQueue();
			});

			newSocket.on('disconnect', (reason) => {
				setStatus('disconnected');
				if (reason === 'io server disconnect') {
					newSocket.connect();
				}
			});

			newSocket.on('connect_error', (error) => {
				console.error('Socket connection error:', error);
				setStatus('error');
				setLastError(error);
			});

			setSocket(newSocket);
			socketRef.current = newSocket;

		} catch (error) {
			console.error('Error creating socket connection:', error);
			setStatus('error');
			setLastError(error instanceof Error ? error : new Error('Unknown error'));
		}
	}, [url, flushMessageQueue]);

	const disconnect = useCallback(() => {
		if (socketRef.current) {
			socketRef.current.disconnect();
			setSocket(null);
			socketRef.current = null;
			setStatus('disconnected');
		}
	}, []);

	const reconnect = useCallback(() => {
		disconnect();
		setTimeout(() => connect(), 100);
	}, [disconnect, connect]);

	const emit = useCallback((event: string, data?: unknown) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(event, data);
		} else if (offlineModeEnabled) {
			if (messageQueueRef.current.length >= maxQueueSize) {
				messageQueueRef.current.shift();
			}
			messageQueueRef.current.push({ event, data, timestamp: Date.now() });
			saveQueueToStorage();
		}
	}, [offlineModeEnabled, maxQueueSize, saveQueueToStorage]);

	const send = useCallback((message: SocketMessage) => {
		emit(message.type, message.payload);
	}, [emit]);

	const on = useCallback((event: string, handler: SocketEventHandler) => {
		socketRef.current?.on(event, handler);
	}, []);

	const off = useCallback((event: string, handler: SocketEventHandler) => {
		socketRef.current?.off(event, handler);
	}, []);

	// Auto-Sync for Offline Dispositions when both online and connected and authenticated






	// Auto-connect
	useEffect(() => {
		if (autoConnect) {
			connect();
		}
		return () => {
			disconnect();
		};
	}, [autoConnect, connect, disconnect]);

	const contextValue: SocketContextType = {
		status,
		isConnected: status === 'connected',
		isOnline,
		isOffline: !isOnline || status === 'offline',
		isReconnected,
		networkSpeed,
		socket,
		connect,
		disconnect,
		reconnect,
		emit,
		send,
		on,
		off,
		enableOfflineMode: () => setOfflineModeEnabled(true),
		disableOfflineMode: () => setOfflineModeEnabled(false),
		clearMessageQueue: () => {
			messageQueueRef.current = [];
			saveQueueToStorage();
		},
		getQueuedMessages: () => [...messageQueueRef.current],
		getQueueSize: () => messageQueueRef.current.length,
		reconnectAttempts,
		lastError,
	};

	return (
		<SocketContext.Provider value={contextValue}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
};

export default SocketContext;

type NetworkConnection = {
	effectiveType?: string;
	addEventListener?: (type: 'change', listener: () => void) => void;
	removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
	connection?: NetworkConnection;
	mozConnection?: NetworkConnection;
	webkitConnection?: NetworkConnection;
};
