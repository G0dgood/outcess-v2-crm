'use client';

import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

interface ReduxProviderProps {
	children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
	// Use a ref to ensure the store is only created once
	const storeRef = useRef(store);

	return <Provider store={storeRef.current}>{children}</Provider>;
};

