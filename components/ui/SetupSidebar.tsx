import React, { useState } from 'react';
import Icon from './Icon';
import Dashboard from '../setupIcon/Dashboard';
import Group from '../setupIcon/Group';
import Mark from '../setupIcon/Mark';
import Menu from '../setupIcon/Menu';
import UserAlt from '../setupIcon/UserAlt';

interface SetupStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	active: boolean;
}

interface SetupSidebarProps {
	currentStep?: number;
	className?: string;
}

export const SetupSidebar: React.FC<SetupSidebarProps> = ({
	currentStep,
	className = '',
}) => {



	const setupSteps: SetupStep[] = [
		{
			id: 'basic',
			title: 'Basic Setup',
			description: 'Configure your organization details and preferences',
			icon: <Mark />,
			active: currentStep === 1,
		},
		{
			id: 'header',
			title: 'Header & Navigation',
			description: 'Customize your CRM navigation and layout',
			icon: <Menu />,
			active: currentStep === 2,
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			description: 'Set up your dashboard widgets and reports',
			icon: <Dashboard />,
			active: currentStep === 3,
		},
		{
			id: 'customer',
			title: 'Customer Book',
			description: 'Configure customer data fields and views',
			icon: <Group />,
			active: currentStep === 4,
		},
		{
			id: 'users',
			title: 'User Management',
			description: 'Manage user roles and permissions',
			icon: <UserAlt />,
			active: currentStep === 5,
		},
	];
	return (
		<aside id="side-nav" className={`w-80 bg-white border-r border-gray-200 p-6 ${className}`}>
			<div className="mb-6">
				<div className="mb-1 flex flex-row justify-between items-center">
					<h3 className="font-inter text-base font-semibold text-[#050711] mb-2">Setup Progress</h3>
					<span className="font-inter text-sm text-gray-500">{currentStep} of {setupSteps.length}</span>
				</div>

				<div className="w-full h-[8px] rounded-[8px] bg-gray-200 relative">
					<div
						className="absolute h-[8px] left-0 top-0 bg-[#6C8B7D] rounded-[4px] transition-all duration-300"
						style={{
							width: `${((currentStep || 1) / setupSteps.length) * 100}%`
						}}
					></div>
				</div>
			</div>

			<nav className="flex flex-col gap-2">
				{setupSteps.map((step: SetupStep) => (
					<div
						key={step.id}
						className={`flex  p-3 cursor-pointer transition-all duration-200 gap-3 ${step.active
							? 'bg-[#6C8B7D]/10 border border-[#6C8B7D]'
							: 'hover:bg-gray-50'
							}`}
					>
						<div className="text-base w-5 text-center">{step.icon}</div>
						<div className="flex-1">
							<div className="font-lato not-italic font-medium text-[14px] leading-[150%] text-[#3A4050]">{step.title}</div>
							<div className="font-lato not-italic font-medium text-[14px] leading-[150%] text-[#6D7280] w-[165px]">{step.description}</div>
						</div>
						<div className="text-sm text-gray-500">
							<Icon name="Expand_down_light" />
						</div>
					</div>
				))}
			</nav>
		</aside>
	);
};

export default SetupSidebar;
