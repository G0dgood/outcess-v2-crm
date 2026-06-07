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
	const [configs, setConfigs] = useState<any[]>([]);
	const [selectedConfigId, setSelectedConfigId] = useState<string>('');

	// Load configs from local storage
	useEffect(() => {
		if (isOpen) {
			const saved = localStorage.getItem('outcess-sms-configs');
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					setConfigs(parsed);
					if (parsed.length > 0) {
						setSelectedConfigId(parsed[0].id);
					}
				} catch {
					setConfigs([]);
				}
			}
		} else {
			setConfigs([]);
			setSelectedConfigId('');
		}
	}, [isOpen]);

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
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-md mx-4 rounded-[var(--radius)] overflow-hidden"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						SMS
					</h2>
					<button
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full"
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
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{configs.length > 0 ? (
						<div className="flex flex-col gap-1.5">
							<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
								SMS Configuration / Gateway
							</label>
							<select
								value={selectedConfigId}
								onChange={(e) => setSelectedConfigId(e.target.value)}
								className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)',
									color: 'var(--text-primary)',
								}}
							>
								{configs.map((cfg) => (
									<option key={cfg.id} value={cfg.id}>
										{cfg.name} ({cfg.provider}) — {cfg.assignType === 'campaign' ? 'Campaign' : 'Bucket'}: {cfg.assignedName}
									</option>
								))}
							</select>
						</div>
					) : (
						<div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 rounded-lg text-[11px] text-yellow-800 dark:text-yellow-200">
							⚠️ No SMS configurations assigned. Messaging will use the Default Gateway. Configure settings in the SMS Configurations tab.
						</div>
					)}

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
				<div
					className="flex justify-end items-center p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
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

