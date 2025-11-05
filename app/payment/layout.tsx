'use client';

import { SetupProvider } from '@/contexts/SetupContext';

export default function PaymentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <SetupProvider>{children}</SetupProvider>;
}

