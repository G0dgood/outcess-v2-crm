'use client';

import React from 'react';
import { GearIcon, Cross2Icon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { SMSConfig, SMSCampaign, SMSBucket } from '@/store/services/smsApi';

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
							{ value: 'Twilio', label: 'Twilio' },
							{ value: 'Infobip', label: 'Infobip' },
							{ value: 'Plivo', label: 'Plivo' },
							{ value: 'Outcess SMS Gateway', label: 'Outcess SMS Gateway' },
						]}
						onChange={(val) => onFormChange('provider', val as string)}
						required
					/>

					<Input
						label="Sender ID / Phone Number *"
						placeholder="e.g. OUTCESS or +12345678"
						value={configForm.senderId}
						onChange={(val) => onFormChange('senderId', val)}
						required
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
						<input
							type="password"
							placeholder="••••••••••••••••"
							value={configForm.apiKey}
							onChange={(e) => onFormChange('apiKey', e.target.value)}
							className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
							style={{
								borderColor: 'var(--light-gray)',
								color: 'var(--text-primary)',
							}}
						/>
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
					>
						{editingConfig ? 'Save Changes' : 'Create Config'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SMSConfigModal;
