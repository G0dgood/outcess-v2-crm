'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { Dropdown } from './Dropdown';
import Textarea from './Textarea';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useGetSMSConfigsQuery, SMSConfig } from '@/store/services/smsApi';
import { useUserInfo } from '@/contexts/UserInfoContext';

interface SMSModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSend?: (data: {
		phone: string;
		message: string;
		configId?: string;
	}) => Promise<void> | void;
	initialPhone?: string;
	isSending?: boolean;
	hideGatewaySelect?: boolean;
}

export const SMSModal: React.FC<SMSModalProps> = ({
	isOpen,
	onClose,
	onSend,
	initialPhone = '',
	isSending = false,
	hideGatewaySelect = false,
}) => {
	const { user } = useUserInfo();
	const companyId = user?.companyId || user?.company?._id || '';

	const [formData, setFormData] = useState({
		phone: initialPhone,
	});
	const [selectedConfigId, setSelectedConfigId] = useState<string>('');
	const [localIsSending, setLocalIsSending] = useState(false);

	const isLoading = isSending || localIsSending;

	const { data: configsData } = useGetSMSConfigsQuery(companyId, { skip: !isOpen || !companyId });
	const configs = React.useMemo(() => configsData?.configs || [], [configsData]);

	const selectedConfig = React.useMemo(() => {
		return configs.find((c) => c._id === selectedConfigId);
	}, [configs, selectedConfigId]);

	// Set default config
	useEffect(() => {
		if (configs.length > 0 && !selectedConfigId) {
			setSelectedConfigId(configs[0]._id || '');
		}
	}, [configs, selectedConfigId]);

	// Reset form when modal closes/opens
	useEffect(() => {
		if (!isOpen) {
			setFormData({
				phone: initialPhone,
			});
			setSelectedConfigId('');
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
			if (e.key === 'Escape' && !isLoading) {
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
	}, [isOpen, onClose, isLoading]);

	// SMS Character and Page Counter Helper
	const getSmsCounter = (text: string) => {
		const length = text.length;
		if (length === 0) {
			return { charactersLeft: 160, pages: 1, total: 160 };
		}
		if (length <= 160) {
			return { charactersLeft: 160 - length, pages: 1, total: 160 };
		}
		const pages = Math.ceil(length / 153);
		const total = pages * 153;
		return { charactersLeft: total - length, pages, total };
	};

	// Recipient split count helper
	const getRecipientCount = (text: string) => {
		if (!text) return 0;
		const numbers = text.split(/[\n,; ]+/).filter(num => num.trim().length > 0);
		return numbers.length;
	};

	const handleSend = async () => {
		if (formData.phone) {
			try {
				setLocalIsSending(true);
				await Promise.resolve(
					onSend?.({
						phone: formData.phone,
						message: selectedConfig?.message || '',
						configId: selectedConfigId || undefined,
					})
				);

				setFormData({
					phone: initialPhone,
				});
				setSelectedConfigId('');
				onClose();
			} catch (error) {
				console.error('Failed to send SMS:', error);
			} finally {
				setLocalIsSending(false);
			}
		}
	};

	const totalRecipientCount = getRecipientCount(formData.phone);
	const recipientsFromList = initialPhone && formData.phone.includes(initialPhone) ? 1 : 0;
	const smsCounter = getSmsCounter(selectedConfig?.message || '');

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => !isLoading && onClose()}>
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-lg mx-4 rounded-[var(--radius)] overflow-hidden flex flex-col max-h-[90vh]"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
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
						Compose Message
					</h2>
					<button
						onClick={onClose}
						disabled={isLoading}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
						style={{ color: 'var(--text-tertiary)' }}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4 overflow-y-auto flex-1">
					{!hideGatewaySelect && (
						configs.length > 0 ? (
							<>
								<Dropdown
									label="SMS Configuration / Gateway *"
									value={selectedConfigId}
									options={configs.map((cfg: SMSConfig) => ({
										value: cfg._id || '',
										label: `${cfg.name} (${cfg.provider})`
									}))}
									onChange={(val) => setSelectedConfigId(val as string)}
									disabled={isLoading}
								/>
								{selectedConfig && (
									<Input
										label="From"
										value={selectedConfig.senderId || ''}
										readOnly
										description="This sender name is configured in the selected SMS Configuration."
									/>
								)}
							</>
						) : (
							<div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 rounded-lg text-[11px] text-yellow-800 dark:text-yellow-200">
								⚠️ No SMS configurations assigned. Messaging will use the Default Gateway. Configure settings in the SMS Configurations tab.
							</div>
						)
					)}



					<div>
						<Textarea
							label="Recipients"
							placeholder="Numbers (e.g. 08152425262,23470473738728)"
							value={formData.phone}
							onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
							rows={3}
							required
							disabled={isLoading}
						/>
						<div className="flex gap-2 mt-2 mb-3">
							<span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full">
								Total recipient: {totalRecipientCount}
							</span>
							<span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 px-2.5 py-0.5 rounded-full">
								Recipients from list: {recipientsFromList}
							</span>
						</div>
					</div>

					<div>
						<Textarea
							label="Message"
							value={selectedConfig?.message || ''}
							readOnly
							rows={5}
							resize="none"
						/>
						<div className="flex justify-between items-center mt-1 px-1">
							<span className="text-[10px] font-medium text-gray-500">
								Characters left: {smsCounter.charactersLeft}/{smsCounter.total}
							</span>
							<span className="text-[10px] font-medium text-gray-500">
								Page(s): {smsCounter.pages}
							</span>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					className="flex justify-end items-center p-6 border-t dark:border-gray-700 gap-3 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSend}
						disabled={!formData.phone || !(selectedConfig?.message) || isLoading}
						loading={isLoading}
					>
						Send Message
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SMSModal;
