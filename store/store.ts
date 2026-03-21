import { configureStore } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import privilegeReducer from './slices/privilegeSlice';
import exampleSlice from './slices/exampleSlice';
import { baseApi } from './services/baseApi';

export const store = configureStore({
	reducer: {
		// Add your reducers here
		auth: authSlice,
		privilege: privilegeReducer,
		// disposition: dispositionSlice,
		example: exampleSlice,
		[baseApi.reducerPath]: baseApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		}).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

