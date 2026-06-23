'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExchangeOutlookCodeMutation } from '@/store/services/emailApi';
import { toast } from 'sonner';

function OutlookCallbackInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get('code');
	const configId = searchParams.get('state');

	const [exchangeCode] = useExchangeOutlookCodeMutation();
	const exchangeTriggered = useRef(false);

	useEffect(() => {
		if (exchangeTriggered.current) return;

		const completeExchange = async () => {
			if (!code || !configId) {
				toast.error('Invalid callback parameters from Microsoft');
				router.push('/email');
				return;
			}

			exchangeTriggered.current = true;
			const redirectUri = process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || `${window.location.origin}/email/callback`;

			try {
				await exchangeCode({
					id: configId,
					code,
					redirectUri,
				}).unwrap();

				toast.success('Successfully connected Microsoft Outlook account!');
				router.push('/email');
			} catch (err: any) {
				const errorMsg = err?.data?.error || err?.data?.message || 'Failed to connect Outlook account';
				toast.error(errorMsg);
				router.push('/email');
			}
		};

		completeExchange();
	}, [code, configId, exchangeCode, router]);

	return (
		<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100 dark:border-gray-700">
			<div className="flex justify-center">
				<div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
			</div>
			<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
				Connecting Microsoft Account
			</h2>
			<p className="text-sm text-gray-500 dark:text-gray-400">
				Please wait while we establish a secure connection with your Outlook account. Do not close this page.
			</p>
		</div>
	);
}

export default function OutlookCallbackPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
			<Suspense fallback={
				<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-gray-100 dark:border-gray-700">
					<div className="flex justify-center">
						<div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
					</div>
					<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
						Loading Callback Parameters...
					</h2>
				</div>
			}>
				<OutlookCallbackInner />
			</Suspense>
		</div>
	);
}
