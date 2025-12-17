'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetLineOfBusinessByCompanyIdQuery, useGetLineOfBusinessQuery } from '@/store/services/lineOfBusinessApi';
import { LineOfBusinessProvider, useLineOfBusiness } from './LineOfBusinessContext';

interface SetupStep {
	id: string;
	title: string;
	description: string;
	icon: ReactNode;
	active: boolean;
	completed: boolean;
}

export interface DispositionCategory {
	id: string;
	name: string;
	color: string;
}

export interface Widget {
	id: string;
	title: string;
	value: number;
	color: string;
	callOutcome?: string;
}

export interface CallOutcome {
	id: string;
	name: string;
}

export interface Chart {
	id: string;
	title: string;
	type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
	dataSource: string | string[]; // Support both single and multiple data sources
	timeRange: 'daily' | 'weekly' | 'monthly';
	color?: string; // Base color for backward compatibility
	colors?: Record<string, string>; // Map of data source to color for multiple data sources
	position: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
}

interface CustomerField {
	id: string;
	name: string;
	type: string;
	required: boolean;
	options?: string[]; // For dropdown, radio, checkbox fields
}



interface User {
	id: string;
	name: string;
	email: string;
	phone: string;
	role: string;
	status: 'active' | 'inactive' | 'pending';
	lastLogin?: string;
}

interface Role {
	id: string;
	name: string;
	description: string;
	permissions: Record<string, boolean>;
}

interface Module {
	id: string;
	name: string;
}

interface Permission {
	id: string;
	name: string;
	description: string;
}

interface PermissionCategory {
	id: string;
	name: string;
	icon: string;
	permissions: Permission[];
}

interface RolePermissions {
	[roleId: string]: {
		[permissionId: string]: boolean;
	};
}

interface SetupData {
	lineOfBusinessId?: string;
	companyName: string;
	companyId: string;
	lineOfBusinessName: string;
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
			charts: Chart[];
		};
	};
	customerBookSettings: {
		configuredFields: CustomerField[];
	};
	userManagementSettings: {
		users: User[];
	};
	roleManagementSettings: {
		roles: Role[];
		modules: Module[];
	};
	permissionAccessSettings: {
		selectedRole: string;
		rolePermissions: RolePermissions;
		permissionCategories: PermissionCategory[];
	};
}

interface SetupContextType {
	currentStep: number;
	setCurrentStep: (step: number) => void;
	onStepComplete: () => void;
	onStepBack: () => void;
	isLoading: boolean;
	isFetchingLineOfBusiness: boolean;
	setIsLoading: (loading: boolean) => void;
	setupData: SetupData;
	updateSetupData: (data: Partial<SetupData>) => void;
	updateNavigationSettings: (data: Partial<SetupData['navigationSettings']>) => void;
	updateDashboardSettings: (data: Partial<SetupData['dashboardSettings']>) => void;
	addChart: (chart: Omit<Chart, 'id'>) => void;
	removeChart: (chartId: string) => void;
	updateChart: (chartId: string, updates: Partial<Chart>) => void;
	updateChartPosition: (chartId: string, position: { x: number; y: number; width: number; height: number }) => void;
	updateChartsOrder: (newCharts: Chart[]) => void;
	updateCustomerBookSettings: (data: Partial<SetupData['customerBookSettings']>) => void;
	updateUserManagementSettings: (data: Partial<SetupData['userManagementSettings']>) => void;
	updateRoleManagementSettings: (data: Partial<SetupData['roleManagementSettings']>) => void;
	updatePermissionAccessSettings: (data: Partial<SetupData['permissionAccessSettings']>) => void;
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
	const { user } = useUserInfo();
	const { selectedLineOfBusinessId } = useLineOfBusiness();

	// Initialize state first so we can use setupData in the query logic
	const [currentStep, setCurrentStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [setupData, setSetupData] = useState<SetupData>({
		lineOfBusinessId: '',
		companyName: '',
		companyId: '',
		lineOfBusinessName: '',
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
				charts: [],
			},
		},
		customerBookSettings: {
			configuredFields: [
				{ id: '1', name: 'Full Name', type: 'Text', required: true },
				{ id: '2', name: 'Email', type: 'Email', required: true },
				{ id: '3', name: 'Phone Number', type: 'Phone', required: true },
			],
		},
		userManagementSettings: {
			users: [],
		},
		roleManagementSettings: {
			roles: [
				{
					id: 'administrator',
					name: 'Administrator',
					description: 'Full access to the system',
					permissions: {
						dashboard: true,
						customerBook: true,
						userManagement: true,
						setupBook: true,
						customerSMS: true,
						report: true,
						systemSetting: true,
						auditLog: true,
					}
				}
			],
			modules: [
				{ id: 'dashboard', name: 'Dashboard' },
				{ id: 'customerBook', name: 'Customer Book' },
				{ id: 'userManagement', name: 'User Management' },
				{ id: 'setupBook', name: 'Setup Book' },
				{ id: 'customerSMS', name: 'Customer SMS' },
				{ id: 'report', name: 'Report' },
				{ id: 'systemSetting', name: 'System Setting' },
				{ id: 'auditLog', name: 'Audit Log' },
			],
		},
		permissionAccessSettings: {
			selectedRole: 'administrator',
			rolePermissions: {
				administrator: {},
			},
			permissionCategories: [
				{
					id: 'userManagementAccess',
					name: 'User Management',
					icon: 'User_alt_light',
					permissions: [
						{ id: 'createUsers', name: 'Create Users', description: 'Ability to create new user accounts' },
						{ id: 'editUsers', name: 'Edit Users', description: 'Ability to modify existing user accounts' },
						{ id: 'deleteUsers', name: 'Delete Users', description: 'Ability to remove user accounts' },
						{ id: 'viewUsers', name: 'View Users', description: 'Ability to view user information' },
					],
				},
				{
					id: 'customerManagement',
					name: 'Customer Management',
					icon: 'Group_light',
					permissions: [
						{ id: 'createCustomers', name: 'Create Customers', description: 'Ability to add new customers' },
						{ id: 'editCustomers', name: 'Edit Customers', description: 'Ability to modify customer information' },
						{ id: 'deleteCustomers', name: 'Delete Customers', description: 'Ability to remove customers' },
						{ id: 'viewCustomers', name: 'View Customers', description: 'Ability to view customer data' },
					],
				},
				{
					id: 'dashboardAccess',
					name: 'Dashboard Access',
					icon: 'darhboard',
					permissions: [
						{ id: 'viewDashboard', name: 'View Dashboard', description: 'Access to dashboard overview' },
						{ id: 'exportData', name: 'Export Data', description: 'Ability to export dashboard data' },
						{ id: 'customizeDashboard', name: 'Customize Dashboard', description: 'Ability to modify dashboard layout' },
					],
				},
			],
		},
	});

	// Use either user's company ID or the one from setupData (e.g., from localStorage)
	const companyIdToUse = user?.company?._id || user?.company?.id || setupData.companyId;

	const { data: specificLineOfBusiness, isLoading: isFetchingSpecificLOB } = useGetLineOfBusinessQuery(
		selectedLineOfBusinessId || '',
		{ skip: !selectedLineOfBusinessId }
	);

	const { data: companyLineOfBusiness, isLoading: isFetchingCompanyLOB } = useGetLineOfBusinessByCompanyIdQuery(
		companyIdToUse || '',
		{ skip: !!selectedLineOfBusinessId || !companyIdToUse }
	);

	const existingLineOfBusiness = selectedLineOfBusinessId ? specificLineOfBusiness : companyLineOfBusiness;
	const isFetchingLineOfBusiness = selectedLineOfBusinessId ? isFetchingSpecificLOB : isFetchingCompanyLOB;

	useEffect(() => {
		if (existingLineOfBusiness) {
			const dataToUse = existingLineOfBusiness.lineOfBusiness || existingLineOfBusiness;
			if (dataToUse) {
				setSetupData(prev => ({
					...prev,
					lineOfBusinessId: dataToUse._id,
					companyName: dataToUse.companyName || prev.companyName,
					companyId: dataToUse.companyId || prev.companyId,
					lineOfBusinessName: dataToUse.lineOfBusinessName || dataToUse.name || prev.lineOfBusinessName,
					timeZone: dataToUse.timeZone || prev.timeZone,
					industry: dataToUse.industry || prev.industry,
					businessSize: dataToUse.businessSize || prev.businessSize,
					selectedLayout: dataToUse.selectedLayout || prev.selectedLayout,
					primaryColor: dataToUse.primaryColor || prev.primaryColor,
					secondaryColor: dataToUse.secondaryColor || prev.secondaryColor,
					navigationSettings: {
						...prev.navigationSettings,
						...(dataToUse.navigationSettings || {}),
					},
					dashboardSettings: {
						...prev.dashboardSettings,
						...(dataToUse.dashboardSettings || {}),
					},
					customerBookSettings: {
						...prev.customerBookSettings,
						...(dataToUse.customerBookSettings || {}),
						configuredFields: Array.isArray(dataToUse.customerBookSettings?.configuredFields)
							? dataToUse.customerBookSettings.configuredFields
							: (prev.customerBookSettings.configuredFields || [])
					},
					userManagementSettings: {
						...prev.userManagementSettings,
						...(dataToUse.userManagementSettings || {}),
					},
					roleManagementSettings: {
						...prev.roleManagementSettings,
						...(dataToUse.roleManagementSettings || {}),
					},
					permissionAccessSettings: {
						...prev.permissionAccessSettings,
						...(dataToUse.permissionAccessSettings || {}),
					},
				}));
			}
		}
	}, [existingLineOfBusiness]);

	// Load from localStorage on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedData = localStorage.getItem('peoplely-setup-data');
			if (savedData) {
				try {
					const parsedData = JSON.parse(savedData);
					setSetupData(prev => ({
						...prev,
						...parsedData,
						// Ensure nested objects are merged correctly
						dashboardSettings: {
							...prev.dashboardSettings,
							...(parsedData.dashboardSettings || {}),
							// Ensure specific fields are preserved/merged correctly
							dashboardName: parsedData.dashboardSettings?.dashboardName || prev.dashboardSettings.dashboardName,
							callOutcomes: parsedData.dashboardSettings?.callOutcomes || prev.dashboardSettings.callOutcomes,
							widgets: parsedData.dashboardSettings?.widgets || prev.dashboardSettings.widgets,
							dispositions: parsedData.dashboardSettings?.dispositions || prev.dashboardSettings.dispositions,
						}
					}));
				} catch (error) {
					console.error('Error parsing setup data from localStorage:', error);
				}
			}
			setIsInitialized(true);
		}
	}, []);

	// Save to localStorage whenever setupData changes
	useEffect(() => {
		if (typeof window !== 'undefined' && isInitialized) {
			localStorage.setItem('peoplely-setup-data', JSON.stringify(setupData));
		}
	}, [setupData, isInitialized]);

	useEffect(() => {
		const userCompanyId = user?.company?._id || user?.company?.id;
		if (userCompanyId && !setupData.companyId) {
			setSetupData(prev => ({ ...prev, companyId: userCompanyId }));
		}
	}, [user, setupData.companyId]);

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

	const addChart = (chart: Omit<Chart, 'id'>) => {
		const newChart: Chart = {
			...chart,
			id: `chart-${Date.now()}`
		};

		// Calculate position to avoid overlap
		const calculatePosition = (existingCharts: Chart[]) => {
			const chartWidth = chart.position.width;
			const chartHeight = chart.position.height;
			const padding = 20;
			const maxColumns = 2;

			// Try to find an empty spot
			for (let row = 0; row < 10; row++) {
				for (let col = 0; col < maxColumns; col++) {
					const x = col * (chartWidth + padding) + padding;
					const y = row * (chartHeight + padding) + padding;

					// Check if this position overlaps with existing charts
					const overlaps = existingCharts.some(existingChart => {
						const existing = existingChart.position;
						return !(x >= existing.x + existing.width + padding ||
							x + chartWidth + padding <= existing.x ||
							y >= existing.y + existing.height + padding ||
							y + chartHeight + padding <= existing.y);
					});

					if (!overlaps) {
						return { x, y };
					}
				}
			}

			// Fallback: stack vertically
			const maxY = Math.max(...existingCharts.map(c => c.position.y + c.position.height), 0);
			return { x: padding, y: maxY + padding };
		};

		setSetupData(prev => {
			const existingCharts = prev.dashboardSettings.dispositionSettings.charts;
			const newPosition = calculatePosition(existingCharts);

			const positionedChart: Chart = {
				...newChart,
				position: {
					...newChart.position,
					...newPosition
				}
			};

			return {
				...prev,
				dashboardSettings: {
					...prev.dashboardSettings,
					dispositionSettings: {
						...prev.dashboardSettings.dispositionSettings,
						charts: [...existingCharts, positionedChart]
					}
				}
			};
		});
	};

	const removeChart = (chartId: string) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				dispositionSettings: {
					...prev.dashboardSettings.dispositionSettings,
					charts: prev.dashboardSettings.dispositionSettings.charts.filter(chart => chart.id !== chartId)
				}
			}
		}));
	};

	const updateChart = (chartId: string, updates: Partial<Chart>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				dispositionSettings: {
					...prev.dashboardSettings.dispositionSettings,
					charts: prev.dashboardSettings.dispositionSettings.charts.map(chart =>
						chart.id === chartId ? { ...chart, ...updates } : chart
					)
				}
			}
		}));
	};

	const updateChartPosition = (chartId: string, position: { x: number; y: number; width: number; height: number }) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				dispositionSettings: {
					...prev.dashboardSettings.dispositionSettings,
					charts: prev.dashboardSettings.dispositionSettings.charts.map(chart =>
						chart.id === chartId ? { ...chart, position } : chart
					)
				}
			}
		}));
	};

	const updateChartsOrder = (newCharts: Chart[]) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				dispositionSettings: {
					...prev.dashboardSettings.dispositionSettings,
					charts: newCharts
				}
			}
		}));
	};

	const updateCustomerBookSettings = (data: Partial<SetupData['customerBookSettings']>) => {
		setSetupData(prev => ({
			...prev,
			customerBookSettings: {
				...prev.customerBookSettings,
				...data
			}
		}));
	};

	const updateUserManagementSettings = (data: Partial<SetupData['userManagementSettings']>) => {
		setSetupData(prev => ({
			...prev,
			userManagementSettings: {
				...prev.userManagementSettings,
				...data
			}
		}));
	};

	const updateRoleManagementSettings = (data: Partial<SetupData['roleManagementSettings']>) => {
		setSetupData(prev => {
			const updatedData = {
				...prev,
				roleManagementSettings: {
					...prev.roleManagementSettings,
					...data
				}
			};

			// If roles were updated, sync rolePermissions
			if (data.roles) {
				const newRolePermissions: RolePermissions = {};
				data.roles.forEach(role => {
					newRolePermissions[role.id] = prev.permissionAccessSettings.rolePermissions[role.id] || {};
				});

				updatedData.permissionAccessSettings = {
					...prev.permissionAccessSettings,
					rolePermissions: newRolePermissions,
					// If the currently selected role was removed, select the first available role
					selectedRole: prev.permissionAccessSettings.selectedRole && data.roles.some(role => role.id === prev.permissionAccessSettings.selectedRole)
						? prev.permissionAccessSettings.selectedRole
						: data.roles[0]?.id || ''
				};
			}

			return updatedData;
		});
	};

	const updatePermissionAccessSettings = (data: Partial<SetupData['permissionAccessSettings']>) => {
		setSetupData(prev => ({
			...prev,
			permissionAccessSettings: {
				...prev.permissionAccessSettings,
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
		addChart,
		removeChart,
		updateChart,
		updateChartPosition,
		updateChartsOrder,
		updateCustomerBookSettings,
		updateUserManagementSettings,
		updateRoleManagementSettings,
		updatePermissionAccessSettings,
		setupSteps,
		isFetchingLineOfBusiness,
	};

	return (
		<SetupContext.Provider value={contextValue}>
			{children}
		</SetupContext.Provider>
	);
};

export default SetupContext;
