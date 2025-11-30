'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

// User interface
export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	role?: string;
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
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	refreshToken: () => Promise<void>;
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

	// Login
	const login = useCallback(async (credentials: LoginCredentials) => {
		setIsLoading(true);
		try {
			// Replace with your actual API endpoint
			const response = await fetch(`${apiBaseUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: credentials.email,
					password: credentials.password,
				}),
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({ message: 'Login failed' }));
				throw new Error(error.message || 'Login failed');
			}

			const data = await response.json();

			// Extract user and tokens from response
			const userData: User = data.user || {
				id: data.id || data.userId,
				email: data.email || credentials.email,
				name: data.name || data.fullName || '',
				avatar: data.avatar,
				role: data.role,
				companyId: data.companyId,
				companyName: data.companyName,
				phone: data.phone,
			};

			const tokenData: AuthTokens = {
				accessToken: data.accessToken || data.token,
				refreshToken: data.refreshToken,
				expiresIn: data.expiresIn || 3600, // Default 1 hour
				tokenType: data.tokenType || 'Bearer',
			};

			setUser(userData);
			setTokensState(tokenData);
			saveAuthData(userData, tokenData);

			// Save timestamp for expiration check
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem(storageKey);
				if (stored) {
					const parsed = JSON.parse(stored);
					parsed.savedAt = Date.now();
					localStorage.setItem(storageKey, JSON.stringify(parsed));
				}
			}
		} catch (error) {
			console.error('Login error:', error);
			clearAuthData();
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, [apiBaseUrl, storageKey, saveAuthData, clearAuthData]);

	// Register
	const register = useCallback(async (data: RegisterData) => {
		setIsLoading(true);
		try {
			const response = await fetch(`${apiBaseUrl}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({ message: 'Registration failed' }));
				throw new Error(error.message || 'Registration failed');
			}

			const result = await response.json();

			// After registration, you might want to auto-login
			// or redirect to login page
			if (result.user && result.accessToken) {
				const userData: User = result.user;
				const tokenData: AuthTokens = {
					accessToken: result.accessToken,
					refreshToken: result.refreshToken,
					expiresIn: result.expiresIn || 3600,
					tokenType: result.tokenType || 'Bearer',
				};

				setUser(userData);
				setTokensState(tokenData);
				saveAuthData(userData, tokenData);
			}
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, [apiBaseUrl, saveAuthData]);

	// Refresh token
	const refreshToken = useCallback(async () => {
		const refreshTokenValue = getRefreshToken();
		if (!refreshTokenValue) {
			throw new Error('No refresh token available');
		}

		try {
			const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refreshToken: refreshTokenValue }),
			});

			if (!response.ok) {
				throw new Error('Token refresh failed');
			}

			const data = await response.json();
			const tokenData: AuthTokens = {
				accessToken: data.accessToken || data.token,
				refreshToken: data.refreshToken || refreshTokenValue,
				expiresIn: data.expiresIn || 3600,
				tokenType: data.tokenType || 'Bearer',
			};

			setTokens(tokenData);
		} catch (error) {
			console.error('Token refresh error:', error);
			clearAuthData();
			throw error;
		}
	}, [apiBaseUrl, getRefreshToken, setTokens, clearAuthData]);

	// Logout
	const logout = useCallback(async () => {
		setIsLoading(true);
		try {
			const token = getAccessToken();
			if (token) {
				// Call logout endpoint to invalidate token on server
				try {
					await fetch(`${apiBaseUrl}/auth/logout`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
					});
				} catch (error) {
					console.error('Logout API error:', error);
					// Continue with local logout even if API call fails
				}
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			clearAuthData();
			setIsLoading(false);
		}
	}, [apiBaseUrl, getAccessToken, clearAuthData]);

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

	// Auto-refresh token before expiration
	useEffect(() => {
		if (!tokens?.expiresIn || !tokens?.refreshToken) return;

		const stored = localStorage.getItem(storageKey);
		if (!stored) return;

		try {
			const parsed = JSON.parse(stored);
			const savedAt = parsed.savedAt || Date.now();
			const expiresAt = savedAt + (tokens.expiresIn * 1000);
			const timeUntilExpiry = expiresAt - Date.now();
			const refreshTime = timeUntilExpiry - 60000; // Refresh 1 minute before expiry

			if (refreshTime > 0) {
				const timeout = setTimeout(() => {
					refreshToken().catch(console.error);
				}, refreshTime);

				return () => clearTimeout(timeout);
			}
		} catch (error) {
			console.error('Error setting up token refresh:', error);
		}
	}, [tokens, storageKey, refreshToken]);

	const contextValue: AuthContextType = {
		user,
		isAuthenticated: !!user && !!tokens?.accessToken && validateToken(),
		isLoading,
		login,
		logout,
		register,
		refreshToken,
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
