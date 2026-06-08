'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import PageHeading from '@/components/ui/PageHeading';
import Tabs from '@/components/ui/Tabs';
import { ChatBubbleIcon, PlusIcon } from '@radix-ui/react-icons';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import SMSMessageModal from '@/components/features/sms/SMSMessageModal';
import SMSTable from '@/components/features/sms/SMSTable';
import SMSConfigTable from '@/components/features/sms/SMSConfigTable';
import SelectedSMSDrawer from '@/components/features/sms/SelectedSMSDrawer';
import SMSConfigModal from '@/components/features/sms/SMSConfigModal';
import SMSModal from '@/components/ui/SMSModal';
import {
	useGetSMSConfigsQuery,
	useCreateSMSConfigMutation,
	useUpdateSMSConfigMutation,
	useDeleteSMSConfigMutation,
	useGetSMSLogsQuery,
	SMSConfig as SMSConfigType,
	SMSLog as SMSLogType,
	SMSCampaign,
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
	const campaigns = useMemo(() => (campaignQueryData as { campaigns: SMSCampaign[] })?.campaigns || [], [campaignQueryData]);

	// Extract all buckets from campaigns
	const buckets = useMemo(() => {
		return campaigns.flatMap((c) => {
			const bList = c.dashboardSettings?.buckets || [];
			return bList.map((b) => ({
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

	const handleConfigFormChange = (field: string, value: string | number | boolean) => {
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
			const camp = campaigns.find((c) => c._id === configForm.assignedId);
			assignedName = camp?.campaignName || camp?.name || 'Unknown Campaign';
		} else {
			const bkt = buckets.find((b) => b.id === configForm.assignedId);
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
		} catch {
			toast.error('Failed to save configuration');
		}
	};

	const handleDeleteConfig = async (id: string) => {
		try {
			await deleteSMSConfig(id).unwrap();
			toast.success('Configuration deleted');
		} catch {
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
				selectedSMSList={smsList.filter(sms => selectedSMS.has(sms._id || ''))}
				onClose={() => setIsDrawerOpen(false)}
				onViewFull={(sms) => {
					setViewingSMS(sms);
					setIsDrawerOpen(false);
				}}
			/>

			{/* SMS Config Modal */}
			<SMSConfigModal
				isOpen={isConfigModalOpen}
				onClose={() => setIsConfigModalOpen(false)}
				onSave={handleSaveConfig}
				editingConfig={editingConfig}
				configForm={configForm}
				onFormChange={handleConfigFormChange}
				campaigns={campaigns}
				buckets={buckets}
			/>

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
