'use client';

import React from 'react';
import { SetupProvider } from '@/contexts/SetupContext';

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
	return (
		<SetupProvider>
			{children}
		</SetupProvider>
	);
}

