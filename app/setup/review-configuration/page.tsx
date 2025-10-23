'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';

export default function ReviewConfigurationPage() {
	const router = useRouter();
	const { setupData } = useSetup();

	const handleSubmitForApproval = () => {
		console.log('Submitting CRM configuration for approval:', setupData);
		// TODO: Implement submission logic
		router.push('/dashboard'); // Navigate to main dashboard after approval
	};

	const handleEditStep = (step: number) => {
		// Navigate back to specific step for editing
		router.push(`/setup?step=${step}`);
	};

	const configurationCards = [
		{
			id: 'basic-setup',
			title: 'Basic Setup',
			icon: 'Setting_line_light',
			step: 1,
			details: [
				{ label: 'Company Name', value: setupData.companyName || 'TechCorp Solutions' },
				{ label: 'Industry', value: setupData.industry || 'Communication' },
				{ label: 'Time Zone', value: setupData.timeZone || 'UTC-5 (Eastern Time)' },
				{ label: 'Size', value: setupData.businessSize || '50-100' }
			]
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			icon: 'darhboard',
			step: 3,
			details: [
				{ label: 'Widgets', value: '3 Configured' },
				{ label: 'Disposition', value: '10 configured' },
				{ label: 'Disposition Time Range View', value: 'Daily' },
				{ label: 'Disposition Chart Type', value: 'Pie Chart' }
			]
		},
		{
			id: 'user-management',
			title: 'User Management',
			icon: 'User_alt_light',
			step: 5,
			details: [
				{ label: 'User Roles', value: '3 Defined' },
				{ label: 'Created Roles', value: '1 Created' },
				{ label: 'Users Added', value: '6 Created' },
				{ label: 'Permission Access Levels', value: '20 Granted' },
				{ label: 'Module Permission Overview', value: '6 Granted' }
			]
		},
		{
			id: 'header-navigation',
			title: 'Header & Navigation',
			icon: 'darhboard',
			step: 2,
			details: [
				{ label: 'Menu Layout', value: setupData.selectedLayout === 'layout' ? 'Layout Style' : 'Compact' },
				{ label: 'Logo Size', value: '180x40px' },
				{ label: 'Theme color', value: `Primary: ${setupData.primaryColor || '#003399'} Secondary: ${setupData.secondaryColor || '#FF6600'}` }
			]
		},
		{
			id: 'customer-book',
			title: 'Customer Book',
			icon: 'Group_light',
			step: 4,
			details: [
				{ label: 'Custom Fields', value: '6 Added' },
				{ label: 'Required Fields', value: '4 Set' }
			]
		}
	];

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">Review Your CRM Configuration</h1>
				<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Please review all your selections before submitting for approval</p>
			</div>

			{/* Configuration Cards */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{configurationCards.map((card) => (
					<div key={card.id} className="bg-white border border-gray-200 ">
						<div className="p-6 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
										<Icon name={card.icon} size="md" />
									</div>
									<h2 className="font-inter text-lg font-semibold text-[#050711]">{card.title}</h2>
								</div>
								<button
									onClick={() => handleEditStep(card.step)}
									className="text-gray-400 hover:text-gray-600 transition-colors"
									title={`Edit ${card.title}`}
								>
									<Icon name="Edit_duotone_line" size="sm" />
								</button>
							</div>
						</div>

						<div className="p-6 space-y-3">
							{card.details.map((detail, index) => (
								<div key={index} className="flex justify-between items-start">
									<span className="font-lato text-sm text-gray-600 flex-1">{detail.label}:</span>
									<span className="font-lato text-sm font-medium text-[#050711] text-right ml-4">{detail.value}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

		</div>
	);
}
