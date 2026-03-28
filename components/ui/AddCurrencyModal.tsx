'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Dropdown from './Dropdown';
import Input from './Input';
import { Cross2Icon } from '@radix-ui/react-icons';

export interface Currency {
	code: string;
	name: string;
	symbol: string;
}

interface AddCurrencyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm?: (currency: Currency) => void;
	initialCurrency?: Currency | null;
}

export const AddCurrencyModal: React.FC<AddCurrencyModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	initialCurrency,
}) => {
	const [selectedCurrency, setSelectedCurrency] = useState<string>('');
	const [formatPreview, setFormatPreview] = useState<string>('');

	const currencyOptions = [
		{ value: 'NGN', label: 'Nigerian Naira - NGN' },
		{ value: 'USD', label: 'US Dollar - USD' },
		{ value: 'GBP', label: 'British Pound - GBP' },
		{ value: 'EUR', label: 'Euro - EUR' },
		{ value: 'JPY', label: 'Japanese Yen - JPY' },
		{ value: 'CAD', label: 'Canadian Dollar - CAD' },
		{ value: 'AUD', label: 'Australian Dollar - AUD' },
	];

	// Moved outside of component or useMemo could work, but since it's constant data:
	const currencyFormats = React.useMemo<Record<string, string>>(() => ({
		NGN: '₦ 1,224,067.34',
		USD: '$ 1,224,067.34',
		GBP: '£ 1,224,067.34',
		EUR: '€ 1,224,067.34',
		JPY: '¥ 1,224,067',
		CAD: 'C$ 1,224,067.34',
		AUD: 'A$ 1,224,067.34',
	}), []);

	useEffect(() => {
		if (isOpen && initialCurrency) {
			setSelectedCurrency(initialCurrency.code);
			setFormatPreview(currencyFormats[initialCurrency.code] || '');
		} else if (isOpen && !initialCurrency) {
			setSelectedCurrency('');
			setFormatPreview('');
		}
	}, [isOpen, initialCurrency, currencyFormats]);

	useEffect(() => {
		if (selectedCurrency && currencyFormats[selectedCurrency]) {
			setFormatPreview(currencyFormats[selectedCurrency]);
		} else {
			setFormatPreview('');
		}
	}, [selectedCurrency, currencyFormats]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleCurrencyChange = (value: string) => {
		setSelectedCurrency(value);
	};

	const handleConfirm = () => {
		if (selectedCurrency) {
			const currency = currencyOptions.find(opt => opt.value === selectedCurrency);
			if (currency) {
				const symbol = getCurrencySymbol(selectedCurrency);
				onConfirm?.({
					code: selectedCurrency,
					name: currency.label,
					symbol: symbol,
				});
				setSelectedCurrency('');
				setFormatPreview('');
				onClose();
			}
		}
	};

	const handleCancel = () => {
		setSelectedCurrency('');
		setFormatPreview('');
		onClose();
	};

	const getCurrencySymbol = (code: string): string => {
		const symbols: { [key: string]: string } = {
			NGN: '₦',
			USD: '$',
			GBP: '£',
			EUR: '€',
			JPY: '¥',
			CAD: 'C$',
			AUD: 'A$',
		};
		return symbols[code] || code;
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Add Currency
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors !rounded-none"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
							e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
							e.currentTarget.style.backgroundColor = 'transparent';
						}}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<Dropdown
						label="Currency"
						placeholder="Select currency"
						options={currencyOptions}
						value={selectedCurrency}
						onChange={(value) => handleCurrencyChange(Array.isArray(value) ? value[0] : value)}
						required
					/>

					<div>
						<Input
							label="Format Preview"
							value={formatPreview}
							onChange={() => { }} // Read-only
							disabled
							placeholder="Select a currency to see preview"
							inputClassName="border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
						/>
					</div>
				</div>

				{/* Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="danger"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleConfirm}
						disabled={!selectedCurrency}
					>
						Confirm
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddCurrencyModal;
