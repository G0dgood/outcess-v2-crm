'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket connection status
export type SocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting' | 'offline';

// Message types
export interface SocketMessage {
	type: string;
	payload?: unknown;
	timestamp?: number;
	[id: string]: unknown;
}

// Event handler type
export type SocketEventHandler = (message: any) => void;

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
	networkSpeed: 'fast' | 'slow' | 'unknown';
	socket: Socket | null;

	// Connection methods
	connect: (url?: string) => void;
	disconnect: () => void;
	reconnect: () => void;

	// Message methods
	emit: (event: string, data?: any) => void;
	send: (message: SocketMessage) => void;

	// Event listeners
	on: (event: string, handler: SocketEventHandler) => void;
	off: (event: string, handler: SocketEventHandler) => void;

	// Offline mode methods
	enableOfflineMode: () => void;
	disableOfflineMode: () => void;
	clearMessageQueue: () => void;
	getQueuedMessages: () => any[];
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

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, config }) => {
	const [status, setStatus] = useState<SocketStatus>('disconnected');
	const [socket, setSocket] = useState<Socket | null>(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const [lastError, setLastError] = useState<Error | null>(null);
	const [isOnline, setIsOnline] = useState(true);
	const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
	const [isReconnected, setIsReconnected] = useState(false);
	const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

	const socketRef = useRef<Socket | null>(null);
	const messageQueueRef = useRef<any[]>([]);

	const {
		url = process.env.base_url || 'http://localhost:8000',
		autoConnect = true,
		enableOfflineMode: configEnableOfflineMode = true,
		maxQueueSize = 100,
		persistQueue = true,
		queueStorageKey = 'socket_message_queue',
	} = config || {};

	// Monitor network status
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleOnline = () => {
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
				// 'slow-2g', '2g', '3g', or '4g'
				if (type === 'slow-2g' || type === '2g') {
					setNetworkSpeed('slow');
				} else {
					setNetworkSpeed('fast');
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

	const emit = useCallback((event: string, data?: any) => {
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
