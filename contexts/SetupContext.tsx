'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useGetCampaignByCompanyIdQuery, useGetCampaignQuery, Campaign } from '@/store/services/campaignApi';
import { useCampaign } from './CampaignContext';
import Icon from '@/components/ui/Icon';
import {
	DispositionCategory,
	AssignedMember,
	Bucket,
	Widget,
	CallOutcome,
	Chart,
	CustomerField,
	DashboardSettings
} from '@/types/dashboard';

interface SetupStep {
	id: string;
	title: string;
	description: string;
	icon: ReactNode;
	active: boolean;
	completed: boolean;
}

export type { DispositionCategory, AssignedMember, Bucket, Widget, CallOutcome, Chart, CustomerField, DashboardSettings };

export interface SetupData {
	campaignId?: string;
	// companyName: string;
	companyId: string;
	campaignName: string;
	timeZone: string;
	industry: string;
	businessSize: string;
	dashboardSettings: DashboardSettings;
	customerBookSettings: {
		configuredFields: { bucketId: string; fields: CustomerField[] }[];
	};
	roleManagementSettings: {
		modules: { name: string }[];
	};
	logo: string;
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
	updateBucketCustomerFields: (bucketId: string, fields: CustomerField[]) => void;
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

	console.log('user---->', user);

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
		// companyName: '',
		companyId: '',
		campaignName: '',
		timeZone: '',
		industry: '',
		businessSize: '',
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
			configuredFields: [],
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
		logo: '',
		logoFile: null,
	});

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

	const populateData = useCallback((data: unknown) => {
		if (!data) return;

		const source = data as { campaign?: Campaign } | undefined;
		const dataToUse = source?.campaign || (data as Campaign);

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
			const dashboardSettings = safeParse<SetupData['dashboardSettings']>(dataToUse.dashboardSettings);
			const customerBookSettings = safeParse<SetupData['customerBookSettings']>(dataToUse.customerBookSettings);
			const roleManagementSettings = safeParse<SetupData['roleManagementSettings']>(dataToUse.roleManagementSettings);

			const currentDispositions = Array.isArray((dataToUse.dashboardSettings as Record<string, unknown> | undefined)?.dispositions)
				? (dataToUse.dashboardSettings as unknown as Record<string, unknown>).dispositions as DispositionCategory[]
				: [];

			let finalBuckets = Array.isArray(dashboardSettings?.buckets)
				? dashboardSettings.buckets
				: ([]);

			if (currentDispositions.length > 0 && finalBuckets.length === 0) {
				finalBuckets = [{
					id: 'bucket-general',
					name: 'General Dispositions',
					description: 'Default bucket for existing dispositions',
					dispositions: currentDispositions,
					assignedMembers: [],
					color: '#6B7280'
				}];
			}

			setSetupData(prev => ({
				...prev,
				campaignId: dataToUse._id,
				// companyName: dataToUse.companyName || prev.companyName,
				companyId: dataToUse.companyId || prev.companyId,
				campaignName: dataToUse.campaignName || dataToUse.name || prev.campaignName,
				timeZone: dataToUse.timeZone || prev.timeZone,
				industry: dataToUse.industry || prev.industry,
				businessSize: dataToUse.businessSize || prev.businessSize,
				logo: dataToUse.logo || prev.logo,
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
		if (existingCampaign && !isDirty) {
			populateData(existingCampaign);
		}
	}, [existingCampaign, populateData, isDirty]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedData = localStorage.getItem('outcess-setup-data');
			if (savedData) {
				try {
					const parsedData = JSON.parse(savedData);
					setSetupData(prev => ({
						...prev,
						...parsedData,
						dashboardSettings: {
							...prev?.dashboardSettings,
							...(parsedData.dashboardSettings || {}),
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
					localStorage.setItem('outcess-setup-data', JSON.stringify(setupData));
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
		const userCompanyId: string | undefined = c?._id ?? c?.id ?? user?.companyId;
		if (userCompanyId && !setupData.companyId) {
			setSetupData(prev => ({ ...prev, companyId: userCompanyId }));
		}
	}, [user, setupData.companyId]);

	const updateSetupData = useCallback((data: Partial<SetupData>) => {
		setSetupData(prev => ({ ...prev, ...data }));
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

		const calculatePosition = (existingCharts: Chart[]) => {
			const chartWidth = chart.position.width;
			const chartHeight = chart.position.height;
			const padding = 20;
			const maxColumns = 2;

			for (let row = 0; row < 10; row++) {
				for (let col = 0; col < maxColumns; col++) {
					const x = col * (chartWidth + padding) + padding;
					const y = row * (chartHeight + padding) + padding;
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
		if (currentStep < 4) {
			setCurrentStep(prev => prev + 1);
		}
	}, [currentStep]);

	const onStepBack = useCallback(() => {
		if (currentStep > 1) {
			setCurrentStep(prev => prev - 1);
		}
	}, [currentStep]);

	const addBucket = useCallback((bucket: Omit<Bucket, 'id' | 'dispositions' | 'customerFields'>) => {
		const bucketId = `bucket-${Date.now()}`;
		const defaultFields: CustomerField[] = [
			{ id: '1', name: 'Full Name', type: 'single-line-text', required: true },
			{ id: '2', name: 'Email', type: 'email', required: true },
			{ id: '3', name: 'Phone Number', type: 'phone', required: true },
		];

		const newBucket: Bucket = {
			...bucket,
			id: bucketId,
			dispositions: [],
			customerFields: defaultFields,
			color: '',
			name: ''
		};

		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev.dashboardSettings,
				buckets: [...(prev.dashboardSettings.buckets || []), newBucket]
			},
			customerBookSettings: {
				...prev.customerBookSettings,
				configuredFields: [
					...(prev.customerBookSettings.configuredFields || []),
					{ bucketId, fields: defaultFields }
				]
			}
		}));
		setIsDirty(true);
	}, []);

	const updateBucket = useCallback((bucketId: string, updates: Partial<Bucket>) => {
		setSetupData(prev => ({
			...prev,
			dashboardSettings: {
				...prev?.dashboardSettings,
				buckets: (prev?.dashboardSettings?.buckets || []).map(b =>
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
				...prev?.dashboardSettings,
				buckets: (prev?.dashboardSettings?.buckets || []).filter(b => b.id !== bucketId)
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
				buckets: (prev?.dashboardSettings?.buckets || []).map(b =>
					b.id === bucketId
						? { ...b, dispositions: [...(b?.dispositions || []), newDisposition] }
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
				buckets: (prev?.dashboardSettings?.buckets || []).map(b =>
					b.id === bucketId
						? {
							...b,
							dispositions: (b?.dispositions || []).map(d =>
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
				buckets: (prev?.dashboardSettings?.buckets || []).map(b =>
					b.id === bucketId
						? { ...b, dispositions: (b?.dispositions || []).filter(d => d.id !== dispositionId) }
						: b
				)
			}
		}));
		setIsDirty(true);
	}, []);

	const updateBucketCustomerFields = useCallback((bucketId: string, fields: CustomerField[]) => {
		setSetupData(prev => {
			const configuredFields = prev.customerBookSettings.configuredFields || [];
			const index = configuredFields.findIndex(cf => cf && cf.bucketId === bucketId);

			let newConfiguredFields;
			if (index !== -1) {
				newConfiguredFields = configuredFields.map((cf, i) =>
					i === index ? { ...cf, fields } : cf
				);
			} else {
				newConfiguredFields = [...configuredFields, { bucketId, fields }];
			}

			// Also update the bucket's own customerFields for and direct synchronization
			const updatedBuckets = (prev.dashboardSettings.buckets || []).map(b =>
				b.id === bucketId ? { ...b, customerFields: fields } : b
			);

			return {
				...prev,
				dashboardSettings: {
					...prev.dashboardSettings,
					buckets: updatedBuckets
				},
				customerBookSettings: {
					...prev.customerBookSettings,
					configuredFields: newConfiguredFields
				}
			};
		});
		setIsDirty(true);
	}, []);

	const validateStep = useCallback((stepIndex: number): boolean => {
		switch (stepIndex) {
			case 1:
				return !!(
					// setupData.companyName.trim() &&
					setupData.campaignName.trim() &&
					setupData.timeZone &&
					setupData.industry &&
					setupData.businessSize
				);
			case 2:
				return !!setupData.dashboardSettings.dashboardName.trim();
			case 3:
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
			icon: <Icon name="Setting_line_light" size="md" />,
			active: currentStep === 1,
			completed: currentStep > 1,
		},
		{
			id: 'dashboard',
			title: 'Dashboard',
			description: 'Set up your dashboard widgets and reports',
			icon: <Icon name="darhboard" size="md" />,
			active: currentStep === 2,
			completed: currentStep > 2,
		},
		{
			id: 'customer',
			title: 'Customer Book',
			description: 'Configure customer data fields and views',
			icon: <Icon name="Group_light" size="lg" />,
			active: currentStep === 3,
			completed: currentStep > 3,
		},
		{
			id: 'review',
			title: 'Review Campaign Plan',
			description: 'Review and submit your LOB plan configuration',
			icon: <Icon name="mark" size="md" />,
			active: currentStep === 4,
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
		updateBucketCustomerFields,
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
		updateBucketCustomerFields,
		setupSteps,
		isFetchingCampaign,
		dashboardStep,
		validateStep,
		isDirty,
		resetDirty,
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
