'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdQuery, useGetCampaignQuery } from '@/store/services/campaignApi';
import { useCampaign } from './CampaignContext';

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
	fieldType: string;
	dropdownOptions?: string[];
	sortOrder?: string;
	isRequired?: boolean;
}

export interface Bucket {
	id: string;
	name: string;
	description?: string;
	dispositions: DispositionCategory[];
}

export interface Widget {
	id: string;
	title: string;
	value: number;
	color: string;
	callOutcome?: string;
	subKey?: string;
	dataSourceName?: string;
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

export interface SetupData {
	campaignId?: string;
	companyName: string;
	companyId: string;
	campaignName: string;
	timeZone: string;
	industry: string;
	businessSize: string;
	selectedLayout: 'layout' | 'compact';
	primaryColor: string;
	secondaryColor: string;
	textColor: string;
	tableColor: string;
	backgroundColor: string;
	accentColor: string;
	primaryColorDark: string;
	secondaryColorDark: string;
	textColorDark: string;
	tableColorDark: string;
	backgroundColorDark: string;
	accentColorDark: string;
	mainForegroundColor: string;
	mainForegroundColorDark: string;
	navigationSettings: {
		menuStyle: 'layout' | 'compact';
		themeColors: {
			primary: string;
			secondary: string;
			accent: string;
			text: string;
			table: string;
			background: string;
			primaryDark: string;
			secondaryDark: string;
			accentDark: string;
			textDark: string;
			tableDark: string;
			backgroundDark: string;
			mainForeground: string;
			mainForegroundDark: string;
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
		buckets: Bucket[];
		callOutcomes: CallOutcome[];
		dispositionSettings: {
			timeRangeView:
			'daily' |
			'weekly' |
			'monthly';
			chartType:
			'bar' |
			'line' |
			'pie' |
			'doughnut' |
			'polarArea' |
			'radar' |
			'scatter' |
			'bubble';
			charts: Chart[];
		};
	};
	customerBookSettings: {
		configuredFields: CustomerField[];
	};
	roleManagementSettings: {
		modules: { name: string }[];
	};
	logoFile?: File | null;
}

interface SetupContextType {
	currentStep: number;
	setCurrentStep: (step: number) => void;
	onStepComplete: () => void;
	onStepBack: () => void;
	isLoading: boolean;
	isFetchingCampaign: boolean;
	setIsLoading: (loading: boolean) => void;
	setupData: SetupData;
	updateSetupData: (data: Partial<SetupData>) => void;
	setDashboardStep: React.Dispatch<React.SetStateAction<'KPI Metric' | 'Call Disposition'>>;
	dashboardStep: 'KPI Metric' | 'Call Disposition';
	updateNavigationSettings: (data: Partial<SetupData['navigationSettings']>) => void;
	updateDashboardSettings: (data: Partial<SetupData['dashboardSettings']>) => void;
	addChart: (chart: Omit<Chart, 'id'>) => void;
	removeChart: (chartId: string) => void;
	updateChart: (chartId: string, updates: Partial<Chart>) => void;
	updateChartPosition: (chartId: string, position: { x: number; y: number; width: number; height: number }) => void;
	updateChartsOrder: (newCharts: Chart[]) => void;
	updateCustomerBookSettings: (data: Partial<SetupData['customerBookSettings']>) => void;
	addBucket: (bucket: Omit<Bucket, 'id' | 'dispositions'>) => void;
	updateBucket: (bucketId: string, updates: Partial<Bucket>) => void;
	deleteBucket: (bucketId: string) => void;
	addDispositionToBucket: (bucketId: string, disposition: Omit<DispositionCategory, 'id'>) => void;
	updateDispositionInBucket: (bucketId: string, dispositionId: string, updates: Partial<DispositionCategory>) => void;
	deleteDispositionFromBucket: (bucketId: string, dispositionId: string) => void;
	setupSteps: SetupStep[];
	validateStep: (stepIndex: number) => boolean;
	isDirty: boolean;
	resetDirty: () => void;
	discardChanges: () => void;
	onPersist: ((shouldAdvance: boolean) => Promise<void>) | null;
	registerPersist: (fn: ((shouldAdvance: boolean) => Promise<void>) | null) => void;
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
	const { selectedCampaignId } = useCampaign();

	// Initialize state first so we can use setupData in the query logic
	const [currentStep, setCurrentStep] = useState(1);
	const [dashboardStep, setDashboardStep] = useState<'KPI Metric' | 'Call Disposition'>('KPI Metric');
	const [isLoading, setIsLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [onPersist, setOnPersist] = useState<((shouldAdvance: boolean) => Promise<void>) | null>(null);

	const registerPersist = useCallback((fn: ((shouldAdvance: boolean) => Promise<void>) | null) => {
		setOnPersist(() => fn);
	}, []);
	const [setupData, setSetupData] = useState<SetupData>({
		campaignId: '',
		companyName: '',
		companyId: '',
		campaignName: '',
		timeZone: '',
		industry: '',
		businessSize: '',
		selectedLayout: 'layout',
		primaryColor: '#050711',
		secondaryColor: '#6C8B7D',
		textColor: '#050711',
		tableColor: '#F8F9FA',
		backgroundColor: '#FFFFFF',
		accentColor: '#6C8B7D',
		primaryColorDark: '#F3F4F6',
		secondaryColorDark: '#6C8B7D',
		textColorDark: '#F3F4F6',
		tableColorDark: '#1E293B',
		backgroundColorDark: '#0F172A',
		accentColorDark: '#6C8B7D',
		mainForegroundColor: '#FFFFFF',
		mainForegroundColorDark: '#0F172A',
		navigationSettings: {
			menuStyle: 'layout',
			themeColors: {
				primary: '',
				secondary: '',
				accent: '',
				text: '',
				table: '',
				background: '',
				primaryDark: '#F3F4F6',
				secondaryDark: '#6C8B7D',
				accentDark: '#6C8B7D',
				textDark: '#F3F4F6',
				tableDark: '#1E293B',
				backgroundDark: '#0F172A',
				mainForeground: '#FFFFFF',
				mainForegroundDark: '#0F172A',
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
			buckets: [],
			callOutcomes: [],
			dispositionSettings: {
				timeRangeView: 'daily',
				chartType: 'pie',
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
		roleManagementSettings: {
			modules: [
				{ name: 'dashboard' },
				{ name: 'customerBook' },
				{ name: 'userManagement' },
				{ name: 'setupBook' },
				{ name: 'customerSMS' },
				{ name: 'report' },
				{ name: 'systemSetting' },
				{ name: 'auditLog' },
				{ name: 'teamMembers' },
				{ name: 'campaignPlan' },
				{ name: 'pendingrequest' },
			]
		},
		logoFile: null,
	});

	// Use either user's company ID or the one from setupData (e.g., from localStorage)
	const companyObj = user?.company as { _id?: string; id?: string } | undefined;
	const companyIdToUse: string | undefined = companyObj?._id ?? companyObj?.id ?? (setupData.companyId || undefined);

	const { data: specificCampaign, isLoading: isFetchingSpecificLOB } = useGetCampaignQuery(
		selectedCampaignId || '',
		{ skip: !selectedCampaignId || selectedCampaignId === 'new' }
	);

	const { data: companyCampaign, isLoading: isFetchingCompanyLOB } = useGetCampaignByCompanyIdQuery(
		companyIdToUse ?? '',
		{ skip: !!selectedCampaignId || !companyIdToUse }
	);

	const existingCampaign = selectedCampaignId ? specificCampaign : companyCampaign;
	const isFetchingCampaign = selectedCampaignId ? isFetchingSpecificLOB : isFetchingCompanyLOB;

	const populateData = useCallback((data: any) => {
		if (!data) return;

		const source = data as { campaign?: unknown } | undefined;
		const dataToUse = (source?.campaign as any) || (data as any);

		const safeParse = <T,>(data: unknown): Partial<T> => {
			if (!data) return {};
			if (typeof data === 'string') {
				try {
					return JSON.parse(data) as Partial<T>;
				} catch {
					return {};
				}
			}
			return typeof data === 'object' && data !== null ? (data as Partial<T>) : {};
		};

		if (dataToUse) {
			const navigationSettings = safeParse<SetupData['navigationSettings']>(dataToUse.navigationSettings);
			const dashboardSettings = safeParse<SetupData['dashboardSettings']>(dataToUse.dashboardSettings);
			const customerBookSettings = safeParse<SetupData['customerBookSettings']>(dataToUse.customerBookSettings);
			const roleManagementSettings = safeParse<SetupData['roleManagementSettings']>(dataToUse.roleManagementSettings);

			const currentDispositions = Array.isArray(dataToUse.dashboardSettings?.dispositions)
				? dataToUse.dashboardSettings.dispositions
				: [];

			let finalBuckets = Array.isArray(dashboardSettings?.buckets)
				? dashboardSettings.buckets
				: ([]);

			if (currentDispositions.length > 0 && finalBuckets.length === 0) {
				finalBuckets = [{
					id: 'bucket-general',
					name: 'General Dispositions',
					description: 'Default bucket for existing dispositions',
					dispositions: currentDispositions
				}];
			}

			setSetupData(prev => ({
				...prev,
				campaignId: dataToUse._id,
				companyName: dataToUse.companyName || prev.companyName,
				companyId: dataToUse.companyId || prev.companyId,
				campaignName: dataToUse.campaignName || dataToUse.name || prev.campaignName,
				timeZone: dataToUse.timeZone || prev.timeZone,
				industry: dataToUse.industry || prev.industry,
				businessSize: dataToUse.businessSize || prev.businessSize,
				selectedLayout: dataToUse.selectedLayout || prev.selectedLayout,
				primaryColor: dataToUse.primaryColor || prev.primaryColor,
				secondaryColor: dataToUse.secondaryColor || prev.secondaryColor,
				textColor: dataToUse.textColor || prev.textColor,
				tableColor: dataToUse.tableColor || prev.tableColor,
				backgroundColor: dataToUse.backgroundColor || prev.backgroundColor,
				accentColor: dataToUse.accentColor || prev.accentColor,
				primaryColorDark: dataToUse.primaryColorDark || prev.primaryColorDark,
				secondaryColorDark: dataToUse.secondaryColorDark || prev.secondaryColorDark,
				textColorDark: dataToUse.textColorDark || prev.textColorDark,
				tableColorDark: dataToUse.tableColorDark || prev.tableColorDark,
				backgroundColorDark: dataToUse.backgroundColorDark || prev.backgroundColorDark,
				accentColorDark: dataToUse.accentColorDark || prev.accentColorDark,
				mainForegroundColor: dataToUse.mainForegroundColor || prev.mainForegroundColor,
				mainForegroundColorDark: dataToUse.mainForegroundColorDark || prev.mainForegroundColorDark,
				navigationSettings: {
					...prev.navigationSettings,
					...navigationSettings,
				},
				dashboardSettings: {
					...prev.dashboardSettings,
					...dashboardSettings,
					buckets: finalBuckets,
					dispositions: []
				},
				customerBookSettings: {
					...prev.customerBookSettings,
					...customerBookSettings,
					configuredFields: Array.isArray(customerBookSettings?.configuredFields)
						? customerBookSettings.configuredFields
						: (prev.customerBookSettings.configuredFields || [])
				},
				roleManagementSettings: {
					...prev.roleManagementSettings,
					...roleManagementSettings,
					modules: Array.isArray(roleManagementSettings?.modules)
						? roleManagementSettings.modules
						: (prev.roleManagementSettings.modules || [])
				}
			}));
		}
	}, []);

	const discardChanges = useCallback(() => {
		if (existingCampaign) {
			populateData(existingCampaign);
		}
		setIsDirty(false);
	}, [existingCampaign, populateData]);

	useEffect(() => {
		if (existingCampaign) {
			populateData(existingCampaign);
		}
	}, [existingCampaign, populateData]);

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
							...prev?.dashboardSettings,
							...(parsedData.dashboardSettings || {}),
							// Ensure specific fields are preserved/merged correctly
							dashboardName: parsedData.dashboardSettings?.dashboardName || prev?.dashboardSettings?.dashboardName,
							callOutcomes: parsedData.dashboardSettings?.callOutcomes || prev?.dashboardSettings?.callOutcomes,
							widgets: parsedData.dashboardSettings?.widgets || prev?.dashboardSettings?.widgets,
							dispositions: parsedData.dashboardSettings?.dispositions || prev?.dashboardSettings?.dispositions,
							buckets: parsedData.dashboardSettings?.buckets || prev?.dashboardSettings?.buckets,
						}
					}));
				} catch {
				}
			}
			setIsInitialized(true);
		}
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined' && isInitialized) {
			const save = () => {
				try {
					localStorage.setItem('peoplely-setup-data', JSON.stringify(setupData));
				} catch {
				}
			};
			if ('requestIdleCallback' in window) {
				(window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(save);
			} else {
				setTimeout(save, 0);
			}
		}
	}, [setupData, isInitialized]);

	useEffect(() => {
		const c = user?.company as { _id?: string; id?: string } | undefined;
		const userCompanyId: string | undefined = c?._id ?? c?.id;
		if (userCompanyId && !setupData.companyId) {
			setSetupData(prev => ({ ...prev, companyId: userCompanyId }));
		}
	}, [user, setupData.companyId]);

	const updateSetupData = useCallback((data: Partial<SetupData>) => {
		setSetupData(prev => ({ ...prev, ...data }));
		setIsDirty(true);
	}, []);

	const updateNavigationSettings = useCallback((data: Partial<SetupData['navigationSettings']>) => {
		setSetupData(prev => ({
			...prev,
			navigationSettings: {
				...prev.navigationSettings,
				...data
			}
		}));
		setIsDirty(true);
	}, []);

	const updateDashboardSettings = useCallback((data: Partial<SetupData['dashboardSettings']>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				...data
			}
		}));
		setIsDirty(true);
	}, []);

	const addChart = useCallback((chart: Omit<Chart, 'id'>) => {
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
		setIsDirty(true);
	}, []);

	const removeChart = useCallback((chartId: string) => {
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
		setIsDirty(true);
	}, []);

	const updateChart = useCallback((chartId: string, updates: Partial<Chart>) => {
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
		setIsDirty(true);
	}, []);

	const updateChartPosition = useCallback((chartId: string, position: { x: number; y: number; width: number; height: number }) => {
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
		setIsDirty(true);
	}, []);

	const updateChartsOrder = useCallback((newCharts: Chart[]) => {
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
		setIsDirty(true);
	}, []);

	const updateCustomerBookSettings = useCallback((data: Partial<SetupData['customerBookSettings']>) => {
		setSetupData(prev => ({
			...prev,
			customerBookSettings: {
				...prev.customerBookSettings,
				...data
			}
		}));
		setIsDirty(true);
	}, []);

	const onStepComplete = useCallback(() => {
		if (currentStep < 5) {
			// When moving to step 2 (Header & Navigation), sync colors to navigationSettings
			if (currentStep === 1) {
				setSetupData(prev => ({
					...prev,
					navigationSettings: {
						...prev.navigationSettings,
						themeColors: {
							primary: prev.primaryColor,
							secondary: prev.secondaryColor,
							accent: prev.accentColor,
							text: prev.textColor,
							table: prev.tableColor,
							background: prev.backgroundColor,
							primaryDark: prev.primaryColorDark,
							secondaryDark: prev.secondaryColorDark,
							accentDark: prev.accentColorDark,
							textDark: prev.textColorDark,
							tableDark: prev.tableColorDark,
							backgroundDark: prev.backgroundColorDark,
							mainForeground: prev.mainForegroundColor,
							mainForegroundDark: prev.mainForegroundColorDark,
						}
					}
				}));
			}
			setCurrentStep(prev => prev + 1);
		}
	}, [currentStep]);

	const onStepBack = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep(prev => prev - 1);
		}
	}, [currentStep]);

	const addBucket = useCallback((bucket: Omit<Bucket, 'id' | 'dispositions'>) => {
		const newBucket: Bucket = {
			...bucket,
			id: `bucket-${Date.now()}`,
			dispositions: [],
		};
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: [...(prev.dashboardSettings.buckets || []), newBucket]
			}
		}));
		setIsDirty(true);
	}, []);

	const updateBucket = useCallback((bucketId: string, updates: Partial<Bucket>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: prev.dashboardSettings.buckets.map(b =>
					b.id === bucketId ? { ...b, ...updates } : b
				)
			}
		}));
		setIsDirty(true);
	}, []);

	const deleteBucket = useCallback((bucketId: string) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: prev.dashboardSettings.buckets.filter(b => b.id !== bucketId)
			}
		}));
		setIsDirty(true);
	}, []);

	const addDispositionToBucket = useCallback((bucketId: string, disposition: Omit<DispositionCategory, 'id'>) => {
		const newDisposition: DispositionCategory = {
			...disposition,
			id: `dsp-${Date.now()}`,
		};
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: prev.dashboardSettings.buckets.map(b =>
					b.id === bucketId
						? { ...b, dispositions: [...b.dispositions, newDisposition] }
						: b
				)
			}
		}));
		setIsDirty(true);
	}, []);

	const updateDispositionInBucket = useCallback((bucketId: string, dispositionId: string, updates: Partial<DispositionCategory>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: prev.dashboardSettings.buckets.map(b =>
					b.id === bucketId
						? {
							...b,
							dispositions: b.dispositions.map(d =>
								d.id === dispositionId ? { ...d, ...updates } : d
							)
						}
						: b
				)
			}
		}));
		setIsDirty(true);
	}, []);

	const deleteDispositionFromBucket = useCallback((bucketId: string, dispositionId: string) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: prev.dashboardSettings.buckets.map(b =>
					b.id === bucketId
						? { ...b, dispositions: b.dispositions.filter(d => d.id !== dispositionId) }
						: b
				)
			}
		}));
		setIsDirty(true);
	}, []);

	const validateStep = useCallback((stepIndex: number): boolean => {
		switch (stepIndex) {
			case 1:
				return !!(
					setupData.companyName.trim() &&
					setupData.timeZone &&
					setupData.industry &&
					setupData.businessSize
				);
			case 2:
				return true; // Defaults are always provided
			case 3:
				return !!setupData.dashboardSettings.dashboardName.trim();
			case 4:
				return setupData.customerBookSettings.configuredFields.length > 0;
			default:
				return true;
		}
	}, [setupData]);

	const setupSteps: SetupStep[] = useMemo(() => [
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
			id: 'review',
			title: 'Review Campaign Plan',
			description: 'Review and submit your LOB plan configuration',
			icon: <div className="text-base w-5 text-center">✓</div>,
			active: currentStep === 5,
			completed: false,
		},
	], [currentStep]);

	const resetDirty = useCallback(() => setIsDirty(false), []);

	const contextValue: SetupContextType = useMemo(() => ({
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
		addBucket,
		updateBucket,
		deleteBucket,
		addDispositionToBucket,
		updateDispositionInBucket,
		deleteDispositionFromBucket,
		setupSteps,
		isFetchingCampaign,
		setDashboardStep,
		dashboardStep,
		validateStep,
		isDirty,
		resetDirty,
		discardChanges,
		onPersist,
		registerPersist,
	}), [
		currentStep,
		onStepComplete,
		onStepBack,
		isLoading,
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
		addBucket,
		updateBucket,
		deleteBucket,
		addDispositionToBucket,
		updateDispositionInBucket,
		deleteDispositionFromBucket,
		setupSteps,
		isFetchingCampaign,
		dashboardStep,
		validateStep,
		isDirty,
		discardChanges,
		onPersist,
		registerPersist,
	]);

	return (
		<SetupContext.Provider value={contextValue}>
			{children}
		</SetupContext.Provider>
	);
};

export default SetupContext;
