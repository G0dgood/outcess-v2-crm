import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// User interface
export interface User {
    _id: string;
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role?: string;
    isTeamMember?: boolean;
    companyId?: string;
    companyName?: string;
    company?: {
        _id?: string;
        companyName?: string;
        [key: string]: unknown;
    };
    phone?: string;
    status?: {
        status: string;
        reason?: string;
        color?: string;
        isHibernate?: boolean;
        duration?: number;
        statusUpdatedAt?: string | Date;
    };
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

// Authentication tokens
export interface AuthTokens {
	accessToken: string;
	refreshToken?: string;
	expiresIn?: number; // seconds until access token expires
	tokenType?: string;
}

// Auth state interface
interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	savedAt: number | null; // timestamp when auth data was saved
}

// Storage key for localStorage
const AUTH_STORAGE_KEY = 'outcess-user';

// Load initial state from localStorage
const loadAuthFromStorage = (): Partial<AuthState> => {
	if (typeof window === 'undefined') {
		return {
			user: null,
			tokens: null,
			isAuthenticated: false,
			isLoading: false,
			savedAt: null,
		};
	}

	try {
		const storedUser = localStorage.getItem('outcess-user');
		const storedToken = localStorage.getItem('outcess-token');
		
		if (storedUser && storedToken) {
			const parsedUser = JSON.parse(storedUser);
			return {
				user: parsedUser,
				tokens: { accessToken: storedToken },
				isAuthenticated: true,
				isLoading: false,
				savedAt: Date.now(),
			};
		}
	} catch (error) {
		console.error('Error loading auth data from storage:', error);
	}

	return {
		user: null,
		tokens: null,
		isAuthenticated: false,
		isLoading: false,
		savedAt: null,
	};
};

// Save auth data to localStorage
const saveAuthToStorage = (state: AuthState) => {
	if (typeof window === 'undefined') return;

	try {
		if (state.user && state.tokens) {
			localStorage.setItem('outcess-user', JSON.stringify(state.user));
			localStorage.setItem('outcess-token', state.tokens.accessToken);
		} else {
			localStorage.removeItem('outcess-user');
			localStorage.removeItem('outcess-token');
		}
	} catch (error) {
		console.error('Error saving auth data to storage:', error);
	}
};

// Clear auth data from localStorage
const clearAuthFromStorage = () => {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem('outcess_auth');
		localStorage.removeItem('outcess-user');
		localStorage.removeItem('outcess-token');
		localStorage.removeItem('synced_dispositions');
		localStorage.removeItem('stickyNotes');
		localStorage.removeItem('userPrivileges');
		localStorage.removeItem('selectedCampaignId');
		localStorage.removeItem('outcess-setup-data');
	} catch (error) {
		console.error('Error clearing auth data from storage:', error);
	}
};

// Initial state
const initialState: AuthState = {
	user: null,
	tokens: null,
	isAuthenticated: false,
	isLoading: false,
	savedAt: null,
	...loadAuthFromStorage(),
};

// Auth slice
const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		// Set loading state
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		// Login action - sets user and tokens
		login: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
			state.user = action.payload.user;
			state.tokens = action.payload.tokens;
			state.isAuthenticated = true;
			state.isLoading = false;
			state.savedAt = Date.now();
			saveAuthToStorage(state);
		},

		// Logout action - clears all auth data
		logout: (state) => {
			state.user = null;
			state.tokens = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.savedAt = null;
			clearAuthFromStorage();
		},

		// Set tokens
		setTokens: (state, action: PayloadAction<AuthTokens>) => {
			state.tokens = action.payload;
			state.savedAt = Date.now();
			if (state.user) {
				state.isAuthenticated = true;
				saveAuthToStorage(state);
			}
		},

		// Clear tokens
		clearTokens: (state) => {
			state.tokens = null;
			state.isAuthenticated = false;
			if (state.user) {
				saveAuthToStorage(state);
			} else {
				clearAuthFromStorage();
			}
		},

		// Update user data
		updateUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload };
				if (state.tokens) {
					saveAuthToStorage(state);
				}
			}
		},

		// Set user
		setUser: (state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
			if (action.payload && state.tokens) {
				state.isAuthenticated = true;
				saveAuthToStorage(state);
			} else {
				state.isAuthenticated = false;
				clearAuthFromStorage();
			}
		},

		// Register action - similar to login
		register: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
			state.user = action.payload.user;
			state.tokens = action.payload.tokens;
			state.isAuthenticated = true;
			state.isLoading = false;
			state.savedAt = Date.now();
			saveAuthToStorage(state);
		},

		// Refresh token
		refreshToken: (state, action: PayloadAction<AuthTokens>) => {
			state.tokens = action.payload;
			state.savedAt = Date.now();
			if (state.user) {
				state.isAuthenticated = true;
				saveAuthToStorage(state);
			}
		},

		// Clear all auth state
		clearAuth: (state) => {
			state.user = null;
			state.tokens = null;
			state.isAuthenticated = false;
			state.isLoading = false;
			state.savedAt = null;
			clearAuthFromStorage();
		},
	},
});

// Export actions
export const {
	setLoading,
	login,
	logout,
	setTokens,
	clearTokens,
	updateUser,
	setUser,
	register,
	refreshToken,
	clearAuth,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.tokens?.accessToken || null;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.tokens?.refreshToken || null;
