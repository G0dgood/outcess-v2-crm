import React from 'react';
import {
	GearIcon,
	HamburgerMenuIcon,
	DashboardIcon,
	PersonIcon,
	ChevronRightIcon
} from '@radix-ui/react-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSetup } from '@/contexts/SetupContext';
import { toast } from 'sonner';

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
	isMobile?: boolean;
}

export const SetupSidebar: React.FC<SetupSidebarProps> = ({
	currentStep,
	className = '',
	isMobile = false,
}) => {
	const { isDarkMode } = useTheme();
	const { setCurrentStep, validateStep } = useSetup();
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
	];

	return (
		<aside
			id={isMobile ? 'side-nav-mobile' : 'side-nav'}
			className={`w-80 dark:bg-gray-900 ${isMobile ? ' w-[300px]  h-full border-r dark:border-gray-700' : 'border-r dark:border-gray-700'} p-6 ${className}`}
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
						className="font-inter text-[10px] md:text-[12px] dark:text-gray-400"
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
						className="absolute h-[8px] left-0 top-0 rounded-lg transition-all duration-300"
						style={{
							width: `${((currentStep || 1) / setupSteps.length) * 100}%`,
							backgroundColor: 'var(--secondary)'
						}}
					></div>
				</div>
			</div>

			<nav className="flex flex-col gap-2">
				{setupSteps.map((step: SetupStep) => {
					const IconComponent = step.icon;
					const stepIndex = ['basic', 'header', 'dashboard', 'customer'].indexOf(step.id) + 1;
					// Can always go back, or move to next step if current one is valid
					const isClickable = stepIndex <= (currentStep || 1) || validateStep(currentStep || 1);
					
					return (
						<div
							key={step.id}
							className={`group flex p-3 cursor-pointer transition-all duration-200 gap-3 rounded-[var(--radius)] border ${
								step.active 
									? 'border-[var(--secondary)] bg-[color-mix(in_srgb,var(--secondary),transparent_90%)]' 
									: 'border-transparent hover:bg-[var(--secondary)]'
							}`}
							onClick={() => {
								if (isClickable) {
									setCurrentStep(stepIndex);
									window.scrollTo({ top: 0, behavior: 'smooth' });
								} else {
									toast.error('Complete previous steps first', {
										description: 'Please finish the current step before moving forward.',
										duration: 3000,
									});
								}
							}}
						>
							<div className="text-base w-5 h-5 text-center flex items-center justify-center">
								<IconComponent
									className="w-5 h-5 transition-colors duration-200"
									style={{ 
										color: step.active 
											? 'var(--secondary)' 
											: 'inherit' 
									}}
								/>
							</div>
							<div className="flex-1">
								<div
									className={`font-lato not-italic font-medium text-[12px] md:text-[14px] leading-[150%] transition-colors duration-200 ${
										step.active ? 'text-[var(--secondary)]' : 'text-[var(--text-secondary)] group-hover:text-white'
									}`}
								>
									{step.title}
								</div>
								<div
									className={`font-lato not-italic font-medium text-[10px] md:text-[12px] leading-[150%] w-[165px] transition-colors duration-200 ${
										step.active ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-tertiary)] group-hover:text-white opacity-80'
									}`}
								>
									{step.description}
								</div>
							</div>
							<div className="flex items-center">
								<ChevronRightIcon
									className={`w-5 h-5 transition-colors duration-200 ${
										step.active ? 'text-[var(--secondary)]' : 'text-[var(--text-tertiary)] group-hover:text-white'
									}`}
								/>
							</div>
						</div>
					);
				})}
			</nav>
		</aside>
	);
};

export default SetupSidebar;
