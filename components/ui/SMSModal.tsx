'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';
import { Cross2Icon } from '@radix-ui/react-icons';

interface SMSModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSend?: (data: { phone: string; message: string }) => void;
	initialPhone?: string;
}

export const SMSModal: React.FC<SMSModalProps> = ({
	isOpen,
	onClose,
	onSend,
	initialPhone = '',
}) => {
	const [formData, setFormData] = useState({
		phone: initialPhone,
		message: '',
	});

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				phone: initialPhone,
				message: '',
			});
		} else {
			setFormData(prev => ({
				...prev,
				phone: initialPhone || prev.phone,
			}));
		}
	}, [isOpen, initialPhone]);

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

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSend = () => {
		if (formData.phone && formData.message) {
			onSend?.(formData);
			setFormData({
				phone: initialPhone,
				message: '',
			});
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div className="bg-white shadow-lg w-full max-w-md mx-4">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">SMS</h2>
					<button
						onClick={onClose}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					<Input
						label="Phone"
						placeholder="Enter phone number"
						value={formData.phone}
						onChange={handleInputChange('phone')}
						type="tel"
						required
					/>

					<Textarea
						label="Message"
						placeholder="Enter your message"
						value={formData.message}
						onChange={handleInputChange('message')}
						rows={6}
						required
					/>
				</div>

				{/* Footer */}
				<div className="flex justify-end items-center p-6 border-t border-gray-200">
					<Button
						variant="primary"
						size="md"
						onClick={handleSend}
						disabled={!formData.phone || !formData.message}
					>
						Send
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SMSModal;

