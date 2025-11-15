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
		<aside 
			id="side-nav" 
			className={`w-80 dark:bg-gray-900 border-r dark:border-gray-700 p-6 ${className}`}
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="mb-6">
				<div className="mb-1 flex flex-row justify-between items-center">
					<h3 
						className="font-inter text-base font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Setup Progress
					</h3>
					<span 
						className="font-inter text-sm dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						{currentStep} of {setupSteps.length}
					</span>
				</div>

				<div 
					className="w-full h-[8px] rounded-[8px] dark:bg-gray-700 relative"
					style={{ backgroundColor: 'var(--bg-primary)' }}
				>
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
							className={`flex p-3 cursor-pointer transition-all duration-200 gap-3 ${step.active
								? 'dark:bg-[#6C8B7D]/20 border dark:border-[#6C8B7D]'
								: 'dark:hover:bg-gray-800'
								}`}
							style={step.active ? {
								backgroundColor: 'rgba(108, 139, 125, 0.1)',
								borderColor: '#6C8B7D'
							} : {
								borderColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								if (!step.active) {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}
							}}
							onMouseLeave={(e) => {
								if (!step.active) {
									e.currentTarget.style.backgroundColor = 'transparent';
								}
							}}
						>
							<div className="text-base w-5 h-5 text-center flex items-center justify-center">
								<IconComponent 
									className="w-5 h-5" 
									style={step.active ? { color: secondaryColor } : isDarkMode ? { color: '#FFFFFF' } : { color: 'var(--text-tertiary)' }}
								/>
							</div>
							<div className="flex-1">
								<div 
									className="font-lato not-italic font-medium text-[14px] leading-[150%]"
									style={step.active ? { color: secondaryColor } : isDarkMode ? { color: '#FFFFFF' } : { color: 'var(--text-secondary)' }}
								>
									{step.title}
								</div>
								<div 
									className="font-lato not-italic font-medium text-[14px] leading-[150%] w-[165px]"
									style={step.active ? { color: isDarkMode ? '#9CA3AF' : 'var(--text-tertiary)' } : isDarkMode ? { color: '#FFFFFF' } : { color: 'var(--text-tertiary)' }}
								>
									{step.description}
								</div>
							</div>
							<div 
								className="text-sm"
								style={{ color: step.active ? (isDarkMode ? '#9CA3AF' : 'var(--text-tertiary)') : (isDarkMode ? '#FFFFFF' : 'var(--text-tertiary)') }}
							>
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
