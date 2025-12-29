'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// User interface
export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role?: string;
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

	// Authentication methods
	updateUser: (updates: Partial<User>) => void;

	// Token management
	getAccessToken: () => string | null;
	getRefreshToken: () => string | null;
	setTokens: (tokens: AuthTokens) => void;
	clearTokens: () => void;

	// Session management
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
	storageKey = 'auth_data',
}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [tokens, setTokensState] = useState<AuthTokens | null>(null);

	// Load auth data from localStorage on mount
	useEffect(() => {
		if (typeof window === 'undefined') {
			setIsLoading(false);
			return;
		}

		try {
			// Try loading from individual keys first (app standard)
			const storedUser = localStorage.getItem('peoplely-user');
			const storedToken = localStorage.getItem('token');
			
			if (storedUser && storedToken) {
				const parsedUser = JSON.parse(storedUser);
				setUser(parsedUser);
				setTokensState({ accessToken: storedToken });
			} else {
				// Fallback to legacy/bundled storage key
				const stored = localStorage.getItem(storageKey);
				if (stored) {
					const parsed = JSON.parse(stored);
					if (parsed.user) {
						setUser(parsed.user);
					}
					if (parsed.tokens) {
						setTokensState(parsed.tokens);
					}
				}
			}
		} catch (error) {
			console.error('Error loading auth data from storage:', error);
			clearAuthData();
		} finally {
			setIsLoading(false);
		}
	}, [storageKey]);

	// Save auth data to localStorage
	const saveAuthData = useCallback((userData: User | null, tokenData: AuthTokens | null) => {
		if (typeof window === 'undefined') return;

		try {
			if (userData && tokenData) {
				localStorage.setItem(storageKey, JSON.stringify({
					user: userData,
					tokens: tokenData,
				}));
			} else {
				localStorage.removeItem(storageKey);
			}
		} catch (error) {
			console.error('Error saving auth data to storage:', error);
		}
	}, [storageKey]);

	// Clear auth data
	const clearAuthData = useCallback(() => {
		setUser(null);
		setTokensState(null);
		if (typeof window !== 'undefined') {
			localStorage.removeItem(storageKey);
		}
	}, [storageKey]);

	// Set tokens
	const setTokens = useCallback((tokenData: AuthTokens) => {
		setTokensState(tokenData);
		if (user) {
			saveAuthData(user, tokenData);
		}
	}, [user, saveAuthData]);

	// Clear tokens
	const clearTokens = useCallback(() => {
		setTokensState(null);
		if (user) {
			saveAuthData(user, null);
		}
	}, [user, saveAuthData]);

	// Get access token
	const getAccessToken = useCallback(() => {
		return tokens?.accessToken || null;
	}, [tokens]);

	// Get refresh token
	const getRefreshToken = useCallback(() => {
		return tokens?.refreshToken || null;
	}, [tokens]);

	// Validate token
	const validateToken = useCallback(() => {
		if (!tokens?.accessToken) return false;

		// Check if token has expiration
		if (tokens.expiresIn) {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					const savedAt = parsed.savedAt;
					if (savedAt) {
						const expiresAt = savedAt + (tokens.expiresIn * 1000);
						if (Date.now() >= expiresAt) {
							return false;
						}
					}
				} catch {
					// If we can't parse, assume valid
				}
			}
		}

		return true;
	}, [tokens, storageKey]);

	// Check authentication
	const checkAuth = useCallback(async () => {
		if (!validateToken()) {
			clearAuthData();
			return false;
		}

		// Optionally verify token with backend
		try {
			const token = getAccessToken();
			if (!token) {
				clearAuthData();
				return false;
			}

			// You can add an API call here to verify token
			// const response = await fetch(`${apiBaseUrl}/auth/verify`, {
			//   headers: { Authorization: `Bearer ${token}` }
			// });
			// if (!response.ok) {
			//   clearAuthData();
			//   return false;
			// }

			return true;
		} catch (error) {
			console.error('Error checking auth:', error);
			clearAuthData();
			return false;
		}
	}, [validateToken, getAccessToken, clearAuthData]);

	// Update user
	const updateUser = useCallback((updates: Partial<User>) => {
		if (user) {
			const updatedUser = { ...user, ...updates };
			setUser(updatedUser);
			if (tokens) {
				saveAuthData(updatedUser, tokens);
			}
		}
	}, [user, tokens, saveAuthData]);

	const contextValue: AuthContextType = {
		user,
		isAuthenticated: !!user && !!tokens?.accessToken && validateToken(),
		isLoading,
		updateUser,
		getAccessToken,
		getRefreshToken,
		setTokens,
		clearTokens,
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
