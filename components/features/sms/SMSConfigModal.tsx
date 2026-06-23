'use client';

import React, { useState } from 'react';
import { GearIcon, Cross2Icon, EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import { SMSConfig, SMSCampaign, SMSBucket, useCheckSMSBalanceMutation } from '@/store/services/smsApi';
import { toast } from 'sonner';

interface SMSConfigModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	editingConfig: SMSConfig | null;
	configForm: {
		name: string;
		provider: string;
		senderId: string;
		accountSid: string;
		apiKey: string;
		assignType: 'campaign' | 'bucket';
		assignedId: string;
		messageType: 'standard' | 'flash';
		sendLater: boolean;
		sendtime: string;
		forcednd: boolean;
		countryPrefix: string;
		message: string;
	};
	onFormChange: (field: string, value: string | number | boolean) => void;
	campaigns: SMSCampaign[];
	buckets: SMSBucket[];
}

const SMSConfigModal: React.FC<SMSConfigModalProps> = ({
	isOpen,
	onClose,
	onSave,
	editingConfig,
	configForm,
	onFormChange,
	campaigns,
	buckets,
}) => {
	const [showApiKey, setShowApiKey] = useState(false);
	const [checkSMSBalance, { isLoading: isChecking }] = useCheckSMSBalanceMutation();
	const [balance, setBalance] = useState<string | null>(null);

	// Reset states when modal is opened/closed or provider changes
	React.useEffect(() => {
		if (!isOpen) {
			setBalance(null);
			setShowApiKey(false);
		}
	}, [isOpen]);

	React.useEffect(() => {
		setBalance(null);
	}, [configForm.provider, configForm.apiKey]);

	const handleCheckBalance = async () => {
		if (!configForm.apiKey) {
			toast.error('Please enter an API Key first');
			return;
		}
		try {
			const res = await checkSMSBalance({
				apiKey: configForm.apiKey,
				configId: editingConfig?._id || undefined
			}).unwrap();
			setBalance(String(res.balance));
			toast.success('Balance checked successfully');
		} catch (err: any) {
			const errorMsg = err?.data?.error || err?.data?.message || 'Failed to check balance';
			toast.error(errorMsg);
			setBalance(null);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
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
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100 flex items-center gap-2"
						style={{ color: 'var(--text-primary)' }}
					>
						<GearIcon className="w-5 h-5 text-[#6C8B7D]" />
						{editingConfig ? 'Edit SMS Config' : 'Create SMS Config'}
					</h2>
					<button
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full"
						style={{ color: 'var(--text-tertiary)' }}
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
					<Input
						label="Configuration Name *"
						placeholder="e.g. Sales Twilio Account"
						value={configForm.name}
						onChange={(val) => onFormChange('name', val)}
						required
					/>

					<Dropdown
						label="Gateway Provider *"
						value={configForm.provider}
						options={[
							// { value: 'Twilio', label: 'Twilio' },
							// { value: 'Infobip', label: 'Infobip' },
							// { value: 'Plivo', label: 'Plivo' },
							{ value: 'MultiTexter', label: 'MultiTexter' },
						]}
						onChange={(val) => onFormChange('provider', val as string)}
						required
					/>

					<Dropdown
						label="Country"
						value={configForm.countryPrefix || '+234'}
						options={[
							{ value: '+234', label: '(234) Nigeria' },
							{ value: '+1', label: '(1) USA/Canada' },
							{ value: '+44', label: '(44) United Kingdom' },
							{ value: '+233', label: '(233) Ghana' },
						]}
						onChange={(val) => onFormChange('countryPrefix', val as string)}
					/>

					<Input
						label="From *"
						placeholder="e.g. OUTCESS or +12345678"
						value={configForm.senderId}
						onChange={(val) => onFormChange('senderId', val)}
						required
						description="Note: Do not type Bank as sender or in content."
						error={
							configForm.provider === 'MultiTexter' && configForm.senderId.length > 11
								? 'The sender name must not be greater than 11 characters.'
								: undefined
						}
					/>

					<Input
						label="Account SID / Username"
						placeholder="Enter account Identifier"
						value={configForm.accountSid}
						onChange={(val) => onFormChange('accountSid', val)}
					/>

					<div className="flex flex-col gap-1">
						<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
							API Key / Auth Token
						</label>
						<div className="relative flex items-center">
							<input
								type={showApiKey ? 'text' : 'password'}
								placeholder="••••••••••••••••"
								value={configForm.apiKey}
								onChange={(e) => onFormChange('apiKey', e.target.value)}
								className="w-full px-4 py-2 pr-10 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
								style={{
									borderColor: 'var(--light-gray)',
									color: 'var(--text-primary)',
								}}
							/>
							<button
								type="button"
								onClick={() => setShowApiKey(!showApiKey)}
								className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
								title={showApiKey ? 'Hide' : 'Show'}
							>
								{showApiKey ? (
									<EyeNoneIcon className="w-4 h-4" />
								) : (
									<EyeOpenIcon className="w-4 h-4" />
								)}
							</button>
						</div>
						{configForm.provider === 'MultiTexter' && (
							<div className="flex justify-between items-center mt-1.5 px-1">
								<button
									type="button"
									onClick={handleCheckBalance}
									disabled={isChecking}
									className="text-[11px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 cursor-pointer transition-colors"
								>
									{isChecking ? 'Checking...' : 'Check Balance'}
								</button>
								{balance !== null && (
									<span className="text-[11px] font-semibold text-green-600 dark:text-green-400 animate-fade-in bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
										Balance: {balance} units
									</span>
								)}
							</div>
						)}
					</div>

					<Dropdown
						label="Assign To Scope *"
						value={configForm.assignType}
						options={[
							{ value: 'campaign', label: 'Campaign' },
							{ value: 'bucket', label: 'Bucket' },
						]}
						onChange={(val) => onFormChange('assignType', val as string)}
						required
						className="border-t dark:border-gray-700 pt-3 mt-3"
					/>

					<Dropdown
						label="Select Target *"
						value={configForm.assignedId}
						options={configForm.assignType === 'campaign'
							? campaigns.map((c) => ({
								value: c._id,
								label: c.campaignName || c.name || 'Unnamed Campaign'
							}))
							: buckets.map((b) => ({
								value: b.id,
								label: `${b.campaignName} ➔ ${b.name}`
							}))
						}
						onChange={(val) => onFormChange('assignedId', val as string)}
						required
					/>

					<div className="border-t dark:border-gray-700 pt-3 mt-3">
						<Textarea
							label="Default Message Template"
							placeholder="Enter default gateway message template..."
							value={configForm.message}
							onChange={(val) => onFormChange('message', val)}
							rows={4}
							required
						/>
						<div className="flex justify-between items-center mt-1 px-1 mb-3">
							<span className="text-[10px] font-medium text-gray-500">
								Characters: {configForm.message?.length || 0}
							</span>
							<span className="text-[10px] font-medium text-gray-500">
								Page(s): {configForm.message ? (configForm.message.length <= 160 ? 1 : Math.ceil(configForm.message.length / 153)) : 1}
							</span>
						</div>
					</div>

					<div className="space-y-3 pt-3 border-t dark:border-gray-700 mt-3">
						<Dropdown
							label="Message Type"
							value={configForm.messageType}
							options={[
								{ value: 'standard', label: 'Standard SMS' },
								{ value: 'flash', label: 'Flash SMS' },
							]}
							onChange={(val) => onFormChange('messageType', val as string)}
						/>
						<span className="text-[10px] text-gray-400 italic px-1 mt-0.5 block">
							{configForm.messageType === 'standard'
								? 'SMS autosaves on recipients phone'
								: 'Flash message displays immediately on screen without saving to inbox'}
						</span>

						<Checkbox
							id="configSendLater"
							checked={configForm.sendLater}
							onChange={(checked) => onFormChange('sendLater', checked)}
							label="Send later"
							size="small"
						/>

						{configForm.sendLater && (
							<div className="pl-6 animate-fade-in flex flex-col gap-1">
								<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
									Schedule Time *
								</label>
								<input
									type="datetime-local"
									value={configForm.sendtime}
									onChange={(e) => onFormChange('sendtime', e.target.value)}
									className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
									style={{
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)',
									}}
									required
								/>
							</div>
						)}
						<div className='mt-2'>

							<Checkbox
								id="configForcednd"
								checked={configForm.forcednd}
								onChange={(checked) => onFormChange('forcednd', checked)}
								label="Priority Route: Override DND"
								size="small"
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					className="flex justify-end items-center p-6 border-t dark:border-gray-700 gap-3"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={onSave}
						disabled={configForm.provider === 'MultiTexter' && configForm.senderId.length > 11}
					>
						{editingConfig ? 'Save Changes' : 'Create Config'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SMSConfigModal;
