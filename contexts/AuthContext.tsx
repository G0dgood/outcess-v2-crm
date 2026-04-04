'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// User interface
export interface User {
	id: string;
	email: string;
	name: string;
	username?: string;
	firstName?: string;
	lastName?: string;
	status?: string;
	avatar?: string;
	role?: string | { roleName: string; permissions: any[] };
	isTeamMember?: boolean;
	companyId?: string;
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
	apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api',
	storageKey = 'peoplely_auth',
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tokens, setTokensState] = useState<AuthTokens | null>(null);
	const [isMfaVerified, setIsMfaVerified] = useState(false);
	const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

	const clearAuthData = useCallback(() => {
		setUser(null);
		setTokensState(null);
		setIsMfaVerified(false);
		if (sessionTimeout) clearTimeout(sessionTimeout);
		if (typeof window !== 'undefined') {
			localStorage.removeItem(storageKey);
			localStorage.removeItem('peoplely-token');
			localStorage.removeItem('peoplely-user');
			localStorage.removeItem('userPrivileges');
			localStorage.removeItem('peoplely_auth');
		}
	}, [storageKey, sessionTimeout]);

	const logout = useCallback(() => {
		clearAuthData();
		// Redirect to login if needed, or let components handle it
		if (typeof window !== 'undefined') {
			window.location.href = '/login';
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
	}, [storageKey]);

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
					console.log('Session expired, logging out...');
					logout();
				}, tokens.expiresIn * 1000);
				setSessionTimeout(timeout);
			}
		}
	}, [user, tokens, isMfaVerified, storageKey]);

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
