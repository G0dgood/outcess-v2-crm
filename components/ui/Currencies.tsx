'use client';

import React, { useState } from 'react';
import Button from './Button';
import AddCurrencyModal, { Currency } from './AddCurrencyModal';

const Currencies = () => {
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);

	const currencyFormats: { [key: string]: string } = {
		NGN: '₦ 1,224,067.34',
		USD: '$ 1,224,067.34',
		GBP: '£ 1,224,067.34',
		EUR: '€ 1,224,067.34',
		JPY: '¥ 1,224,067',
		CAD: 'C$ 1,224,067.34',
		AUD: 'A$ 1,224,067.34',
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h2
						className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Currencies
					</h2>
					<p
						className="dark:text-gray-400 text-[10px] md:text-[12px]"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your organization&apos;s currency settings on this page.
					</p>
				</div>
				<Button
					variant="primary"
					size="md"
					onClick={() => {
						setIsAddCurrencyModalOpen(true);
					}}
				>
					Add Currency
				</Button>
			</div>

			{/* Currencies Content */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 min-h-[400px]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				{currencies.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<p
							className="dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							No currencies configured yet.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{currencies.map((currency, index) => (
							<div
								key={index}
								className="border dark:border-gray-700 p-4"
								style={{
									borderColor: 'var(--light-gray)',
									backgroundColor: 'var(--accent-white)'
								}}
							>
								<p
									className="font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{currency.name}
								</p>
								<p
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Format: {currencyFormats[currency.code] || currency.symbol + ' 1,224,067.34'}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add Currency Modal */}
			<AddCurrencyModal
				isOpen={isAddCurrencyModalOpen}
				onClose={() => setIsAddCurrencyModalOpen(false)}
				onConfirm={(currency) => {
					setCurrencies(prev => [...prev, currency]);
					setIsAddCurrencyModalOpen(false);
				}}
			/>
		</div>
	);
};

export default Currencies;
