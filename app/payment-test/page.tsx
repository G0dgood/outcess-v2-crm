'use client';

import React, { useState } from 'react';
import PricingModal from '@/components/ui/PricingModal';
import { SetupProvider } from '@/contexts/SetupContext';
import Button from '@/components/ui/Button';

function PaymentTestContent() {
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(true);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
			<div className="text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Test Page</h1>
				<p className="text-gray-600 mb-6">
					Click the button below to open the pricing modal and test the payment flow.
				</p>
				<Button
					variant="primary"
					size="lg"
					onClick={() => setIsPricingModalOpen(true)}
				>
					Open Pricing Modal
				</Button>
			</div>

			<PricingModal
				isOpen={isPricingModalOpen}
				onClose={() => setIsPricingModalOpen(false)}
				onSelectPlan={() => {
				}}
			/>
		</div>
	);
}

export default function PaymentTestPage() {
	return (
		<SetupProvider>
			<PaymentTestContent />
		</SetupProvider>
	);
}

