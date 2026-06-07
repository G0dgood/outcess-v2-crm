'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Checkbox from '@/components/ui/Checkbox';
import PageHeading from '@/components/ui/PageHeading';
import { EnvelopeClosedIcon, EnvelopeOpenIcon, Cross2Icon, GearIcon, TrashIcon, PlusIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';
import StatusBadge from '@/components/ui/StatusBadge';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useCampaign } from '@/contexts/CampaignContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import { toastSuccess } from '@/utils/toastWithSound';
import { toast } from 'sonner';

export interface EmailLog {
	id: string;
	recipientName?: string;
	emailAddress: string;
	subject: string;
	message: string;
	status: 'sent' | 'delivered' | 'failed' | 'pending';
	direction: 'inbound' | 'outbound';
	timestamp: string;
}

export interface EmailConfig {
	id: string;
	name: string;
	provider: string;
	host?: string;
	port?: number;
	username?: string;
	password?: string;
	fromEmail: string;
	assignType: 'campaign' | 'bucket';
	assignedId: string;
	assignedName: string;
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
	const campaigns = (campaignQueryData as any)?.campaigns || [];

	// Extract all buckets from campaigns
	const buckets = useMemo(() => {
		return campaigns.flatMap((c: any) => {
			const bList = c.dashboardSettings?.buckets || [];
			return bList.map((b: any) => ({
				id: b.id,
				name: b.name,
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
	const [viewingEmail, setViewingEmail] = useState<EmailLog | null>(null);
	const [isComposeOpen, setIsComposeOpen] = useState(false);
	
	const [formData, setFormData] = useState({
		to: '',
		subject: '',
		message: '',
		configId: '',
	});

	// Email Configurations states
	const [configsList, setConfigsList] = useState<EmailConfig[]>([]);
	const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
	const [editingConfig, setEditingConfig] = useState<EmailConfig | null>(null);
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
	});

	// Load configs from local storage
	useEffect(() => {
		const saved = localStorage.getItem('outcess-email-configs');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setConfigsList(parsed);
				if (parsed.length > 0) {
					setFormData(prev => ({ ...prev, configId: parsed[0].id }));
				}
			} catch {
				setConfigsList([]);
			}
		}
	}, []);

	// Save configurations to local storage
	const saveConfigs = (newConfigs: EmailConfig[]) => {
		setConfigsList(newConfigs);
		localStorage.setItem('outcess-email-configs', JSON.stringify(newConfigs));
	};

	const [emailList, setEmailList] = useState<EmailLog[]>([
		{
			id: 'EML001',
			recipientName: 'John Doe',
			emailAddress: 'johndoe@example.com',
			subject: 'Welcome to Outcess CRM!',
			message: 'Thank you for choosing Outcess CRM. We are excited to help you streamline your customer relation operations.',
			status: 'delivered',
			direction: 'outbound',
			timestamp: '2024-01-15 10:30 AM',
		},
		{
			id: 'EML002',
			recipientName: 'Jane Smith',
			emailAddress: 'janesmith@example.com',
			subject: 'Inquiry about Enterprise Pricing',
			message: 'Hello Support, I would like to get a customized quote for 50+ users and custom integrations.',
			status: 'sent',
			direction: 'inbound',
			timestamp: '2024-01-15 09:15 AM',
		},
		{
			id: 'EML003',
			recipientName: 'Robert Johnson',
			emailAddress: 'robertj@example.com',
			subject: 'Your Account Verification',
			message: 'Please click the link below to verify your email and complete your workspace setup.',
			status: 'delivered',
			direction: 'outbound',
			timestamp: '2024-01-14 03:45 PM',
		},
		{
			id: 'EML004',
			recipientName: 'Alice Brown',
			emailAddress: 'alice.brown@example.com',
			subject: 'Monthly Usage Report',
			message: 'Your monthly performance and usage dashboard report is ready. Click to download the PDF.',
			status: 'pending',
			direction: 'outbound',
			timestamp: '2024-01-14 11:20 AM',
		},
		{
			id: 'EML005',
			recipientName: 'Michael Green',
			emailAddress: 'mgreen@example.com',
			subject: 'Failed Payment Notification',
			message: 'Warning: We could not process your recurring payment. Please update your payment details to avoid interruption.',
			status: 'failed',
			direction: 'outbound',
			timestamp: '2024-01-13 04:30 PM',
		},
	]);

	const filteredEmails = emailList.filter(email =>
		email.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
		email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
		email.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
		email.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(email.recipientName && email.recipientName.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
	const currentEmails = filteredEmails.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedEmails(new Set(currentEmails.map(e => e.id)));
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

	const isAllSelected = currentEmails.length > 0 && currentEmails.every(e => selectedEmails.has(e.id));

	const getDirectionColor = (direction: EmailLog['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	const handleInputChange = (field: string) => (value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSendEmail = () => {
		if (formData.to && formData.subject && formData.message) {
			const activeConfig = configsList.find(c => c.id === formData.configId);
			const fromDisplay = activeConfig ? `via ${activeConfig.name} (${activeConfig.fromEmail})` : '';

			const newEmail: EmailLog = {
				id: `EML00${emailList.length + 1}`,
				recipientName: formData.to.split('@')[0],
				emailAddress: formData.to,
				subject: formData.subject,
				message: formData.message,
				status: 'sent',
				direction: 'outbound',
				timestamp: new Date().toLocaleString(),
			};
			setEmailList(prev => [newEmail, ...prev]);
			toastSuccess(`Email sent successfully to ${formData.to} ${fromDisplay}`);
			setIsComposeOpen(false);
			setFormData(prev => ({ ...prev, to: '', subject: '', message: '' }));
		}
	};

	// Configuration Handlers
	const handleConfigModalOpen = (config: EmailConfig | null = null) => {
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
			});
		}
		setIsConfigModalOpen(true);
	};

	const handleConfigFormChange = (field: string, value: any) => {
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

	const handleSaveConfig = () => {
		if (!configForm.name || !configForm.fromEmail || !configForm.assignedId) {
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

		if (editingConfig) {
			const updatedConfigs = configsList.map(c => 
				c.id === editingConfig.id 
					? { ...c, ...configForm, assignedName } 
					: c
			);
			saveConfigs(updatedConfigs);
			toast.success('Configuration updated successfully');
		} else {
			const newConfig: EmailConfig = {
				id: `EMLCFG-${Date.now()}`,
				...configForm,
				assignedName,
			};
			const list = [...configsList, newConfig];
			saveConfigs(list);
			if (list.length === 1) {
				setFormData(prev => ({ ...prev, configId: newConfig.id }));
			}
			toast.success('Configuration created successfully');
		}

		setIsConfigModalOpen(false);
		setEditingConfig(null);
	};

	const handleDeleteConfig = (id: string) => {
		const updated = configsList.filter(c => c.id !== id);
		saveConfigs(updated);
		toast.success('Configuration deleted');
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
				<div className="flex border-b dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<button
						onClick={() => setActiveTab('logs')}
						className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === 'logs'
								? 'border-orange-500 text-orange-500'
								: 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
						}`}
					>
						Email Logs
					</button>
					<button
						onClick={() => setActiveTab('configs')}
						className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
							activeTab === 'configs'
								? 'border-orange-500 text-orange-500'
								: 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
						}`}
					>
						Configurations
					</button>
				</div>
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
							totalItems={filteredEmails.length}
							itemsPerPage={itemsPerPage}
							onItemsPerPageChange={(value) => {
								setItemsPerPage(value);
								setCurrentPage(1);
							}}
							label="Emails"
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
										<th>ID</th>
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
									{currentEmails.map((email) => {
										const directionColors = getDirectionColor(email.direction);
										return (
											<tr
												key={email.id}
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
														checked={selectedEmails.has(email.id)}
														onChange={(checked) => handleSelectEmail(email.id, checked)}
														size="medium"
													/>
												</td>
												<td className="px-6 py-4 whitespace-nowrap dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
													{email.id}
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
													{email.timestamp}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination */}
					{filteredEmails.length > 0 && (
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
									{configsList.length === 0 ? (
										<tr>
											<td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs">
												No Email configurations found. Click "Add Email Config" to set up your first integration server.
											</td>
										</tr>
									) : (
										configsList.map((cfg) => (
											<tr
												key={cfg.id}
												className="dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 last:border-0"
												style={{ borderColor: 'var(--light-gray)' }}
											>
												<td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-100">{cfg.name}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{cfg.provider}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-300">{cfg.fromEmail}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-200">{cfg.assignedName}</td>
												<td className="px-6 py-4 whitespace-nowrap text-xs capitalize text-gray-500">
													<span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${
														cfg.assignType === 'campaign' 
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
															onClick={() => handleDeleteConfig(cfg.id)}
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
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setIsComposeOpen(false)}>
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
								className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full"
								style={{ color: 'var(--text-tertiary)' }}
							>
								<Cross2Icon className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-6 space-y-6">
							{configsList.length > 0 ? (
								<div className="flex flex-col gap-1.5">
									<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
										Sender Account / Configuration
									</label>
									<select
										value={formData.configId}
										onChange={(e) => handleInputChange('configId')(e.target.value)}
										className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden"
										style={{
											backgroundColor: 'var(--bg-primary)',
											borderColor: 'var(--light-gray)',
											color: 'var(--text-primary)',
										}}
									>
										{configsList.map((cfg) => (
											<option key={cfg.id} value={cfg.id}>
												{cfg.name} ({cfg.fromEmail}) — {cfg.assignType === 'campaign' ? 'Campaign' : 'Bucket'}: {cfg.assignedName}
											</option>
										))}
									</select>
								</div>
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
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSendEmail}
								disabled={!formData.to || !formData.subject || !formData.message}
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
										{viewingEmail.id}
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
										{viewingEmail.timestamp}
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
								{editingConfig ? 'Edit Email Config' : 'Create Email Config'}
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
								placeholder="e.g. Outcess Official SMTP"
								value={configForm.name}
								onChange={(val) => handleConfigFormChange('name', val)}
								required
							/>

							<div className="flex flex-col gap-1.5">
								<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
									Email Provider Type *
								</label>
								<select
									value={configForm.provider}
									onChange={(e) => handleConfigFormChange('provider', e.target.value)}
									className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)',
									}}
								>
									<option value="SMTP">SMTP Server</option>
									<option value="SendGrid">SendGrid API</option>
									<option value="Mailgun">Mailgun API</option>
									<option value="AWS SES">AWS SES</option>
								</select>
							</div>

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
								</>
							) : (
								<Input
									label="API Endpoint / Host"
									placeholder="e.g. api.sendgrid.com"
									value={configForm.host}
									onChange={(val) => handleConfigFormChange('host', val)}
								/>
							)}

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
								<input
									type="password"
									placeholder="••••••••••••••••"
									value={configForm.password}
									onChange={(e) => handleConfigFormChange('password', e.target.value)}
									className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden dark:bg-gray-700"
									style={{
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)',
									}}
								/>
							</div>

							<div className="flex flex-col gap-1.5 border-t dark:border-gray-700 pt-3 mt-3">
								<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
									Assign To Scope *
								</label>
								<select
									value={configForm.assignType}
									onChange={(e) => handleConfigFormChange('assignType', e.target.value)}
									className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)',
									}}
								>
									<option value="campaign">Campaign</option>
									<option value="bucket">Bucket</option>
								</select>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
									Select Target *
								</label>
								<select
									value={configForm.assignedId}
									onChange={(e) => handleConfigFormChange('assignedId', e.target.value)}
									className="w-full px-4 py-2 border rounded-[var(--radius)] text-[12px] focus:outline-hidden"
									style={{
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-primary)',
									}}
								>
									{configForm.assignType === 'campaign' ? (
										campaigns.map((c: any) => (
											<option key={c._id} value={c._id}>
												{c.campaignName || c.name || 'Unnamed Campaign'}
											</option>
										))
									) : (
										buckets.map((b: any) => (
											<option key={b.id} value={b.id}>
												{b.campaignName} ➔ {b.name}
											</option>
										))
									)}
								</select>
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
		</div>
	);
};

export default EmailPage;
