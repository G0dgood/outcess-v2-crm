'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// User interface
export interface User {
	_id: string;
	id: string;
	email: string;
	name: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	status?: string | {
		status: string;
		reason?: string;
		color?: string;
		isHibernate?: boolean;
		duration?: number;
		statusUpdatedAt?: string | Date;
	};
	avatar?: string;
	role?: string | { roleName: string; permissions: unknown[]; allBucketAccess?: boolean };
	isTeamMember?: boolean;
	isSupervisor?: boolean;
	userId?: string;
	companyId?: string;
	campaignId?: string;
	companyName?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
}

// Authentication tokens
export interface AuthTokens {
	accessToken: string;
	refreshToken?: string;
	expiresIn?: number;
	tokenType?: string;
}

// Login credentials
export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

// Auth context type
interface AuthContextType {
	// User state
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	isMfaVerified: boolean;

	// Authentication methods
	updateUser: (updates: Partial<User>) => void;
	logout: () => void;
	setMfaVerified: (verified: boolean) => void;

	// Token management
	getAccessToken: () => string | null;
	getRefreshToken: () => string | null;
	setTokens: (tokens: AuthTokens) => void;
	clearTokens: () => void;

	// Session management
	login: (user: User, tokens: AuthTokens) => void;
	checkAuth: () => Promise<boolean>;
	validateToken: () => boolean;
}

// Register data interface
export interface RegisterData {
	email: string;
	password: string;
	name: string;
	companyName?: string;
	phone?: string;
	[key: string]: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
	apiBaseUrl?: string;
	storageKey?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
	children,
	storageKey = 'outcess_auth',
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tokens, setTokensState] = useState<AuthTokens | null>(null);
	const [isMfaVerified, setIsMfaVerified] = useState(false);
	const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
	const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleTokenExpired = () => {
			setShowTokenExpiredModal(true);
		};

		window.addEventListener('token-expired', handleTokenExpired);
		return () => {
			window.removeEventListener('token-expired', handleTokenExpired);
		};
	}, []);

	const clearAuthData = useCallback(() => {
		setUser(null);
		setTokensState(null);
		setIsMfaVerified(false);
		if (sessionTimeout) clearTimeout(sessionTimeout);
		if (typeof window !== 'undefined') {
			localStorage.removeItem(storageKey);
			localStorage.removeItem('outcess-token');
			localStorage.removeItem('outcess-user');
			localStorage.removeItem('userPrivileges');
			localStorage.removeItem('outcess_auth');
		}
	}, [storageKey, sessionTimeout]);

	const logout = useCallback(() => {
		clearAuthData();
		// Redirect to login if needed, or let components handle it
		if (typeof window !== 'undefined') {
			window.location.href = '/';
		}
	}, [clearAuthData]);

	// Load auth data from localStorage on mount
	useEffect(() => {
		if (typeof window === 'undefined') {
			setIsLoading(false);
			return;
		}

		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				const { user: u, tokens: t, mfaVerified } = JSON.parse(stored);
				setUser(u);
				setTokensState(t);
				setIsMfaVerified(mfaVerified || false);
			}
		} catch (error) {
			console.error('Error loading auth data from storage:', error);
			clearAuthData();
		} finally {
			setIsLoading(false);
		}
	}, [storageKey, clearAuthData]);

	// Save auth data to localStorage and handle session timeout
	useEffect(() => {
		if (typeof window === 'undefined') return;

		if (user && tokens) {
			localStorage.setItem(storageKey, JSON.stringify({
				user,
				tokens,
				mfaVerified: isMfaVerified,
				savedAt: Date.now()
			}));

			// Set auto-logout timer if expiresIn is provided
			if (tokens.expiresIn) {
				if (sessionTimeout) clearTimeout(sessionTimeout);
				const timeout = setTimeout(() => {
					logout();
				}, tokens.expiresIn * 1000);
				setSessionTimeout(timeout);
			}
		}
	}, [user, tokens, isMfaVerified, storageKey, logout, sessionTimeout]);

	const setTokens = useCallback((tokenData: AuthTokens) => {
		setTokensState(tokenData);
	}, []);

	const clearTokens = useCallback(() => {
		setTokensState(null);
	}, []);

	const getAccessToken = useCallback(() => {
		return tokens?.accessToken || null;
	}, [tokens]);

	const getRefreshToken = useCallback(() => {
		return tokens?.refreshToken || null;
	}, [tokens]);

	const validateToken = useCallback(() => {
		if (!tokens?.accessToken) return false;
		// More robust validation could happen here
		return true;
	}, [tokens]);

	const checkAuth = useCallback(async () => {
		if (!validateToken()) {
			clearAuthData();
			return false;
		}
		return true;
	}, [validateToken, clearAuthData]);

	const updateUser = useCallback((updates: Partial<User>) => {
		setUser(prev => prev ? { ...prev, ...updates } : null);
	}, []);

	const setMfaVerified = useCallback((verified: boolean) => {
		setIsMfaVerified(verified);
	}, []);

	const login = useCallback((userData: User, tokenData: AuthTokens) => {
		setUser(userData);
		setTokensState(tokenData);
		setIsMfaVerified(false);
	}, []);

	const contextValue: AuthContextType = {
		user,
		isAuthenticated: !!user && !!tokens?.accessToken && validateToken(),
		isLoading,
		isMfaVerified,
		updateUser,
		logout,
		setMfaVerified,
		getAccessToken,
		getRefreshToken,
		setTokens,
		clearTokens,
		login,
		checkAuth,
		validateToken,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{children}

			{showTokenExpiredModal && (
				<div className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-[9999]">
					<div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4 shadow-xl border dark:border-gray-700 text-center animate-fade-in">
						<div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4 text-red-600">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Token Expired</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
							Your session has expired. Please click OK to log out and sign in again.
						</p>
						<button
							onClick={() => {
								setShowTokenExpiredModal(false);
								if (typeof window !== 'undefined') {
									(window as any).__tokenExpiredModalShowing = false;
								}
								logout();
							}}
							className="w-full py-2 px-4 text-white font-medium rounded-md transition-colors"
							style={{ backgroundColor: 'var(--primary, #4F46E5)' }}
						>
							OK
						</button>
					</div>
				</div>
			)}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export default AuthContext;
