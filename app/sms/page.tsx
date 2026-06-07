'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import PageHeading from '@/components/ui/PageHeading';
import { Dropdown } from '@/components/ui/Dropdown';
import Tabs from '@/components/ui/Tabs';
import { ChatBubbleIcon, GearIcon, PlusIcon, Cross2Icon } from '@radix-ui/react-icons';
import Input from '@/components/ui/Input';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import SMSMessageModal from '@/components/features/sms/SMSMessageModal';
import SMSTable from '@/components/features/sms/SMSTable';
import SMSConfigTable from '@/components/features/sms/SMSConfigTable';
import SelectedSMSDrawer from '@/components/features/sms/SelectedSMSDrawer';
import SMSModal from '@/components/ui/SMSModal';
import { NoRecordFound } from '@/components/Options';
import {
	useGetSMSConfigsQuery,
	useCreateSMSConfigMutation,
	useUpdateSMSConfigMutation,
	useDeleteSMSConfigMutation,
	useGetSMSLogsQuery,
	useCreateSMSLogMutation,
	SMSConfig as SMSConfigType,
	SMSLog as SMSLogType,
} from '@/store/services/smsApi';
import { toastSuccess } from '@/utils/toastWithSound';
import { toast } from 'sonner';

const SMSPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const { canAccess } = usePrivilege();
	const { user } = useUserInfo();

	const canAccessModule = canAccess('customerSMS', 'view');
	const canCreate = canAccess('customerSMS', 'create');

	const companyId = user?.companyId || user?.company?._id || '';

	// Query campaigns for assigning config
	const { data: campaignQueryData } = useGetCampaignByCompanyIdForheaderQuery(
		{ companyId, page: 1, limit: 100 },
		{ skip: !companyId }
	);
	const campaigns = (campaignQueryData as any)?.campaigns || [];

	// Extract all buckets from campaigns
	const buckets = useMemo(() => {
		return campaigns.flatMap((c: any) => {
			const bList = c.dashboardSettings?.buckets || [];
			return bList.map((b: any) => ({
				id: b.id || b._id || '',
				name: b.name || 'Unnamed Bucket',
				campaignId: c._id,
				campaignName: c.campaignName || c.name || 'Unnamed Campaign'
			}));
		});
	}, [campaigns]);

	const [activeTab, setActiveTab] = useState<'logs' | 'configs'>('logs');
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [selectedSMS, setSelectedSMS] = useState<Set<string>>(new Set());
	const [viewingSMS, setViewingSMS] = useState<SMSLogType | null>(null);
	const [isSendSMSOpen, setIsSendSMSOpen] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);

	// SMS Configurations states
	const { data: configsData, isLoading: isConfigsLoading } = useGetSMSConfigsQuery(companyId, { skip: !companyId });
	const configsList = configsData?.configs || [];

	const [createSMSConfig] = useCreateSMSConfigMutation();
	const [updateSMSConfig] = useUpdateSMSConfigMutation();
	const [deleteSMSConfig] = useDeleteSMSConfigMutation();

	// SMS Logs states
	const { data: logsData, isLoading: isLogsLoading } = useGetSMSLogsQuery({
		companyId,
		page: currentPage,
		limit: itemsPerPage,
		search: searchTerm,
	}, { skip: !companyId });
	const smsList = logsData?.logs || [];
	const totalItems = logsData?.pagination?.total || 0;
	const totalPages = logsData?.pagination?.totalPages || 1;

	const [createSMSLog] = useCreateSMSLogMutation();

	const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
	const [editingConfig, setEditingConfig] = useState<SMSConfigType | null>(null);
	const [configForm, setConfigForm] = useState({
		name: '',
		provider: 'Twilio',
		senderId: '',
		accountSid: '',
		apiKey: '',
		assignType: 'campaign' as 'campaign' | 'bucket',
		assignedId: '',
	});

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedSMS(new Set(smsList.map(sms => sms._id || '')));
			setIsDrawerOpen(true);
		} else {
			setSelectedSMS(new Set());
			setIsDrawerOpen(false);
		}
	};

	const handleSelectSMS = (smsId: string, checked: boolean) => {
		const newSelected = new Set(selectedSMS);
		if (checked) {
			newSelected.add(smsId);
			setSelectedSMS(newSelected);
			setIsDrawerOpen(true);
		} else {
			newSelected.delete(smsId);
			setSelectedSMS(newSelected);
			if (newSelected.size === 0) {
				setIsDrawerOpen(false);
			}
		}
	};

	const isAllSelected = smsList.length > 0 && smsList.every(sms => selectedSMS.has(sms._id || ''));

	useEffect(() => {
		if (isDrawerOpen) {
			setShouldRenderDrawer(true);
			setTimeout(() => setIsDrawerAnimating(true), 10);
		} else {
			setIsDrawerAnimating(false);
			const timer = setTimeout(() => {
				setShouldRenderDrawer(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isDrawerOpen]);

	const getDirectionColor = (direction: SMSLogType['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	// Configuration handlers
	const handleConfigModalOpen = (config: SMSConfigType | null = null) => {
		if (config) {
			setEditingConfig(config);
			setConfigForm({
				name: config.name,
				provider: config.provider,
				senderId: config.senderId,
				accountSid: config.accountSid || '',
				apiKey: config.apiKey || '',
				assignType: config.assignType,
				assignedId: config.assignedId,
			});
		} else {
			setEditingConfig(null);
			setConfigForm({
				name: '',
				provider: 'Twilio',
				senderId: '',
				accountSid: '',
				apiKey: '',
				assignType: 'campaign',
				assignedId: campaigns[0]?._id || '',
			});
		}
		setIsConfigModalOpen(true);
	};

	const handleConfigFormChange = (field: string, value: any) => {
		setConfigForm(prev => {
			const updated = { ...prev, [field]: value };
			// Reset assignedId when switching assignType
			if (field === 'assignType') {
				updated.assignedId = value === 'campaign'
					? (campaigns[0]?._id || '')
					: (buckets[0]?.id || '');
			}
			return updated;
		});
	};

	const handleSaveConfig = async () => {
		if (!configForm.name || !configForm.senderId || !configForm.assignedId) {
			toast.error('Please fill in all required fields');
			return;
		}

		let assignedName = '';
		if (configForm.assignType === 'campaign') {
			const camp = campaigns.find((c: any) => c._id === configForm.assignedId);
			assignedName = camp?.campaignName || camp?.name || 'Unknown Campaign';
		} else {
			const bkt = buckets.find((b: any) => b.id === configForm.assignedId);
			assignedName = bkt ? `${bkt.campaignName} -> ${bkt.name}` : 'Unknown Bucket';
		}

		try {
			if (editingConfig && editingConfig._id) {
				await updateSMSConfig({
					id: editingConfig._id,
					data: { ...configForm, assignedName }
				}).unwrap();
				toast.success('Configuration updated successfully');
			} else {
				await createSMSConfig({
					...configForm,
					assignedName,
					companyId,
				}).unwrap();
				toast.success('Configuration created successfully');
			}
			setIsConfigModalOpen(false);
			setEditingConfig(null);
		} catch (error) {
			toast.error('Failed to save configuration');
		}
	};

	const handleDeleteConfig = async (id: string) => {
		try {
			await deleteSMSConfig(id).unwrap();
			toast.success('Configuration deleted');
		} catch (error) {
			toast.error('Failed to delete configuration');
		}
	};

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Title & Tabs */}
			<div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeading text="SMS Integration" />
				<Tabs
					tabs={[
						{ id: 'logs', label: 'SMS Logs' },
						{ id: 'configs', label: 'Configurations' }
					]}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id as 'logs' | 'configs')}
					activeColor="var(--primary)"
				/>
			</div>

			{activeTab === 'logs' ? (
				<>
					{/* Logs Tab View */}
					<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<Search
							placeholder="Search SMS by phone number, message, or contact name"
							value={searchTerm}
							onChange={setSearchTerm}
							className="w-full sm:w-auto"
							maxWidth="w-full"
							onSearch={(value) => console.log('Search triggered:', value)}
							showClearButton={true}
						/>
						<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
							{canCreate && (
								<Button
									variant="primary"
									size="md"
									onClick={() => setIsSendSMSOpen(true)}
									className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
								>
									<ChatBubbleIcon className="w-4 h-4" />
									Send SMS
								</Button>
							)}
						</div>
					</div>

					{/* SMS Table */}
					<SMSTable
						smsList={smsList}
						isLoading={isLogsLoading}
						totalItems={totalItems}
						itemsPerPage={itemsPerPage}
						currentPage={currentPage}
						onItemsPerPageChange={(value) => {
							setItemsPerPage(value);
							setCurrentPage(1);
						}}
						onPageChange={setCurrentPage}
						selectedSMS={selectedSMS}
						onSelectAll={handleSelectAll}
						onSelectSMS={handleSelectSMS}
						onViewSMS={setViewingSMS}
						primaryColor={campaignData?.primaryColor}
					/>
				</>
			) : (
				<>
					{/* Configurations Tab View */}
					<div className="mb-6 flex justify-between items-center">
						<p className="text-[12px] text-gray-500">
							Create and manage SMS gateway connections and assign them to Campaigns or specific Buckets.
						</p>
						<Button
							variant="primary"
							size="md"
							onClick={() => handleConfigModalOpen()}
							className="flex items-center gap-2 text-xs"
						>
							<PlusIcon className="w-4 h-4" />
							Add SMS Config
						</Button>
					</div>

					{/* Configurations Table */}
					<SMSConfigTable
						configsList={configsList}
						isLoading={isConfigsLoading}
						onEdit={handleConfigModalOpen}
						onDelete={handleDeleteConfig}
					/>
				</>
			)}

			{/* Selected SMS Drawer */}
			<SelectedSMSDrawer
				isOpen={isDrawerOpen}
				isAnimating={isDrawerAnimating}
				selectedSMSList={smsList.filter(sms => selectedSMS.has(sms._id || ''))}
				onClose={() => setIsDrawerOpen(false)}
				onViewFull={(sms) => {
					setViewingSMS(sms);
					setIsDrawerOpen(false);
				}}
			/>

			{/* SMS Config Modal */}
			{isConfigModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setIsConfigModalOpen(false)}>
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
								onClick={() => setIsConfigModalOpen(false)}
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
								onChange={(val) => handleConfigFormChange('name', val)}
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
								onChange={(val) => handleConfigFormChange('provider', val as string)}
								required
							/>

							<Input
								label="Sender ID / Phone Number *"
								placeholder="e.g. OUTCESS or +12345678"
								value={configForm.senderId}
								onChange={(val) => handleConfigFormChange('senderId', val)}
								required
							/>

							<Input
								label="Account SID / Username"
								placeholder="Enter account Identifier"
								value={configForm.accountSid}
								onChange={(val) => handleConfigFormChange('accountSid', val)}
							/>

							<div className="flex flex-col gap-1">
								<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
									API Key / Auth Token
								</label>
								<input
									type="password"
									placeholder="••••••••••••••••"
									value={configForm.apiKey}
									onChange={(e) => handleConfigFormChange('apiKey', e.target.value)}
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
								onChange={(val) => handleConfigFormChange('assignType', val as string)}
								required
								className="border-t dark:border-gray-700 pt-3 mt-3"
							/>

							<Dropdown
								label="Select Target *"
								value={configForm.assignedId}
								options={configForm.assignType === 'campaign'
									? campaigns.map((c: any) => ({
										value: c._id,
										label: c.campaignName || c.name || 'Unnamed Campaign'
									}))
									: buckets.map((b: any) => ({
										value: b.id,
										label: `${b.campaignName} ➔ ${b.name}`
									}))
								}
								onChange={(val) => handleConfigFormChange('assignedId', val as string)}
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
								onClick={() => setIsConfigModalOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSaveConfig}
							>
								{editingConfig ? 'Save Changes' : 'Create Config'}
							</Button>
						</div>
					</div>
				</div>
			)}

			<SMSMessageModal
				isOpen={!!viewingSMS}
				sms={viewingSMS}
				onClose={() => setViewingSMS(null)}
			/>

			<SMSModal
				isOpen={isSendSMSOpen}
				onClose={() => setIsSendSMSOpen(false)}
				onSend={(data) => {
					console.log('Sending SMS:', data);
					toastSuccess(`SMS queued for sending to ${data.phone}`);
				}}
			/>
		</div>
	);
};

export default SMSPage;
