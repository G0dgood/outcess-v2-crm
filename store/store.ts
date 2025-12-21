import { configureStore } from '@reduxjs/toolkit';

// Import your slices here
import authSlice from './slices/authSlice';
// import dispositionSlice from './slices/dispositionSlice';
import exampleSlice from './slices/exampleSlice';
import { authApi } from './services/authApi';
import { companyApi } from './services/companyApi';
import { lineOfBusinessApi } from './services/lineOfBusinessApi';
import { roleApi } from './services/roleApi';
import { statusApi } from './services/statusApi';
import { teamMembersApi } from './services/teamMembersApi';
import { notificationApi } from './services/notificationApi';
import { setupBookApi } from './services/setupBookApi';
import { dispositionApi } from './services/dispositionApi';

export const store = configureStore({
	reducer: {
		// Add your reducers here
		auth: authSlice,
		// disposition: dispositionSlice,
		example: exampleSlice,
		[authApi.reducerPath]: authApi.reducer,
		[companyApi.reducerPath]: companyApi.reducer,
		[lineOfBusinessApi.reducerPath]: lineOfBusinessApi.reducer,
		[roleApi.reducerPath]: roleApi.reducer,
		[statusApi.reducerPath]: statusApi.reducer,
		[teamMembersApi.reducerPath]: teamMembersApi.reducer,
		[notificationApi.reducerPath]: notificationApi.reducer,
		[setupBookApi.reducerPath]: setupBookApi.reducer,
		[dispositionApi.reducerPath]: dispositionApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				// Ignore these action types
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		}).concat(authApi.middleware)
			.concat(companyApi.middleware)
			.concat(lineOfBusinessApi.middleware)
			.concat(roleApi.middleware)
			.concat(statusApi.middleware)
			.concat(teamMembersApi.middleware)
			.concat(notificationApi.middleware)
			.concat(setupBookApi.middleware)
			.concat(dispositionApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

