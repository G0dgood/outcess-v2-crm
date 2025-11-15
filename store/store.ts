import { configureStore } from '@reduxjs/toolkit';

// Import your slices here
import authSlice from './slices/authSlice';
// import dispositionSlice from './slices/dispositionSlice';
import exampleSlice from './slices/exampleSlice';

export const store = configureStore({
	reducer: {
		// Add your reducers here
		auth: authSlice,
		// disposition: dispositionSlice,
		example: exampleSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

