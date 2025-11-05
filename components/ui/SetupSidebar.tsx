import React from 'react';
import Icon from './Icon';
import {
	GearIcon,
	HamburgerMenuIcon,
	DashboardIcon,
	PersonIcon,
	BackpackIcon
} from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SetupStep {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
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
	const { setupData } = useSetup();
	const { isDarkMode } = useTheme();
	const secondaryColor = setupData.secondaryColor || '#6C8B7D';

	const setupSteps: SetupStep[] = [
		{
			id: 'basic',
			title: 'Basic Setup',
			description: 'Configure your organization details and preferences',
			icon: GearIcon,
			active: currentStep === 1,
		},
		{
			id: 'header',
			title: 'Header & Navigation',
			description: 'Customize your CRM navigation and layout',
			icon: HamburgerMenuIcon,
			active: currentStep === 2,
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			description: 'Set up your dashboard widgets and reports',
			icon: DashboardIcon,
			active: currentStep === 3,
		},
		{
			id: 'customer',
			title: 'Customer Book',
			description: 'Configure customer data fields and views',
			icon: PersonIcon,
			active: currentStep === 4,
		},
		{
			id: 'users',
			title: 'User Management',
			description: 'Manage user roles and permissions',
			icon: BackpackIcon,
			active: currentStep === 5,
		},
	];
	return (
		<aside id="side-nav" className={`w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 ${className}`}>
			<div className="mb-6">
				<div className="mb-1 flex flex-row justify-between items-center">
					<h3 className="font-inter text-base font-semibold text-[#050711] dark:text-gray-100 mb-2">Setup Progress</h3>
					<span className="font-inter text-sm text-gray-500 dark:text-gray-400">{currentStep} of {setupSteps.length}</span>
				</div>

				<div className="w-full h-[8px] rounded-[8px] bg-gray-200 dark:bg-gray-700 relative">
					<div
						className="absolute h-[8px] left-0 top-0 rounded-[4px] transition-all duration-300"
						style={{
							width: `${((currentStep || 1) / setupSteps.length) * 100}%`,
							backgroundColor: secondaryColor
						}}
					></div>
				</div>
			</div>

			<nav className="flex flex-col gap-2">
				{setupSteps.map((step: SetupStep) => {
					const IconComponent = step.icon;
					return (
						<div
							key={step.id}
							className={`flex  p-3 cursor-pointer transition-all duration-200 gap-3 ${step.active
								? 'bg-[#6C8B7D]/10 dark:bg-[#6C8B7D]/20 border border-[#6C8B7D] dark:border-[#6C8B7D]'
								: 'hover:bg-gray-50 dark:hover:bg-gray-800'
								}`}
						>
							<div className="text-base w-5 h-5 text-center flex items-center justify-center">
								<IconComponent 
									className="w-5 h-5" 
									style={step.active ? { color: secondaryColor } : isDarkMode ? { color: '#FFFFFF' } : { color: '#6B7280' }}
								/>
							</div>
							<div className="flex-1">
								<div 
									className="font-lato not-italic font-medium text-[14px] leading-[150%]"
									style={step.active ? { color: secondaryColor } : isDarkMode ? { color: '#FFFFFF' } : { color: '#3A4050' }}
								>
									{step.title}
								</div>
								<div className={`font-lato not-italic font-medium text-[14px] leading-[150%] w-[165px] ${step.active ? 'text-gray-600 dark:text-gray-400' : isDarkMode ? 'text-white' : 'text-[#6D7280]'}`}>
									{step.description}
								</div>
							</div>
							<div className={`text-sm ${step.active ? 'text-gray-500 dark:text-gray-400' : isDarkMode ? 'text-white' : 'text-gray-500'}`}>
								<Icon name="Expand_down_light" />
							</div>
						</div>
					);
				})}
			</nav>
		</aside>
	);
};

export default SetupSidebar;
