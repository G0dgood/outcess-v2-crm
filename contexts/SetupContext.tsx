'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SetupStep {
	id: string;
	title: string;
	description: string;
	icon: ReactNode;
	active: boolean;
	completed: boolean;
}

interface DispositionCategory {
	id: string;
	name: string;
	color: string;
}

interface Widget {
	id: string;
	title: string;
	value: number;
	color: string;
	callOutcome?: string;
}

interface CallOutcome {
	id: string;
	name: string;
}

interface SetupData {
	companyName: string;
	timeZone: string;
	industry: string;
	businessSize: string;
	selectedLayout: 'layout' | 'compact';
	primaryColor: string;
	secondaryColor: string;
	navigationSettings: {
		menuStyle: 'layout' | 'compact';
		themeColors: {
			primary: string;
			secondary: string;
			accent: string;
		};
		logo: {
			url: string;
			alt: string;
			width: number;
			height: number;
		};
	};
	dashboardSettings: {
		dashboardName: string;
		dashboardVisibility: 'all' | 'admin' | 'admin-supervisor' | 'custom';
		activeTab: 'kpi' | 'disposition';
		widgets: Widget[];
		dispositions: DispositionCategory[];
		callOutcomes: CallOutcome[];
		dispositionSettings: {
			timeRangeView: 'daily' | 'weekly' | 'monthly';
			chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble' | '';
		};
	};
}

interface SetupContextType {
	currentStep: number;
	setCurrentStep: (step: number) => void;
	onStepComplete: () => void;
	onStepBack: () => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	setupData: SetupData;
	updateSetupData: (data: Partial<SetupData>) => void;
	updateNavigationSettings: (data: Partial<SetupData['navigationSettings']>) => void;
	updateDashboardSettings: (data: Partial<SetupData['dashboardSettings']>) => void;
	setupSteps: SetupStep[];
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const useSetup = () => {
	const context = useContext(SetupContext);
	if (!context) {
		throw new Error('useSetup must be used within a SetupProvider');
	}
	return context;
};

interface SetupProviderProps {
	children: ReactNode;
}

export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [setupData, setSetupData] = useState<SetupData>({
		companyName: '',
		timeZone: '',
		industry: '',
		businessSize: '',
		selectedLayout: 'layout',
		primaryColor: '#050711',
		secondaryColor: '#6C8B7D',
		navigationSettings: {
			menuStyle: 'layout',
			themeColors: {
				primary: '',
				secondary: '',
				accent: '',
			},
			logo: {
				url: '',
				alt: 'Company Logo',
				width: 120,
				height: 40,
			},
		},
		dashboardSettings: {
			dashboardName: '',
			dashboardVisibility: 'all',
			activeTab: 'kpi',
			widgets: [
				{ id: '1', title: 'Total Calls', value: 0, color: '#050711' }
			],
			dispositions: [],
			callOutcomes: [],
			dispositionSettings: {
				timeRangeView: 'daily',
				chartType: '',
			},
		},
	});

	console.log('setupData----->', JSON.stringify(setupData, null, 2));

	const updateSetupData = (data: Partial<SetupData>) => {
		setSetupData(prev => ({ ...prev, ...data }));
	};

	const updateNavigationSettings = (data: Partial<SetupData['navigationSettings']>) => {
		setSetupData(prev => ({
			...prev,
			navigationSettings: {
				...prev.navigationSettings,
				...data
			}
		}));
	};

	const updateDashboardSettings = (data: Partial<SetupData['dashboardSettings']>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				...data
			}
		}));
	};

	const onStepComplete = () => {
		if (currentStep < 6) {
			// When moving to step 2 (Header & Navigation), sync colors to navigationSettings
			if (currentStep === 1) {
				setSetupData(prev => ({
					...prev,
					navigationSettings: {
						...prev.navigationSettings,
						themeColors: {
							primary: prev.primaryColor,
							secondary: prev.secondaryColor,
							accent: prev.secondaryColor, // Using secondary as accent for now
						}
					}
				}));
			}
			setCurrentStep(currentStep + 1);
		}
	};

	const onStepBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const setupSteps: SetupStep[] = [
		{
			id: 'basic',
			title: 'Basic Setup',
			description: 'Configure your organization details and preferences',
			icon: <div className="text-base w-5 text-center">✓</div>,
			active: currentStep === 1,
			completed: currentStep > 1,
		},
		{
			id: 'header',
			title: 'Header & Navigation',
			description: 'Customize your CRM navigation and layout',
			icon: <div className="text-base w-5 text-center">☰</div>,
			active: currentStep === 2,
			completed: currentStep > 2,
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			description: 'Set up your dashboard widgets and reports',
			icon: <div className="text-base w-5 text-center">⊞</div>,
			active: currentStep === 3,
			completed: currentStep > 3,
		},
		{
			id: 'customer',
			title: 'Customer Book',
			description: 'Configure customer data fields and views',
			icon: <div className="text-base w-5 text-center">👥</div>,
			active: currentStep === 4,
			completed: currentStep > 4,
		},
		{
			id: 'users',
			title: 'User Management',
			description: 'Manage user roles and permissions',
			icon: <div className="text-base w-5 text-center">👤</div>,
			active: currentStep === 5,
			completed: currentStep > 5,
		},
		{
			id: 'review',
			title: 'Review Configuration',
			description: 'Review and submit your CRM configuration',
			icon: <div className="text-base w-5 text-center">✓</div>,
			active: currentStep === 6,
			completed: false,
		},
	];

	const contextValue: SetupContextType = {
		currentStep,
		setCurrentStep,
		onStepComplete,
		onStepBack,
		isLoading,
		setIsLoading,
		setupData,
		updateSetupData,
		updateNavigationSettings,
		updateDashboardSettings,
		setupSteps,
	};

	return (
		<SetupContext.Provider value={contextValue}>
			{children}
		</SetupContext.Provider>
	);
};

export default SetupContext;
