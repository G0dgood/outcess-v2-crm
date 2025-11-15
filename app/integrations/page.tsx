'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';
import Icon from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Link2Icon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';

interface Integration {
	id: string;
	name: string;
	description: string;
	icon: string;
	status: 'connected' | 'disconnected';
	connectedAt?: string;
	config?: {
		workspaceUrl?: string;
		apiToken?: string;
		webhookUrl?: string;
		channel?: string;
		email?: string;
	};
}

const IntegrationsPage: React.FC = () => {
	const { setupData } = useSetup();
	const [integrations, setIntegrations] = useState<Integration[]>([
		{
			id: 'slack',
			name: 'Slack',
			description: 'Connect with Slack to receive notifications and updates in your workspace channels.',
			icon: 'slack',
			status: 'disconnected',
		},
		{
			id: 'zapier',
			name: 'Zapier',
			description: 'Automate workflows and connect Peoplely with 5000+ apps through Zapier.',
			icon: 'zapier',
			status: 'disconnected',
		},
		{
			id: 'webhook',
			name: 'Webhooks',
			description: 'Set up custom webhooks to send data to your own applications.',
			icon: 'webhook',
			status: 'disconnected',
		},
		{
			id: 'email',
			name: 'Email Integration',
			description: 'Connect your email service to send and receive emails directly from Peoplely.',
			icon: 'email',
			status: 'disconnected',
		},
	]);

	const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
	const [connectingIntegration, setConnectingIntegration] = useState<Integration | null>(null);
	const [connectionForm, setConnectionForm] = useState({
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

	const handleConnect = () => {
		if (!connectingIntegration) return;

		setIntegrations(prev =>
			prev.map(integration =>
				integration.id === connectingIntegration.id
					? {
						...integration,
						status: 'connected' as const,
						connectedAt: new Date().toISOString(),
						config: {
							workspaceUrl: connectionForm.workspaceUrl,
							apiToken: connectionForm.apiToken,
							webhookUrl: connectionForm.webhookUrl,
							channel: connectionForm.channel,
							email: connectionForm.email,
						},
					}
					: integration
			)
		);

		setIsConnectModalOpen(false);
		setConnectingIntegration(null);
		setConnectionForm({
			workspaceUrl: '',
			apiToken: '',
			webhookUrl: '',
			channel: '',
			email: '',
		});
	};

	const handleDisconnect = (integrationId: string) => {
		setIntegrations(prev =>
			prev.map(integration =>
				integration.id === integrationId
					? {
						...integration,
						status: 'disconnected' as const,
						connectedAt: undefined,
						config: undefined,
					}
					: integration
			)
		);
	};

	const getIntegrationFields = (integrationId: string) => {
		switch (integrationId) {
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
					{ key: 'email', label: 'Email Address', placeholder: 'your-email@example.com', required: true, type: 'email' },
				];
			case 'zapier':
				return [
					{ key: 'webhookUrl', label: 'Zapier Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true },
				];
			default:
				return [];
		}
	};

	return (
		<div>
			{/* Title */}
			<div className="mb-6 flex items-start justify-between">
				<PageHeading text="Integrations" />
			</div>

			{/* Description */}
			<div className="mb-6">
				<p
					className="text-sm dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Connect Peoplely with your favorite tools and services to streamline your workflow.
				</p>
			</div>

			{/* Integrations Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{integrations.map((integration) => (
					<div
						key={integration.id}
						className="p-6 dark:bg-gray-800 border dark:border-gray-700"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						{/* Integration Header */}
						<div className="flex items-start justify-between mb-4">
							<div className="flex items-center gap-3">
								<div
									className="w-12 h-12 flex items-center justify-center rounded-lg dark:bg-gray-700"
									style={{ backgroundColor: 'var(--bg-primary)' }}
								>
									<Link2Icon
										className="w-6 h-6 dark:text-gray-300"
										style={{ color: 'var(--text-primary)' }}
									/>
								</div>
								<div>
									<h3
										className="font-inter font-semibold text-base dark:text-gray-100 mb-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{integration.name}
									</h3>
									{integration.status === 'connected' && (
										<div className="flex items-center gap-1">
											<div
												className="w-2 h-2 rounded-full"
												style={{ backgroundColor: '#22C55E' }}
											/>
											<span
												className="text-xs dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Connected
											</span>
										</div>
									)}
								</div>
							</div>
							{integration.status === 'connected' && (
								<button
									onClick={() => handleDisconnect(integration.id)}
									className="p-1 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
									style={{ color: 'var(--text-tertiary)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = '#DC2626';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}}
									title="Disconnect"
								>
									<Cross2Icon className="w-4 h-4" />
								</button>
							)}
						</div>

						{/* Integration Description */}
						<p
							className="text-sm dark:text-gray-400 mb-4"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{integration.description}
						</p>

						{/* Connect/Disconnect Button */}
						{integration.status === 'disconnected' ? (
							<Button
								variant="primary"
								size="md"
								onClick={() => handleConnectClick(integration)}
								className="w-full"
							>
								Connect
							</Button>
						) : (
							<Button
								variant="outline"
								size="md"
								onClick={() => handleDisconnect(integration.id)}
								className="w-full"
							>
								Disconnect
							</Button>
						)}
					</div>
				))}
			</div>

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
								className="text-sm dark:text-gray-400 mb-6"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{connectingIntegration.description}
							</p>

							<div className="space-y-4">
								{getIntegrationFields(connectingIntegration.id).map((field) => (
									<Input
										key={field.key}
										label={field.label}
										placeholder={field.placeholder}
										value={connectionForm[field.key as keyof typeof connectionForm]}
										onChange={(value) =>
											setConnectionForm(prev => ({
												...prev,
												[field.key]: value,
											}))
										}
										type={(field.type as 'text' | 'email' | 'password' | 'number' | 'tel') || 'text'}
										required={field.required}
									/>
								))}
							</div>

							{connectingIntegration.id === 'slack' && (
								<div className="mt-4 p-3 dark:bg-gray-700 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
									<p
										className="text-xs dark:text-gray-400"
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
										3. Go to "OAuth & Permissions" and copy your Bot User OAuth Token
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
						disabled={
							!connectingIntegration ||
							getIntegrationFields(connectingIntegration.id).some(
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

