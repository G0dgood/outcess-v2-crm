'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Checkbox from '@/components/ui/Checkbox';
import PageHeading from '@/components/ui/PageHeading';
import { Dropdown } from '@/components/ui/Dropdown';
import Tabs from '@/components/ui/Tabs';
import { EnvelopeClosedIcon, EnvelopeOpenIcon, Cross2Icon, GearIcon, TrashIcon, PlusIcon, EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import {
	useGetEmailConfigsQuery,
	useCreateEmailConfigMutation,
	useUpdateEmailConfigMutation,
	useDeleteEmailConfigMutation,
	useGetEmailLogsQuery,
	useCreateEmailLogMutation,
	EmailConfig as EmailConfigType,
	EmailLog as EmailLogType,
} from '@/store/services/emailApi';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { toastSuccess } from '@/utils/toastWithSound';
import { toast } from 'sonner';
import { Bucket } from '@/contexts/SetupContext';
import { extractErrorMessage, ApiError } from '@/utils/apiError';

interface EmailCampaign {
	_id: string;
	campaignName?: string;
	name?: string;
	dashboardSettings?: {
		buckets?: Bucket[];
	};
}

const EmailPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const { canAccess } = usePrivilege();
	const { user } = useUserInfo();

	const canAccessModule = canAccess('customerSMS', 'view'); // Sharing privilege for demo
	const canCreate = canAccess('customerSMS', 'create');

	const companyId = user?.companyId || user?.company?._id || '';

	// Query campaigns for assigning config
	const { data: campaignQueryData } = useGetCampaignByCompanyIdForheaderQuery(
		{ companyId, page: 1, limit: 100 },
		{ skip: !companyId }
	);

	const campaigns = useMemo(() => {
		return (campaignQueryData as { campaigns?: EmailCampaign[] })?.campaigns || [];
	}, [campaignQueryData]);

	// Extract all buckets from campaigns
	const buckets = useMemo(() => {
		return campaigns.flatMap((c: EmailCampaign) => {
			const bList = c.dashboardSettings?.buckets || [];
			return bList.map((b: Bucket) => ({
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
	const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
	const [viewingEmail, setViewingEmail] = useState<EmailLogType | null>(null);
	const [isComposeOpen, setIsComposeOpen] = useState(false);

	const [formData, setFormData] = useState({
		to: '',
		subject: '',
		message: '',
		configId: '',
	});

	// Email Configurations states
	const { data: configsData, isLoading: isConfigsLoading } = useGetEmailConfigsQuery(companyId, { skip: !companyId });
	const configsList = useMemo(() => configsData?.configs || [], [configsData]);

	const [createEmailConfig, { isLoading: isCreatingConfig }] = useCreateEmailConfigMutation();
	const [updateEmailConfig, { isLoading: isUpdatingConfig }] = useUpdateEmailConfigMutation();
	const [deleteEmailConfig] = useDeleteEmailConfigMutation();

	// Email Logs states
	const { data: logsData, isLoading: isLogsLoading } = useGetEmailLogsQuery({
		companyId,
		page: currentPage,
		limit: itemsPerPage,
		search: searchTerm,
	}, { skip: !companyId });
	const emailList = logsData?.logs || [];
	const totalItems = logsData?.pagination?.total || 0;
	const totalPages = logsData?.pagination?.totalPages || 1;

	const [createEmailLog, { isLoading: isSendingEmail }] = useCreateEmailLogMutation();

	const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
	const [showClientSecret, setShowClientSecret] = useState(false);
	const [editingConfig, setEditingConfig] = useState<EmailConfigType | null>(null);
	const [configForm, setConfigForm] = useState({
		name: '',
		provider: 'SMTP',
		host: '',
		port: 587,
		username: '',
		password: '',
		fromEmail: '',
		assignType: 'campaign' as 'campaign' | 'bucket',
		assignedId: '',
		secure: false,
		tenantId: '',
		clientId: '',
		clientSecret: '',
		refreshToken: '',
	});

	const [showPassword, setShowPassword] = useState(false);

	const [redirectUri, setRedirectUri] = useState<string>('');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setRedirectUri(process.env.NEXT_PUBLIC_MICROSOFT_REDIRECT_URI || `${window.location.origin}/email/callback`);
		}
	}, []);

	const handleCopyRedirectUri = () => {
		if (redirectUri) {
			navigator.clipboard.writeText(redirectUri);
			toast.success('Redirect URI copied to clipboard!');
		}
	};

	useEffect(() => {
		if (!isConfigModalOpen) {
			setShowClientSecret(false);
			setShowPassword(false);
		}
	}, [isConfigModalOpen]);

	// Set default config if available
	useEffect(() => {
		if (configsList.length > 0 && !formData.configId) {
			setFormData(prev => ({ ...prev, configId: configsList[0]._id || '' }));
		}
	}, [configsList, formData.configId]);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedEmails(new Set(emailList.map(e => e._id || '')));
		} else {
			setSelectedEmails(new Set());
		}
	};

	const handleSelectEmail = (emailId: string, checked: boolean) => {
		const newSelected = new Set(selectedEmails);
		if (checked) {
			newSelected.add(emailId);
		} else {
			newSelected.delete(emailId);
		}
		setSelectedEmails(newSelected);
	};

	const isAllSelected = emailList.length > 0 && emailList.every(e => selectedEmails.has(e._id || ''));

	const getDirectionColor = (direction: EmailLogType['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	const handleInputChange = (field: string) => (value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSendEmail = async () => {
		if (formData.to && formData.subject && formData.message) {
			const activeConfig = configsList.find(c => c._id === formData.configId);
			const fromDisplay = activeConfig ? `via ${activeConfig.name} (${activeConfig.fromEmail})` : '';

			try {
				await createEmailLog({
					recipientName: formData.to.split('@')[0],
					emailAddress: formData.to,
					subject: formData.subject,
					message: formData.message,
					status: 'sent',
					direction: 'outbound',
					companyId,
					configId: formData.configId,
				}).unwrap();

				toastSuccess(`Email sent successfully to ${formData.to} ${fromDisplay}`);
				setIsComposeOpen(false);
				setFormData(prev => ({ ...prev, to: '', subject: '', message: '' }));
			} catch (err) {
				const errorMsg = extractErrorMessage(err as ApiError, 'Failed to send email');
				toast.error(errorMsg);
			}
		}
	};

	// Configuration Handlers
	const handleConfigModalOpen = (config: EmailConfigType | null = null) => {
		if (config) {
			setEditingConfig(config);
			setConfigForm({
				name: config.name,
				provider: config.provider,
				host: config.host || '',
				port: config.port || 587,
				username: config.username || '',
				password: config.password || '',
				fromEmail: config.fromEmail,
				assignType: config.assignType,
				assignedId: config.assignedId,
				secure: config.secure || false,
				tenantId: config.tenantId || '',
				clientId: config.clientId || '',
				clientSecret: config.clientSecret || '',
				refreshToken: config.refreshToken || '',
			});
		} else {
			setEditingConfig(null);
			setConfigForm({
				name: '',
				provider: 'SMTP',
				host: '',
				port: 587,
				username: '',
				password: '',
				fromEmail: '',
				assignType: 'campaign',
				assignedId: campaigns[0]?._id || '',
				secure: false,
				tenantId: '',
				clientId: '',
				clientSecret: '',
				refreshToken: '',
			});
		}
		setIsConfigModalOpen(true);
	};

	const handleConfigFormChange = (field: string, value: string | number | boolean) => {
		setConfigForm(prev => {
			const updated = { ...prev, [field]: value };
			if (field === 'assignType') {
				updated.assignedId = value === 'campaign'
					? (campaigns[0]?._id || '')
					: (buckets[0]?.id || '');
			}
			return updated;
		});
	};

	const handleSaveConfig = async () => {
		if (!configForm.name || !configForm.fromEmail || !configForm.assignedId) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (configForm.provider === 'SMTP') {
			if (!configForm.host || !configForm.port || !configForm.username || !configForm.password) {
				toast.error('Please fill in all SMTP fields');
				return;
			}
		} else if (configForm.provider === 'Microsoft Outlook') {
			if (!configForm.tenantId || !configForm.clientId || !configForm.clientSecret) {
				toast.error('Please fill in all Microsoft Outlook API credentials');
				return;
			}
		}

		let assignedName = '';
		if (configForm.assignType === 'campaign') {
			const camp = campaigns.find((c: EmailCampaign) => c._id === configForm.assignedId);
			assignedName = camp?.campaignName || camp?.name || 'Unknown Campaign';
		} else {
			const bkt = buckets.find((b) => b.id === configForm.assignedId);
			assignedName = bkt ? `${bkt.campaignName} -> ${bkt.name}` : 'Unknown Bucket';
		}

		try {
			if (editingConfig && editingConfig._id) {
				await updateEmailConfig({
					id: editingConfig._id,
					data: { ...configForm, assignedName }
				}).unwrap();
				toast.success('Configuration updated successfully');
			} else {
				await createEmailConfig({
					...configForm,
					assignedName,
					companyId,
				}).unwrap();
				toast.success('Configuration created successfully');
			}
			setIsConfigModalOpen(false);
			setEditingConfig(null);
		} catch (err) {
			const errorMsg = extractErrorMessage(err as ApiError, 'Failed to save configuration');
			toast.error(errorMsg);
		}
	};

	const handleConnectOutlook = async () => {
		if (!configForm.name || !configForm.fromEmail || !configForm.assignedId) {
			toast.error('Please fill in all required fields (Name, From Email, Scope)');
			return;
		}
		if (!configForm.tenantId || !configForm.clientId || !configForm.clientSecret) {
			toast.error('Please fill in Tenant ID, Client ID, and Client Secret first');
			return;
		}

		let assignedName = '';
		if (configForm.assignType === 'campaign') {
			const camp = campaigns.find((c: EmailCampaign) => c._id === configForm.assignedId);
			assignedName = camp?.campaignName || camp?.name || 'Unknown Campaign';
		} else {
			const bkt = buckets.find((b) => b.id === configForm.assignedId);
			assignedName = bkt ? `${bkt.campaignName} -> ${bkt.name}` : 'Unknown Bucket';
		}

		try {
			let savedConfigId = '';
			if (editingConfig && editingConfig._id) {
				await updateEmailConfig({
					id: editingConfig._id,
					data: { ...configForm, assignedName }
				}).unwrap();
				savedConfigId = editingConfig._id;
			} else {
				const res = await createEmailConfig({
					...configForm,
					assignedName,
					companyId,
				}).unwrap();
				savedConfigId = res.config._id || '';
			}

			const activeRedirectUri = redirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/email/callback` : '');
			const authUrl = `https://login.microsoftonline.com/${configForm.tenantId}/oauth2/v2.0/authorize?client_id=${configForm.clientId}&response_type=code&redirect_uri=${encodeURIComponent(activeRedirectUri)}&response_mode=query&scope=${encodeURIComponent('offline_access Mail.Send User.Read')}&state=${savedConfigId}`;
			
			toast.loading('Redirecting to Microsoft authentication page...');
			window.location.href = authUrl;
		} catch (err) {
			const errorMsg = extractErrorMessage(err as ApiError, 'Failed to save configuration before redirect');
			toast.error(errorMsg);
		}
	};

	const handleDeleteConfig = async (id: string) => {
		try {
			await deleteEmailConfig(id).unwrap();
			toast.success('Configuration deleted');
		} catch (err) {
			const errorMsg = extractErrorMessage(err as ApiError, 'Failed to delete configuration');
			toast.error(errorMsg);
		}
	};

	// Reset scroll on close
	useEffect(() => {
		if (isComposeOpen || viewingEmail || isConfigModalOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isComposeOpen, viewingEmail, isConfigModalOpen]);

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Title & Tabs */}
			<div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeading text="Email Integration" />
				<Tabs
					tabs={[
						{ id: 'logs', label: 'Email Logs' },
						{ id: 'configs', label: 'Configurations' }
					]}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id as 'logs' | 'configs')}
					activeColor="var(--primary)"
				/>
			</div>

			{activeTab === 'logs' ? (
				<>
					{/* Logs tab view */}
					<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						<Search
							placeholder="Search Emails by recipient, subject, or message content"
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
									onClick={() => setIsComposeOpen(true)}
									className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
								>
									<EnvelopeClosedIcon className="w-4 h-4" />
									Compose Email
								</Button>
							)}
						</div>
					</div>

					{/* Email Table */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<TablePaginationHeader
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							onItemsPerPageChange={(value) => {
								setItemsPerPage(value);
								setCurrentPage(1);
							}}
							label="Email Logs"
						/>
						<div className="overflow-x-auto">
							<table
								className="min-w-full divide-y dark:divide-gray-700"
								style={{ borderColor: 'var(--light-gray)' }}
							>
								<thead
									className="dark:bg-gray-700 border-b dark:border-gray-700"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<tr>
										<th>
											<Checkbox
												checked={isAllSelected}
												onChange={handleSelectAll}
												size="medium"
											/>
										</th>
										<th>Recipient / Contact</th>
										<th>Email Address</th>
										<th>Subject</th>
										<th>Direction</th>
										<th>Status</th>
										<th>Timestamp</th>
									</tr>
								</thead>
								<tbody
									className="dark:bg-gray-800 divide-y dark:divide-gray-700"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									{isLogsLoading ? (
										<SVGLoaderFetch colSpan={7} text="Loading logs..." />
									) : emailList.length === 0 ? (
										<NoRecordFound colSpan={7} />
									) : emailList.map((email: EmailLogType) => {
										const directionColors = getDirectionColor(email.direction);
										return (
											<tr
												key={email._id}
												className="dark:hover:bg-gray-700"
												style={{ borderColor: 'var(--light-gray)' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = 'var(--accent-white)';
												}}
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<Checkbox
														checked={selectedEmails.has(email._id || '')}
														onChange={(checked) => handleSelectEmail(email._id || '', checked)}
														size="medium"
													/>
												</td>
												<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
													{email.recipientName || '-'}
												</td>
												<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
													{email.emailAddress}
												</td>
												<td
													className="px-6 py-4 dark:text-gray-100 max-w-xs truncate cursor-pointer hover:underline"
													style={{ color: 'var(--text-primary)' }}
													title={email.subject}
													onClick={() => setViewingEmail(email)}
													onMouseEnter={(e) => {
														e.currentTarget.style.color = campaignData?.primaryColor || '#050711';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.color = 'var(--text-primary)';
													}}
												>
													{email.subject}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
														style={{
															backgroundColor: directionColors.bg,
															color: directionColors.text,
															border: `1px solid ${directionColors.border}`
														}}
													>
														{email.direction === 'inbound' ? 'Inbound' : 'Outbound'}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<StatusBadge status={email.status} />
												</td>
												<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
													{new Date(email.createdAt).toLocaleString()}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination */}
					{totalItems > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							showEllipsis={true}
							maxVisiblePages={5}
							primaryColor={campaignData?.primaryColor || 'var(--primary)'}
							secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
						/>
					)}
				</>
			) : (
				<>
					{/* Configurations Tab View */}
					<div className="mb-6 flex justify-between items-center">
						<p className="text-[12px] text-gray-500">
							Configure outgoing email servers (SMTP, SendGrid, Mailgun) and assign them to Campaigns or specific Buckets.
						</p>
						<Button
							variant="primary"
							size="md"
							onClick={() => handleConfigModalOpen()}
							className="flex items-center gap-2 text-xs"
						>
							<PlusIcon className="w-4 h-4" />
							Add Email Config
						</Button>
					</div>

					{/* Configurations Table */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y dark:divide-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
								<thead
									className="dark:bg-gray-700 border-b dark:border-gray-700"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<tr>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Name</th>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Type</th>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>From Address</th>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Assigned To</th>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Scope</th>
										<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Action</th>
									</tr>
								</thead>
								<tbody className="divide-y dark:divide-gray-700">
									{isConfigsLoading ? (
										<SVGLoaderFetch colSpan={6} text="Loading configurations..." />
									) : configsList.length === 0 ? (
										<NoRecordFound colSpan={6} />
									) : (
										configsList.map((cfg) => (
											<tr
												key={cfg._id}
												className="dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 last:border-0"
												style={{ borderColor: 'var(--light-gray)' }}
											>
												<td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-100">{cfg.name}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{cfg.provider}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-300">{cfg.fromEmail}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-200">{cfg.assignedName}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs capitalize text-gray-500">
													<span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${cfg.assignType === 'campaign'
														? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
														: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
														}`}>
														{cfg.assignType}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs">
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleConfigModalOpen(cfg)}
															className="p-2 transition-colors h-auto rounded-full"
															title="Edit"
														>
															<GearIcon width={16} height={16} style={{ color: 'var(--text-secondary)' }} />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => cfg._id && handleDeleteConfig(cfg._id)}
															className="p-2 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20 h-auto"
															title="Delete"
														>
															<TrashIcon width={16} height={16} className="text-red-500" />
														</Button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}

			{/* Compose Email Modal */}
			{isComposeOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => !isSendingEmail && setIsComposeOpen(false)}>
					<div
						className="dark:bg-gray-800 shadow-lg w-full max-w-lg mx-4 rounded-[var(--radius)] overflow-hidden"
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
								<EnvelopeClosedIcon className="w-5 h-5 text-[#6C8B7D]" />
								Compose New Email
							</h2>
							<button
								onClick={() => setIsComposeOpen(false)}
								disabled={isSendingEmail}
								className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ color: 'var(--text-tertiary)' }}
							>
								<Cross2Icon className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6 space-y-6">
							{configsList.length > 0 ? (
								<Dropdown
									label="Sender Account / Configuration"
									value={formData.configId}
									options={configsList.map((cfg) => ({
										value: cfg._id || '',
										label: `${cfg.name} (${cfg.fromEmail}) — ${cfg.assignType === 'campaign' ? 'Campaign' : 'Bucket'}: ${cfg.assignedName}`
									}))}
									onChange={(val) => handleInputChange('configId')(val as string)}
								/>
							) : (
								<div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 rounded-lg text-[11px] text-yellow-800 dark:text-yellow-200">
									⚠️ No active Email Configuration found. Sending will use the Default Outbox Server. Set up configurations in the Configurations tab.
								</div>
							)}

							<Input
								label="To"
								placeholder="Enter recipient email address"
								value={formData.to}
								onChange={handleInputChange('to')}
								type="email"
								required
							/>

							<Input
								label="Subject"
								placeholder="Enter email subject"
								value={formData.subject}
								onChange={handleInputChange('subject')}
								type="text"
								required
							/>

							<Textarea
								label="Message Body"
								placeholder="Enter email message body"
								value={formData.message}
								onChange={handleInputChange('message')}
								rows={8}
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
								onClick={() => setIsComposeOpen(false)}
								disabled={isSendingEmail}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSendEmail}
								disabled={!formData.to || !formData.subject || !formData.message}
								loading={isSendingEmail}
							>
								Send Email
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Email Details Modal */}
			{viewingEmail && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
					onClick={() => setViewingEmail(null)}
				>
					<div
						className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg animate-in fade-in zoom-in duration-200 rounded-[var(--radius)]"
						style={{ backgroundColor: 'var(--accent-white)' }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div
							className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<div className="flex items-center gap-3">
								<EnvelopeOpenIcon
									className="w-6 h-6 dark:text-gray-300"
									style={{ color: 'var(--text-primary)' }}
								/>
								<h2
									className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Email Details
								</h2>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setViewingEmail(null)}
								className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 h-auto"
								style={{ color: 'var(--text-tertiary)' }}
							>
								<Icon name="Close_round_light" size="lg" />
							</Button>
						</div>

						{/* Modal Content */}
						<div className="p-6 space-y-6">
							<div>
								<label
									className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
									style={{ color: 'var(--text-secondary)' }}
								>
									Subject
								</label>
								<p
									className="text-base font-semibold dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{viewingEmail.subject}
								</p>
							</div>

							<div>
								<label
									className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
									style={{ color: 'var(--text-secondary)' }}
								>
									Message Body
								</label>
								<div
									className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg min-h-[140px] whitespace-pre-wrap break-words"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)'
									}}
								>
									{viewingEmail.message}
								</div>
							</div>

							{/* Details Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Email ID
									</label>
									<p
										className="text-[10px] md:text-[12px] dark:text-gray-100 font-mono"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingEmail._id}
									</p>
								</div>
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Recipient Contact
									</label>
									<p
										className="text-[10px] md:text-[12px] dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingEmail.recipientName || '-'}
									</p>
								</div>
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Email Address
									</label>
									<p
										className="text-[10px] md:text-[12px] dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{viewingEmail.emailAddress}
									</p>
								</div>
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Timestamp
									</label>
									<p
										className="text-[10px] md:text-[12px] dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{new Date(viewingEmail.createdAt).toLocaleString()}
									</p>
								</div>
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Direction
									</label>
									<span
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
										style={getDirectionColor(viewingEmail.direction)}
									>
										{viewingEmail.direction === 'inbound' ? 'Inbound' : 'Outbound'}
									</span>
								</div>
								<div>
									<label
										className="block text-[10px] md:text-[12px] font-medium mb-1 dark:text-gray-300"
										style={{ color: 'var(--text-secondary)' }}
									>
										Status
									</label>
									<span
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
										style={{
											backgroundColor: viewingEmail.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' :
												viewingEmail.status === 'sent' ? 'rgba(59, 130, 246, 0.1)' :
													viewingEmail.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
											color: viewingEmail.status === 'delivered' ? '#22C55E' :
												viewingEmail.status === 'sent' ? '#3B82F6' :
													viewingEmail.status === 'pending' ? '#FBBF24' : '#EF4444',
											border: `1px solid ${viewingEmail.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' :
												viewingEmail.status === 'sent' ? 'rgba(59, 130, 246, 0.2)' :
													viewingEmail.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
										}}
									>
										{viewingEmail.status.charAt(0).toUpperCase() + viewingEmail.status.slice(1)}
									</span>
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div
							className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<Button
								variant="outline"
								size="md"
								onClick={() => setViewingEmail(null)}
							>
								Close
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Email Config Modal */}
			{isConfigModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => !(isCreatingConfig || isUpdatingConfig) && setIsConfigModalOpen(false)}>
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
								{editingConfig ? 'Edit Email Config' : 'Create Email Config'}
							</h2>
							<button
								onClick={() => setIsConfigModalOpen(false)}
								disabled={isCreatingConfig || isUpdatingConfig}
								className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ color: 'var(--text-tertiary)' }}
							>
								<Cross2Icon className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
							<Input
								label="Configuration Name *"
								placeholder="e.g. Outcess Official SMTP"
								value={configForm.name}
								onChange={(val) => handleConfigFormChange('name', val)}
								required
							/>

							<Dropdown
								label="Email Provider Type *"
								value={configForm.provider}
								options={[
									{ value: 'SMTP', label: 'SMTP Server' },
									{ value: 'Microsoft Outlook', label: 'Microsoft Outlook API' },
									{ value: 'SendGrid', label: 'SendGrid API' },
									{ value: 'Mailgun', label: 'Mailgun API' },
									{ value: 'AWS SES', label: 'AWS SES' },
								]}
								onChange={(val) => handleConfigFormChange('provider', val as string)}
								required
							/>

							<Input
								label="From Email Address *"
								placeholder="e.g. notifications@outcess.com"
								value={configForm.fromEmail}
								onChange={(val) => handleConfigFormChange('fromEmail', val)}
								required
							/>

							{configForm.provider === 'SMTP' ? (
								<>
									<Input
										label="SMTP Host Address"
										placeholder="e.g. smtp.mailtrap.io"
										value={configForm.host}
										onChange={(val) => handleConfigFormChange('host', val)}
									/>
									<Input
										label="SMTP Port"
										type="number"
										value={configForm.port ? String(configForm.port) : ''}
										onChange={(val) => handleConfigFormChange('port', parseInt(val) || 587)}
									/>
									<div className="flex items-center mt-2 mb-3">
										<Checkbox
											id="configSecure"
											checked={configForm.secure}
											onChange={(checked) => handleConfigFormChange('secure', checked)}
											label="Use Secure Connection (SSL/TLS)"
											size="small"
										/>
									</div>
									<Input
										label="Username / SMTP Email"
										placeholder="e.g. user@domain.com"
										value={configForm.username}
										onChange={(val) => handleConfigFormChange('username', val)}
									/>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
											Password
										</label>
										<div className="relative flex items-center">
											<input
												type={showPassword ? 'text' : 'password'}
												placeholder="••••••••••••••••"
												value={configForm.password}
												onChange={(e) => handleConfigFormChange('password', e.target.value)}
												className="w-full px-4 py-2 pr-10 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
												style={{
													borderColor: 'var(--light-gray)',
													color: 'var(--text-primary)',
												}}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
												title={showPassword ? 'Hide' : 'Show'}
											>
												{showPassword ? (
													<EyeNoneIcon className="w-4 h-4" />
												) : (
													<EyeOpenIcon className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								</>
							) : configForm.provider === 'Microsoft Outlook' ? (
								<>
									<Input
										label="Tenant ID *"
										placeholder="Enter Microsoft Azure Tenant ID"
										value={configForm.tenantId}
										onChange={(val) => handleConfigFormChange('tenantId', val)}
										required
									/>
									<Input
										label="Client ID *"
										placeholder="Enter Application (Client) ID"
										value={configForm.clientId}
										onChange={(val) => handleConfigFormChange('clientId', val)}
										required
									/>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
											Client Secret *
										</label>
										<div className="relative flex items-center">
											<input
												type={showClientSecret ? 'text' : 'password'}
												placeholder="••••••••••••••••"
												value={configForm.clientSecret}
												onChange={(e) => handleConfigFormChange('clientSecret', e.target.value)}
												className="w-full px-4 py-2 pr-10 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
												style={{
													borderColor: 'var(--light-gray)',
													color: 'var(--text-primary)',
												}}
											/>
											<button
												type="button"
												onClick={() => setShowClientSecret(!showClientSecret)}
												className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
												title={showClientSecret ? 'Hide' : 'Show'}
											>
												{showClientSecret ? (
													<EyeNoneIcon className="w-4 h-4" />
												) : (
													<EyeOpenIcon className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
									<div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg text-xs space-y-1 my-2">
										<p className="font-semibold text-blue-800 dark:text-blue-300">
											⚠️ Required Azure App Registration Step:
										</p>
										<p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
											You must register this exact Redirect URI in your Azure Portal (under <strong>Authentication ➔ Web Platform ➔ Redirect URIs</strong>):
										</p>
										<div className="flex items-center gap-2 mt-1 bg-white dark:bg-gray-800 p-2 rounded-md border dark:border-gray-700">
											<code className="text-[10px] select-all break-all text-gray-800 dark:text-gray-200 flex-1 font-mono">
												{redirectUri || 'Loading...'}
											</code>
											{redirectUri && (
												<button
													type="button"
													onClick={handleCopyRedirectUri}
													className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer shrink-0"
												>
													Copy
												</button>
											)}
										</div>
									</div>
									<div className="pt-2">
										<Button
											variant="muted-sage-green"
											size="md"
											fullWidth={true}
											onClick={handleConnectOutlook}
											disabled={isCreatingConfig || isUpdatingConfig}
										>
											Connect Microsoft Account
										</Button>
										<p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 text-center px-1">
											Clicking will save the credentials and redirect you to Microsoft&apos;s secure login screen to link your account.
										</p>
									</div>
								</>
							) : (
								<>
									<Input
										label="API Endpoint / Host"
										placeholder="e.g. api.sendgrid.com"
										value={configForm.host}
										onChange={(val) => handleConfigFormChange('host', val)}
									/>
									<Input
										label="Username / API Key"
										placeholder="Enter API username or Key Identifier"
										value={configForm.username}
										onChange={(val) => handleConfigFormChange('username', val)}
									/>
									<div className="flex flex-col gap-1">
										<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
											Password / Secret Token
										</label>
										<div className="relative flex items-center">
											<input
												type={showPassword ? 'text' : 'password'}
												placeholder="••••••••••••••••"
												value={configForm.password}
												onChange={(e) => handleConfigFormChange('password', e.target.value)}
												className="w-full px-4 py-2 pr-10 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
												style={{
													borderColor: 'var(--light-gray)',
													color: 'var(--text-primary)',
												}}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
												title={showPassword ? 'Hide' : 'Show'}
											>
												{showPassword ? (
													<EyeNoneIcon className="w-4 h-4" />
												) : (
													<EyeOpenIcon className="w-4 h-4" />
												)}
											</button>
										</div>
									</div>
								</>
							)}

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
									? campaigns.map((c: EmailCampaign) => ({
										value: c._id,
										label: c.campaignName || c.name || 'Unnamed Campaign'
									}))
									: buckets.map((b) => ({
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
								disabled={isCreatingConfig || isUpdatingConfig}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSaveConfig}
								loading={isCreatingConfig || isUpdatingConfig}
							>
								{editingConfig ? 'Save Changes' : 'Create Config'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmailPage;
