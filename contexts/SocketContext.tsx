'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';

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
export type SocketEventHandler = (message: SocketMessage) => void;

// Socket configuration
export interface SocketConfig {
	url: string;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
	autoConnect?: boolean;
	protocols?: string | string[];
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
	socket: WebSocket | null;

	// Connection methods
	connect: (url?: string) => void;
	disconnect: () => void;
	reconnect: () => void;

	// Message methods
	send: (message: SocketMessage | string) => void;
	sendJSON: (data: unknown) => void;

	// Event listeners
	on: (event: string, handler: SocketEventHandler) => void;
	off: (event: string, handler: SocketEventHandler) => void;
	once: (event: string, handler: SocketEventHandler) => void;

	// Offline mode methods
	enableOfflineMode: () => void;
	disableOfflineMode: () => void;
	clearMessageQueue: () => void;
	getQueuedMessages: () => SocketMessage[];
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
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	const [lastError, setLastError] = useState<Error | null>(null);
	const [isOnline, setIsOnline] = useState(true);
	const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
	const [isReconnected, setIsReconnected] = useState(false);
	const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');
	const previousStatusRef = useRef<SocketStatus>('disconnected');

	const socketRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const eventHandlersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());
	const reconnectAttemptsRef = useRef(0);
	const messageQueueRef = useRef<SocketMessage[]>([]);

	const {
		url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
		reconnectInterval = 3000,
		maxReconnectAttempts = 5,
		autoConnect = false,
		protocols,
		enableOfflineMode: configEnableOfflineMode = true,
		maxQueueSize = 100,
		persistQueue = true,
		queueStorageKey = 'socket_message_queue',
	} = config || {};

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

	const cleanup = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
		if (socketRef.current) {
			socketRef.current.onopen = null;
			socketRef.current.onclose = null;
			socketRef.current.onerror = null;
			socketRef.current.onmessage = null;
			if (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING) {
				socketRef.current.close();
			}
			socketRef.current = null;
		}
	}, []);

	const handleMessage = useCallback((event: MessageEvent) => {
		try {
			let message: SocketMessage;

			if (typeof event.data === 'string') {
				message = JSON.parse(event.data);
			} else {
				message = event.data;
			}

			// Add timestamp if not present
			if (!message.timestamp) {
				message.timestamp = Date.now();
			}

			// Call all handlers for the message type
			const handlers = eventHandlersRef.current.get(message.type);
			if (handlers) {
				handlers.forEach((handler) => {
					try {
						handler(message);
					} catch (error) {
						console.error(`Error in socket event handler for ${message.type}:`, error);
					}
				});
			}

			// Also call wildcard handlers
			const wildcardHandlers = eventHandlersRef.current.get('*');
			if (wildcardHandlers) {
				wildcardHandlers.forEach((handler) => {
					try {
						handler(message);
					} catch (error) {
						console.error('Error in wildcard socket event handler:', error);
					}
				});
			}
		} catch (error) {
			console.error('Error parsing socket message:', error);
		}
	}, []);

	// Flush queued messages when connection is restored
	const flushMessageQueue = useCallback(() => {
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			return;
		}

		const queue = [...messageQueueRef.current];
		messageQueueRef.current = [];

		queue.forEach((message) => {
			try {
				if (typeof message === 'string') {
					socketRef.current?.send(message);
				} else {
					socketRef.current?.send(JSON.stringify(message));
				}
			} catch (error) {
				console.error('Error flushing queued message:', error);
				// Re-queue failed messages
				messageQueueRef.current.push(message);
			}
		});

		saveQueueToStorage();
	}, [saveQueueToStorage]);

	// Network speed detection
	const checkNetworkSpeed = useCallback(async () => {
		if (!navigator.onLine) {
			setNetworkSpeed('unknown');
			return;
		}

		const connection =
			(navigator as NavigatorWithConnection).connection ||
			(navigator as NavigatorWithConnection).mozConnection ||
			(navigator as NavigatorWithConnection).webkitConnection;
		if (!connection) {
			setNetworkSpeed('unknown');
			return;
		}

		// Check effective connection type
		const effectiveType = connection.effectiveType;
		if (effectiveType === 'slow-2g' || effectiveType === '2g') {
			setNetworkSpeed('slow');
		} else if (effectiveType === '3g' || effectiveType === '4g') {
			setNetworkSpeed('fast');
		} else {
			// Fallback: measure download speed
			try {
				const startTime = performance.now();
				const response = await fetch('/api/ping', { cache: 'no-cache' }).catch(() => null);
				const endTime = performance.now();

				if (response) {
					const duration = endTime - startTime;
					// If response takes more than 2 seconds, consider it slow
					setNetworkSpeed(duration > 2000 ? 'slow' : 'fast');
				} else {
					setNetworkSpeed('slow');
				}
			} catch {
				setNetworkSpeed('unknown');
			}
		}
	}, []);

	// Network status detection
	useEffect(() => {
		if (!configEnableOfflineMode) return;

		const handleOnline = () => {
			setIsOnline(true);
			if (status === 'offline' || previousStatusRef.current === 'offline' || previousStatusRef.current === 'reconnecting') {
				setIsReconnected(true);
				// Hide reconnected banner after 3 seconds
				setTimeout(() => setIsReconnected(false), 3000);
			}
			if (status === 'offline') {
				setStatus('disconnected');
			}
			// Flush queued messages when back online
			flushMessageQueue();
			checkNetworkSpeed();
		};

		const handleOffline = () => {
			setIsOnline(false);
			setIsReconnected(false);
			if (offlineModeEnabled) {
				setStatus('offline');
			}
		};

		// Set initial online status
		setIsOnline(navigator.onLine);
		checkNetworkSpeed();

		// Monitor connection changes
		const connection =
			(navigator as NavigatorWithConnection).connection ||
			(navigator as NavigatorWithConnection).mozConnection ||
			(navigator as NavigatorWithConnection).webkitConnection;
		if (connection) {
			connection?.addEventListener?.('change', checkNetworkSpeed);
		}

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			if (connection) {
				connection?.removeEventListener?.('change', checkNetworkSpeed);
			}
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, [configEnableOfflineMode, offlineModeEnabled, status, flushMessageQueue, checkNetworkSpeed]);

	const connect = useCallback((customUrl?: string) => {
		// Clean up existing connection
		cleanup();

		const wsUrl = customUrl || url;
		if (!wsUrl) {
			console.error('Socket URL is required');
			setLastError(new Error('Socket URL is required'));
			setStatus('error');
			return;
		}

		try {
			setStatus('connecting');
			setLastError(null);

			const ws = protocols
				? new WebSocket(wsUrl, protocols)
				: new WebSocket(wsUrl);

			ws.onopen = () => {
				console.log('Socket connected');
				const wasReconnecting = previousStatusRef.current === 'reconnecting' || previousStatusRef.current === 'offline' || previousStatusRef.current === 'disconnected';
				setStatus('connected');
				setSocket(ws);
				socketRef.current = ws;
				setReconnectAttempts(0);
				reconnectAttemptsRef.current = 0;

				// Show reconnected banner if we were previously offline/reconnecting
				if (wasReconnecting && isOnline) {
					setIsReconnected(true);
					setTimeout(() => setIsReconnected(false), 3000);
				}

				// Flush queued messages when connected
				flushMessageQueue();
				checkNetworkSpeed();
			};

			ws.onclose = (event) => {
				console.log('Socket closed', event.code, event.reason);
				setSocket(null);
				socketRef.current = null;
				setStatus('disconnected');

				// Attempt to reconnect if not a normal closure
				if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
					setStatus('reconnecting');
					reconnectAttemptsRef.current += 1;
					setReconnectAttempts(reconnectAttemptsRef.current);

					reconnectTimeoutRef.current = setTimeout(() => {
						connect(wsUrl);
					}, reconnectInterval);
				} else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
					setStatus('error');
					setLastError(new Error('Max reconnection attempts reached'));
				}
			};

			ws.onerror = (error) => {
				console.error('Socket error:', error);
				setStatus('error');
				setLastError(new Error('WebSocket connection error'));
			};

			ws.onmessage = handleMessage;
		} catch (error) {
			console.error('Error creating socket connection:', error);
			setStatus('error');
			setLastError(error instanceof Error ? error : new Error('Unknown error'));
		}
	}, [url, protocols, reconnectInterval, maxReconnectAttempts, cleanup, handleMessage, flushMessageQueue, isOnline, checkNetworkSpeed]);

	const disconnect = useCallback(() => {
		cleanup();
		setStatus('disconnected');
		setSocket(null);
		setReconnectAttempts(0);
		reconnectAttemptsRef.current = 0;
	}, [cleanup]);

	const reconnect = useCallback(() => {
		disconnect();
		setTimeout(() => {
			connect();
		}, 100);
	}, [disconnect, connect]);

	const send = useCallback((message: SocketMessage | string) => {
		// If offline mode is enabled and we're offline, queue the message
		if (offlineModeEnabled && (!isOnline || status === 'offline')) {
			const messageToQueue: SocketMessage = typeof message === 'string'
				? { type: 'queued', payload: message, timestamp: Date.now() }
				: { ...message, timestamp: message.timestamp || Date.now() };

			// Check queue size limit
			if (messageQueueRef.current.length >= maxQueueSize) {
				console.warn('Message queue is full. Removing oldest message.');
				messageQueueRef.current.shift();
			}

			messageQueueRef.current.push(messageToQueue);
			saveQueueToStorage();
			console.log('Message queued (offline mode). Queue size:', messageQueueRef.current.length);
			return;
		}

		// If socket is not connected, queue if offline mode is enabled
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			if (offlineModeEnabled) {
				const messageToQueue: SocketMessage = typeof message === 'string'
					? { type: 'queued', payload: message, timestamp: Date.now() }
					: { ...message, timestamp: message.timestamp || Date.now() };

				if (messageQueueRef.current.length >= maxQueueSize) {
					messageQueueRef.current.shift();
				}

				messageQueueRef.current.push(messageToQueue);
				saveQueueToStorage();
				console.log('Message queued (socket not connected). Queue size:', messageQueueRef.current.length);
				return;
			}

			console.warn('Socket is not connected. Message not sent.');
			return;
		}

		try {
			if (typeof message === 'string') {
				socketRef.current.send(message);
			} else {
				socketRef.current.send(JSON.stringify(message));
			}
		} catch (error) {
			console.error('Error sending socket message:', error);
			setLastError(error instanceof Error ? error : new Error('Failed to send message'));

			// Queue message if offline mode is enabled
			if (offlineModeEnabled) {
				const messageToQueue: SocketMessage = typeof message === 'string'
					? { type: 'queued', payload: message, timestamp: Date.now() }
					: { ...message, timestamp: message.timestamp || Date.now() };

				if (messageQueueRef.current.length >= maxQueueSize) {
					messageQueueRef.current.shift();
				}

				messageQueueRef.current.push(messageToQueue);
				saveQueueToStorage();
			}
		}
	}, [offlineModeEnabled, isOnline, status, maxQueueSize, saveQueueToStorage]);

	const sendJSON = useCallback((data: unknown) => {
		send({
			type: 'message',
			payload: data,
			timestamp: Date.now(),
		});
	}, [send]);

	const on = useCallback((event: string, handler: SocketEventHandler) => {
		if (!eventHandlersRef.current.has(event)) {
			eventHandlersRef.current.set(event, new Set());
		}
		eventHandlersRef.current.get(event)!.add(handler);
	}, []);

	const off = useCallback((event: string, handler: SocketEventHandler) => {
		const handlers = eventHandlersRef.current.get(event);
		if (handlers) {
			handlers.delete(handler);
			if (handlers.size === 0) {
				eventHandlersRef.current.delete(event);
			}
		}
	}, []);

	const once = useCallback((event: string, handler: SocketEventHandler) => {
		const onceHandler = (message: SocketMessage) => {
			handler(message);
			off(event, onceHandler);
		};
		on(event, onceHandler);
	}, [on, off]);

	// Offline mode management
	const enableOfflineMode = useCallback(() => {
		setOfflineModeEnabled(true);
		if (!isOnline) {
			setStatus('offline');
		}
	}, [isOnline]);

	const disableOfflineMode = useCallback(() => {
		setOfflineModeEnabled(false);
		if (status === 'offline') {
			setStatus('disconnected');
		}
	}, [status]);

	const clearMessageQueue = useCallback(() => {
		messageQueueRef.current = [];
		if (persistQueue && typeof window !== 'undefined') {
			try {
				localStorage.removeItem(queueStorageKey);
			} catch (error) {
				console.error('Error clearing message queue from storage:', error);
			}
		}
	}, [persistQueue, queueStorageKey]);

	const getQueuedMessages = useCallback(() => {
		return [...messageQueueRef.current];
	}, []);

	const getQueueSize = useCallback(() => {
		return messageQueueRef.current.length;
	}, []);

	// Initialize offline mode
	useEffect(() => {
		if (configEnableOfflineMode) {
			setOfflineModeEnabled(true);
		}
	}, [configEnableOfflineMode]);

	// Track status changes
	useEffect(() => {
		previousStatusRef.current = status;
	}, [status]);

	// Auto-connect on mount if enabled
	useEffect(() => {
		if (autoConnect) {
			connect();
		}

		return () => {
			cleanup();
		};
	}, [autoConnect, connect, cleanup]);

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
		send,
		sendJSON,
		on,
		off,
		once,
		enableOfflineMode,
		disableOfflineMode,
		clearMessageQueue,
		getQueuedMessages,
		getQueueSize,
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

