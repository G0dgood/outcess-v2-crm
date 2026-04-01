'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeading from '@/components/ui/PageHeading';
import { Modal } from '@/components/ui/Modal';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetIntegrationsByLobIdQuery, useUpdateIntegrationMutation, Integration } from '@/store/services/integrationsApi';
import { toast } from 'sonner';
import IntegrationCard from '@/components/features/integrations/IntegrationCard';

interface ConnectionForm {
	workspaceUrl?: string;
	apiToken?: string;
	webhookUrl?: string;
	channel?: string;
	email?: string;
	smtpHost?: string;
	smtpPort?: string;
	smtpUser?: string;
	smtpPass?: string;
	senderName?: string;
}

const IntegrationsPage: React.FC = () => {
	const { canAccess } = usePrivilege();
	const { selectedLineOfBusinessId } = useLineOfBusiness();
	const { user } = useUserInfo();
	
	const canAccessModule = canAccess('systemSetting');
	const canEdit = canAccess('systemSetting', 'edit');

	const companyId = user?.companyId || user?.company?._id || '';

	const { data: integrationsData, isLoading: isFetching } = useGetIntegrationsByLobIdQuery(
		{ lineOfBusinessId: selectedLineOfBusinessId || '', companyId },
		{ skip: !selectedLineOfBusinessId || !companyId }
	);

	const [updateIntegration, { isLoading: isUpdating }] = useUpdateIntegrationMutation();

	const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
	const [connectingIntegration, setConnectingIntegration] = useState<Integration | null>(null);
	const [connectionForm, setConnectionForm] = useState<ConnectionForm>({
		workspaceUrl: '',
		apiToken: '',
		webhookUrl: '',
		channel: '',
		email: '',
	});

	const handleConnectClick = (integration: Integration) => {
		setConnectingIntegration(integration);
		setConnectionForm({
			workspaceUrl: integration.config?.workspaceUrl || '',
			apiToken: integration.config?.apiToken || '',
			webhookUrl: integration.config?.webhookUrl || '',
			channel: integration.config?.channel || '',
			email: integration.config?.email || '',
		});
		setIsConnectModalOpen(true);
	};

	const handleConnect = async () => {
		if (!connectingIntegration || !canEdit) return;

		try {
			await updateIntegration({
				id: connectingIntegration._id,
				status: 'connected',
				config: connectionForm
			}).unwrap();
			
			toast.success(`${connectingIntegration.name} connected successfully`);
			setIsConnectModalOpen(false);
			setConnectingIntegration(null);
		} catch (error) {
			console.error('Connection failed:', error);
			toast.error('Failed to connect integration');
		}
	};

	const handleDisconnect = async (integration: Integration) => {
		if (!canEdit) return;
		
		try {
			await updateIntegration({
				id: integration._id,
				status: 'disconnected',
				config: {}
			}).unwrap();
			
			toast.success(`${integration.name} disconnected`);
		} catch (error) {
			console.error('Disconnection failed:', error);
			toast.error('Failed to disconnect');
		}
	};

	const getIntegrationFields = (type: string) => {
		switch (type) {
			case 'slack':
				return [
					{ key: 'workspaceUrl', label: 'Workspace URL', placeholder: 'e.g., yourworkspace.slack.com', required: true },
					{ key: 'apiToken', label: 'API Token', placeholder: 'xoxb-your-token', required: true, type: 'password' },
					{ key: 'channel', label: 'Default Channel', placeholder: '#notifications', required: false },
				];
			case 'webhook':
				return [
					{ key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://your-app.com/webhook', required: true },
				];
			case 'email':
				return [
					{ key: 'email', label: 'Support Email Address', placeholder: 'support@yourdomain.com', required: true, type: 'email' },
					{ key: 'smtpHost', label: 'SMTP Host', placeholder: 'e.g., smtp.gmail.com', required: true },
					{ key: 'smtpPort', label: 'SMTP Port', placeholder: 'e.g., 465 (SSL) or 587 (TLS)', required: true },
					{ key: 'smtpUser', label: 'SMTP User', placeholder: 'Your email/username', required: true },
					{ key: 'smtpPass', label: 'SMTP Password', placeholder: 'App password or token', required: true, type: 'password' },
					{ key: 'senderName', label: 'Sender Name', placeholder: 'e.g., Peoplely Support', required: false },
				];
			case 'zapier':
				return [
					{ key: 'webhookUrl', label: 'Zapier Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true },
				];
			default:
				return [];
		}
	};

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Title */}
			<div className="mb-6 flex items-start justify-between">
				<PageHeading text="Integrations" />
			</div>

			{/* Description */}
			<div className="mb-6">
				<p
					className="text-[10px] md:text-[12px] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Connect Peoplely with your favorite tools and services to streamline your workflow.
				</p>
			</div>

			{/* Integrations Grid */}
			{isFetching ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3, 4].map(i => (
						<div 
							key={i} 
							className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col gap-4"
						>
							<div className="flex gap-3">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
								<div className="flex flex-col gap-2">
									<div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
									<div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
								</div>
							</div>
							<div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded" />
							<div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded mt-auto" />
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{integrationsData?.integrations?.map((integration) => (
						<IntegrationCard
							key={integration._id}
							integration={integration}
							canEdit={canEdit}
							isUpdating={isUpdating}
							onConnect={handleConnectClick}
							onDisconnect={handleDisconnect}
						/>
					))}
				</div>
			)}

			{/* Connect Integration Modal */}
			<Modal
				isOpen={isConnectModalOpen}
				onClose={() => {
					setIsConnectModalOpen(false);
					setConnectingIntegration(null);
				}}
				title={`Connect ${connectingIntegration?.name}`}
				size="md"
			>
				<div className="p-6">
					{connectingIntegration && (
						<>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400 mb-6"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{connectingIntegration.description}
							</p>

							<div className="space-y-4">
								{getIntegrationFields(connectingIntegration.type).map((field) => (
									<Input
										key={field.key}
										label={field.label}
										placeholder={field.placeholder}
										value={connectionForm[field.key as keyof typeof connectionForm]}
										onChange={(value) =>
											setConnectionForm((prev) => ({
												...prev,
												[field.key]: value,
											}))
										}
										type={(field.type as 'text' | 'email' | 'password' | 'number' | 'tel') || 'text'}
										required={field.required}
									/>
								))}
							</div>

							{connectingIntegration.type === 'slack' && (
								<div className="mt-4 p-3 dark:bg-gray-700 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
									<p
										className="text-[8px] md:text-[10px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										<strong>How to get your Slack API Token:</strong>
										<br />
										1. Go to{' '}
										<a
											href="https://api.slack.com/apps"
											target="_blank"
											rel="noopener noreferrer"
											className="underline"
											style={{ color: 'var(--primary)' }}
										>
											api.slack.com/apps
										</a>
										<br />
										2. Create a new app or select an existing one
										<br />
										3. Go to &quot;OAuth & Permissions&quot; and copy your Bot User OAuth Token
									</p>
								</div>
							)}
						</>
					)}
				</div>

				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={() => {
							setIsConnectModalOpen(false);
							setConnectingIntegration(null);
						}}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleConnect}
						loading={isUpdating}
						disabled={
							!connectingIntegration ||
							getIntegrationFields(connectingIntegration.type).some(
								field => field.required && !connectionForm[field.key as keyof typeof connectionForm]
							)
						}
					>
						Connect
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default IntegrationsPage;
