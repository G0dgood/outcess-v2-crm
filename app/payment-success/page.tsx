'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import { useSetup } from '@/contexts/SetupContext';

export default function PaymentSuccessPage() {
	const router = useRouter();
	const { setupData } = useSetup();
	const primaryColor = setupData.primaryColor || '#9333EA';

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				{/* Success Icon */}
				<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
					<CheckIcon className="w-10 h-10 text-green-600" />
				</div>

				{/* Success Message */}
				<h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h1>
				<p className="text-gray-600 mb-8">
					Your payment has been processed successfully. You will receive a confirmation email shortly.
				</p>

				{/* Action Buttons */}
				<div className="space-y-3">
					<Button
						variant="primary"
						fullWidth
						onClick={() => router.push('/dashboard')}
						style={{ backgroundColor: primaryColor }}
					>
						Go to Dashboard
					</Button>
					<Button
						variant="outline"
						fullWidth
						onClick={() => router.push('/login')}
					>
						Back to Login
					</Button>
				</div>
			</div>
		</div>
	);
}

