'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';

interface ConfigurationDetail {
	label: string;
	value: string;
}

interface ConfigurationCard {
	id: string;
	title: string;
	icon: string;
	step: number;
	details: ConfigurationDetail[];
}

export default function ReviewConfigurationPage(): React.JSX.Element {
	const { setupData, setCurrentStep } = useSetup();



	const handleEditStep = (step: number) => {
		// Navigate back to specific step for editing
		setCurrentStep(step);
	};

	const configurationCards: ConfigurationCard[] = [
		{
			id: 'basic-setup',
			title: 'Basic Setup',
			icon: 'Setting_line_light',
			step: 1,
			details: [
				{ label: 'Company Name', value: setupData.companyName || 'Not configured' },
				{ label: 'Industry', value: setupData.industry || 'Not configured' },
				{ label: 'Time Zone', value: setupData.timeZone || 'Not configured' },
				{ label: 'Size', value: setupData.businessSize || 'Not configured' }
			]
		},
		{
			id: 'header-navigation',
			title: 'Header & Navigation',
			icon: 'darhboard',
			step: 2,
			details: [
				{ label: 'Menu Layout', value: setupData.navigationSettings.menuStyle || 'Not configured' },
				{ label: 'Primary Color', value: setupData.primaryColor || 'Not configured' },
				{ label: 'Secondary Color', value: setupData.secondaryColor || 'Not configured' },
				{ label: 'Logo', value: setupData.navigationSettings.logo ? 'Uploaded' : 'Not uploaded' }
			]
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			icon: 'darhboard',
			step: 3,
			details: [
				{ label: 'Dashboard Name', value: setupData.dashboardSettings.dashboardName || 'Not configured' },
				{ label: 'Visibility', value: setupData.dashboardSettings.dashboardVisibility || 'Not configured' },
				{ label: 'Widgets', value: `${setupData.dashboardSettings.widgets.length} configured` },
				{ label: 'Dispositions', value: `${setupData.dashboardSettings.dispositions.length} configured` },
				{ label: 'Call Outcomes', value: `${setupData.dashboardSettings.callOutcomes.length} configured` },
				{ label: 'Charts', value: `${setupData.dashboardSettings.dispositionSettings.charts.length} configured` },
				{ label: 'Time Range View', value: setupData.dashboardSettings.dispositionSettings.timeRangeView || 'Not configured' }
			]
		},
		{
			id: 'customer-book',
			title: 'Customer Book',
			icon: 'Group_light',
			step: 4,
			details: [
				{ label: 'Custom Fields', value: `${setupData.customerBookSettings.configuredFields.length} added` },
				{ label: 'Required Fields', value: `${setupData.customerBookSettings.configuredFields.filter(field => field.required).length} set` }
			]
		},
		{
			id: 'user-management',
			title: 'User Management',
			icon: 'User_alt_light',
			step: 5,
			details: [
				{ label: 'Roles Defined', value: `${setupData.roleManagementSettings.roles.length} roles` },
				{ label: 'Users Added', value: `${setupData.userManagementSettings.users.length} users` },
				{ label: 'Modules', value: `${setupData.roleManagementSettings.modules.length} modules` },
				{ label: 'Permission Categories', value: `${setupData.permissionAccessSettings.permissionCategories.length} categories` },
				{ label: 'Selected Role', value: setupData.permissionAccessSettings.selectedRole || 'Not selected' }
			]
		}
	];

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1
					className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
					style={{ color: 'var(--text-secondary)' }}
				>
					Review Your CRM Configuration
				</h1>
				<p
					className="font-lato not-italic font-normal text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Please review all your selections before submitting for approval
				</p>
			</div>

			{/* Configuration Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{configurationCards.map((card) => (
					<div
						key={card.id}
						className="dark:bg-gray-800 border dark:border-gray-700"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<div
							className="p-6 border-b dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										className="w-8 h-8 dark:bg-gray-700 rounded-full flex items-center justify-center"
										style={{ backgroundColor: 'var(--bg-primary)' }}
									>
										<Icon name={card.icon} size="md" />
									</div>
									<h2
										className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{card.title}
									</h2>
								</div>
								<button
									onClick={() => handleEditStep(card.step)}
									className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
									style={{ color: 'var(--text-tertiary)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = 'var(--text-secondary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}}
									title={`Edit ${card.title}`}
								>
									<Icon name="Edit_duotone_line" size="sm" />
								</button>
							</div>
						</div>

						<div className="p-6 space-y-3">
							{card.details.map((detail, index) => (
								<div key={index} className="flex justify-between items-start">
									<span
										className="font-lato text-[10px] md:text-[12px] dark:text-gray-400 flex-1"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{detail.label}:
									</span>
									<span
										className="font-lato text-[10px] md:text-[12px] font-medium dark:text-gray-100 text-right ml-4"
										style={{ color: 'var(--text-primary)' }}
									>
										{detail.value}
									</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
