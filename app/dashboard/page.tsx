'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import AddChartModal from '@/components/features/dashboard/AddChartModal';
import EditChartModal from '@/components/features/dashboard/EditChartModal';
import AddWidgetModal from '@/components/features/dashboard/AddWidgetModal';
import EditWidgetModal from '@/components/features/dashboard/EditWidgetModal';
import DeleteWidgetModal from '@/components/ui/DeleteWidgetModal';
import { PlusIcon, Pencil1Icon, ReloadIcon, UpdateIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import AccessRestricted from '@/components/ui/AccessRestricted';
import { useUpdateCampaignMutation } from '@/store/services/campaignApi';
import { useCampaign } from '@/contexts/CampaignContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import {
	useGetDashboardDispositionsByCampaignAndAgentIdReportQuery,
	useGetAllDashboardDispositionsByCampaignReportQuery,
	useGetDispositionsByCampaignReportQuery,
	useGetDispositionsByAgentReportQuery
} from '@/store/services/dispositionApi';
import { filterDispositionsByTimeRange, getDateRangeFromTimeRange } from '@/utils/filterUtils';
import { resolveMultiDropdownLevels, getAllCampaignDispositions } from '@/utils/dispositionMultiDropdown';
import { DispositionCategory, NestedOption } from '@/types/dashboard';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSocket } from '@/contexts/SocketContext';
import { generateChartData } from '@/utils/chartDataGenerator';
import {
	getOfflineDispositions,
	getSyncedDispositions,
	getPendingDispositionsCount,
	DispositionFieldEntry
} from '@/utils/offlineDispositions';
import { useSyncDispositions } from '@/hooks/useSyncDispositions';
import SortableChart from '@/components/dashboard/SortableChart';
import WidgetCard from '@/components/dashboard/WidgetCard';
import { ChartDataItem } from '@/components/dashboard/charts/types';
import { Chart, Widget, CallOutcome, DashboardSettings } from '@/types/dashboard';
import { useSetup } from '@/contexts/SetupContext';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { EmptyState } from '@/components/empty-state';

interface CombinedDispositionItem {
	dispositionData?: DispositionFieldEntry[];
	[key: string]: unknown;
}

const DashboardContent: React.FC = () => {
	const { campaignData, selectedCampaignId, isLoading: isLobLoading, selectedBucketId } = useCampaign();
	const { setupData, addChart: addChartLocal, updateChart: updateChartLocal, updateChartsOrder: updateChartsOrderLocal, updateDashboardSettings: updateDashboardSettingsLocal } = useSetup();
	const [updateCampaign] = useUpdateCampaignMutation();
	const isLoading = isLobLoading;
	const { isOnline, isConnected, isOffline } = useSocket();
	const { syncNow, isSyncing } = useSyncDispositions();
	const { canAccess, isAdmin, isSuperAdmin, allBucketAccess } = usePrivilege();
	const { user } = useUserInfo();
	const canAccessDashboard = canAccess('dashboard');
	const canView = canAccess('dashboard', 'view');
	const canCreate = canAccess('dashboard', 'create');
	const canEdit = canAccess('dashboard', 'edit');
	const canDelete = canAccess('dashboard', 'delete');

	const showAddButtons = canCreate;

	const dashboardSettings: DashboardSettings = useMemo(() => {
		const source = setupData?.dashboardSettings || campaignData?.dashboardSettings;
		return source || {
			dashboardName: 'Dashboard',
			dashboardVisibility: 'all',
			activeTab: 'kpi',
			widgets: [
				{ id: '1', title: 'Total Calls', value: 0, color: '#050711' }
			],
			dispositions: [],
			callOutcomes: [],
			dispositionSettings: {
				timeRangeView: 'daily',
				chartType: 'pie',
				charts: [],
			},
		};
	}, [campaignData, setupData]);

	// Fetch Report Data
	const campaignId = campaignData?._id || campaignData?.id || setupData?.campaignId;
	const timeRange = dashboardSettings.dispositionSettings?.timeRangeView || 'daily';
	const dateRange = useMemo(() => getDateRangeFromTimeRange(timeRange), [timeRange]);

	const userRoleName = typeof user?.role === 'object' ? (user?.role as { roleName?: string })?.roleName : user?.role;
	// Treat the isSupervisor flag as authoritative (a team lead may have any role name),
	// falling back to the role name for older records.
	const isSupervisor = user?.isSupervisor === true || userRoleName?.toLowerCase() === 'supervisor';
	// The "all buckets access" privilege grants full campaign-wide visibility just
	// like an admin, so such users get the campaign-wide dashboard (all data),
	// never the agent-only view — regardless of supervisor/team-lead status.
	const isCampaignView = isAdmin || isSuperAdmin || isSupervisor || allBucketAccess;

	const { data: reportDataAgent, refetch: refetchAgentReport, isFetching: isFetchingAgentReport } = useGetDashboardDispositionsByCampaignAndAgentIdReportQuery(
		{
			campaignId: campaignId || '',
			agentId: user?.id || user?._id || '',
			startDate: dateRange.startDate || '',
			endDate: dateRange.endDate || '',
			bucketId: selectedBucketId || undefined
		},
		{ skip: !campaignId || !user || !dateRange.startDate || isCampaignView }
	);

	const { data: reportDataAdmin, refetch: refetchAdminReport, isFetching: isFetchingAdminReport } = useGetAllDashboardDispositionsByCampaignReportQuery(
		{
			campaignId: campaignId || '',
			startDate: dateRange.startDate || '',
			endDate: dateRange.endDate || '',
			bucketId: selectedBucketId || undefined
		},
		{ skip: !campaignId || !dateRange.startDate || !isCampaignView }
	);

	const reportData = isCampaignView ? reportDataAdmin : reportDataAgent;

	// Fetched over all time (no date filter) so each chart can filter by its own
	// per-chart time range. Widgets still filter this client-side by the dashboard range.
	const { data: lobReportData, refetch: refetchLobReport, isFetching: isFetchingLobReport } = useGetDispositionsByCampaignReportQuery(
		{
			campaignId: campaignId || '',
			startDate: '',
			endDate: '',
			page: 1,
			limit: 10000,
			bucketId: selectedBucketId || undefined,
		},
		{ skip: !campaignId || !isCampaignView }
	);

	const { data: agentReportData, refetch: refetchAgentDispositions, isFetching: isFetchingAgentDispositions } = useGetDispositionsByAgentReportQuery(
		{
			campaignId: campaignId || '',
			agentId: user?._id || '',
			startDate: '',
			endDate: '',
			page: 1,
			limit: 10000,
			bucketId: selectedBucketId || undefined,
		},
		{ skip: !campaignId || isCampaignView || !user?._id }
	);

	const apiDispositions = useMemo(() => {
		if (isCampaignView) {
			return (lobReportData as { data?: unknown[] })?.data || (Array.isArray(lobReportData) ? lobReportData : []);
		} else {
			return (agentReportData as { data?: unknown[] })?.data || (Array.isArray(agentReportData) ? agentReportData : []);
		}
	}, [isCampaignView, lobReportData, agentReportData]);

	const isRefreshing = isFetchingAgentReport || isFetchingAdminReport || isFetchingLobReport || isFetchingAgentDispositions;

	const handleRefresh = () => {
		if (isCampaignView) {
			refetchAdminReport();
			refetchLobReport();
		} else {
			refetchAgentReport();
			refetchAgentDispositions();
		}
	};

	const updateDashboardSettings = useCallback(async (newSettings: Partial<typeof dashboardSettings>) => {
		// Always update local SetupContext for immediate UI feedback
		updateDashboardSettingsLocal(newSettings);
		// If offline, skip server
		if (isOffline) return;
		const campaignId = campaignData?._id || campaignData?.id || setupData?.campaignId;
		if (!campaignId) return;

		await updateCampaign({
			id: campaignId,
			data: {
				dashboardSettings: {
					...dashboardSettings,
					...newSettings
				}
			}
		});
	}, [updateDashboardSettingsLocal, isOffline, campaignData, setupData, updateCampaign, dashboardSettings]);

	const addChart = useCallback(async (chart: Omit<Chart, 'id'>) => {
		if (!canCreate) return;
		// Always store locally into SetupContext first (authoritative dispositionSettings)
		addChartLocal(chart);
		if (isOffline) return;
		const newChart: Chart = {
			...chart,
			id: `chart-${Date.now()}`
		};

		const existingCharts = dashboardSettings.dispositionSettings?.charts || [];

		// Calculate position to avoid overlap
		const chartWidth = chart.position.width;
		const chartHeight = chart.position.height;
		const padding = 20;
		const maxColumns = 2;

		let newPosition = { x: padding, y: padding };
		let positionFound = false;

		// Try to find an empty spot
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < maxColumns; col++) {
				const x = col * (chartWidth + padding) + padding;
				const y = row * (chartHeight + padding) + padding;

				// Check if this position overlaps with existing charts
				const overlaps = existingCharts.some((existingChart: Chart) => {
					const existing = existingChart.position;
					return !(x >= existing.x + existing.width + padding ||
						x + chartWidth + padding <= existing.x ||
						y >= existing.y + existing.height + padding ||
						y + chartHeight + padding <= existing.y);
				});

				if (!overlaps) {
					newPosition = { x, y };
					positionFound = true;
					break;
				}
			}
			if (positionFound) break;
		}

		if (!positionFound) {
			// Fallback: stack vertically
			const maxY = Math.max(...existingCharts.map((c: Chart) => c.position.y + c.position.height), 0);
			newPosition = { x: padding, y: maxY + padding };
		}

		const positionedChart: Chart = {
			...newChart,
			position: {
				...newChart.position,
				...newPosition
			}
		};

		await updateDashboardSettings({
			dispositionSettings: {
				...dashboardSettings?.dispositionSettings,
				charts: [...existingCharts, positionedChart]
			}
		});
	}, [canCreate, addChartLocal, isOffline, dashboardSettings, updateDashboardSettings]);



	const updateChart = useCallback(async (chartId: string, updates: Partial<Chart>) => {
		if (!canEdit) return;
		if (isOffline) {
			updateChartLocal(chartId, updates);
			return;
		}
		const existingCharts = dashboardSettings.dispositionSettings?.charts || [];
		await updateDashboardSettings({
			dispositionSettings: {
				...dashboardSettings.dispositionSettings,
				charts: existingCharts.map((chart: Chart) =>
					chart.id === chartId ? { ...chart, ...updates } : chart
				)
			}
		});
	}, [canEdit, isOffline, updateChartLocal, dashboardSettings, updateDashboardSettings]);

	const updateChartsOrder = useCallback(async (newCharts: Chart[]) => {
		if (!canEdit) return;
		if (isOffline) {
			updateChartsOrderLocal(newCharts);
			return;
		}
		await updateDashboardSettings({
			dispositionSettings: {
				...dashboardSettings.dispositionSettings,
				charts: newCharts
			}
		});
	}, [canEdit, isOffline, updateChartsOrderLocal, updateDashboardSettings, dashboardSettings]);

	const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
	const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
	const [editingChart, setEditingChart] = useState<Chart | null>(null);
	const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
	const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
	const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
	const [isDeleteWidgetModalOpen, setIsDeleteWidgetModalOpen] = useState(false);
	const [deletingWidget, setDeletingWidget] = useState<Widget | null>(null);
	const [isDeleteChartModalOpen, setIsDeleteChartModalOpen] = useState(false);
	const [deletingChart, setDeletingChart] = useState<Chart | null>(null);
	const [hydrated, setHydrated] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);


	const handlePrimaryHover = (event: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
		event.currentTarget.style.filter = isHover ? 'brightness(0.95)' : '';
	};



	// Hydration state
	useEffect(() => {
		setHydrated(true);
	}, []);

	// Pending dispositions count
	const [pendingDispositionsCount, setPendingDispositionsCount] = useState(0);

	// Update pending dispositions count
	useEffect(() => {
		const updateCount = () => {
			setPendingDispositionsCount(getPendingDispositionsCount());
		};

		updateCount();
		// Update count every 5 seconds to catch changes
		const interval = setInterval(updateCount, 5000);
		return () => clearInterval(interval);
	}, []);

	// Sync pending dispositions when coming back online
	useEffect(() => {
		if (isOnline && isConnected) {
			syncNow().then((result) => {
				if (result.success > 0) {
					setPendingDispositionsCount(getPendingDispositionsCount());
				}
			});
		}
	}, [isOnline, isConnected, syncNow]);

	// Manual sync triggered from the dashboard "Sync" button
	const handleSyncNow = async () => {
		const result = await syncNow();
		setPendingDispositionsCount(getPendingDispositionsCount());
		if (result.success > 0 && result.failed === 0) {
			toast.success(`Synced ${result.success} pending disposition(s)`);
		} else if (result.success > 0 && result.failed > 0) {
			toast.warning(`Synced ${result.success}, ${result.failed} still pending`);
		} else if (result.failed > 0) {
			toast.error(`Could not sync ${result.failed} disposition(s). Will retry.`);
		} else {
			toast.info('No pending dispositions to sync');
		}
	};

	const combinedDispositions = useMemo(() => {
		const offline = getOfflineDispositions(selectedCampaignId || undefined);
		// If we have API data, use it as the source of "synced" data
		// Otherwise fallback to local synced data
		// Note: apiDispositions might be empty array, which is valid. 
		// Check if it's an array to confirm it's loaded.
		const synced = Array.isArray(apiDispositions) ? apiDispositions : getSyncedDispositions(undefined, selectedCampaignId || undefined);
		return [...offline, ...synced] as CombinedDispositionItem[];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiDispositions, pendingDispositionsCount, selectedCampaignId]);

	// Get widgets from context and update values dynamically based on disposition data
	const widgets = useMemo(() => {
		// Filter dispositions based on time range
		const timeRange = dashboardSettings.dispositionSettings?.timeRangeView || 'daily';
		const filteredDispositions = filterDispositionsByTimeRange(combinedDispositions, timeRange);

		const configuredDispositions = getAllCampaignDispositions(dashboardSettings);

		// Calculate disposition field counts
		const calculateDispositionFieldCount = (fieldName: string, matchKeys?: string[]): number => {
			return filteredDispositions.filter(disp => {
				// Check dispositionData or fillDisposition array
				const fields = disp.dispositionData || disp.fillDisposition;
				if (fields && Array.isArray(fields)) {
					return fields.some((f: DispositionFieldEntry) => {
						if (!f.fieldName || f.fieldValue === undefined || f.fieldValue === null) return false;
						if (f.fieldName.toLowerCase() !== fieldName.toLowerCase()) return false;
						const dispDef = configuredDispositions.find(d => d.name === f.fieldName);
						const levels = resolveMultiDropdownLevels(f.fieldName, String(f.fieldValue), dispDef);
						return levels.some(lvl => {
							if (matchKeys && matchKeys.length > 0) {
								return matchKeys.some(k => 
									lvl.header.toLowerCase() === k.toLowerCase() ||
									lvl.value.toLowerCase() === k.toLowerCase()
								);
							}
							return (
								lvl.header.toLowerCase() === fieldName.toLowerCase() ||
								lvl.value.toLowerCase() === fieldName.toLowerCase() ||
								f.fieldName.toLowerCase() === fieldName.toLowerCase()
							);
						});
					});
				}

				if (matchKeys && matchKeys.length > 0) return false;

				// Fallback for direct property access (legacy support)
				const fieldValue = disp[fieldName as keyof typeof disp];
				return fieldValue && String(fieldValue).trim() !== '' && fieldValue !== '-';
			}).length;
		};

		const campaignBuckets = campaignData?.dashboardSettings?.buckets || setupData?.dashboardSettings?.buckets || [];
		const activeWidgets = (dashboardSettings?.widgets || []).filter((w: Widget) => {
			if (campaignBuckets.length > 1 && selectedBucketId) {
				// Strict per-bucket scoping. A legacy widget with no bucketId belongs
				// to the first bucket only, so it never leaks into other buckets.
				const firstBucketId = campaignBuckets[0]?.id;
				return w.bucketId ? w.bucketId === selectedBucketId : selectedBucketId === firstBucketId;
			}
			return true;
		});

		return activeWidgets.map((widget: Widget) => {
			const sourceKey = widget.dataSourceName || widget.title;
			// Check report data first
			if (reportData?.data?.breakdown) {
				const breakdown = reportData.data.breakdown;

				// 0. Check for Composite SubKey (Category:::Key)
				// This allows Title to be anything (e.g. "mem") while preserving the data source (e.g. "Call Answered")
				if (widget.subKey && widget.subKey.includes(':::')) {
					const parts = widget.subKey.split(':::');
					const category = parts[0];
					if (parts[1] === 'sum') {
						const keys = parts[2] ? parts[2].split(',') : [];
						if (breakdown[category] !== undefined) {
							const reportValue = breakdown[category];
							if (typeof reportValue === 'object' && reportValue !== null) {
								const sumValue = keys.reduce((acc: number, k) => acc + (Number(reportValue[k]) || 0), 0);
								return { ...widget, value: sumValue };
							}
						}
					} else {
						const key = parts[1];
						if (breakdown[category] !== undefined) {
							const reportValue = breakdown[category];
							if (typeof reportValue === 'object' && reportValue !== null && reportValue[key] !== undefined) {
								return { ...widget, value: reportValue[key] };
							}
						}
					}
					// If composite key lookup fails, preserve saved value
					return widget;
				}

				// 1. Direct Lookup (Title = Category)
				if (breakdown[sourceKey] !== undefined) {
					const reportValue = breakdown[sourceKey];
					if (typeof reportValue === 'object' && reportValue !== null) {
						if (widget.subKey && reportValue[widget.subKey] !== undefined) {
							return { ...widget, value: reportValue[widget.subKey] };
						}
						// If subKey is present but value not found, preserve saved value
						if (widget.subKey) {
							return widget;
						}
						// If no subKey, sum all values in the object
						const total = Object.values(reportValue).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
						return { ...widget, value: total };
					} else {
						return { ...widget, value: reportValue };
					}
				}

				// 2. Deep Lookup (Search for Title in all nested objects)
				// This handles cases where Title = Specific Option (e.g. "Connected") 
				// and the parent category is not explicitly stored in subKey or is lost.
				let deepMatchValue: number | undefined;
				Object.values(breakdown).some((categoryValue) => {
					if (typeof categoryValue === 'object' && categoryValue !== null) {
						// Use type assertion or check for property existence safely
						const val = (categoryValue as Record<string, unknown>)[sourceKey];
						if (val !== undefined) {
							deepMatchValue = Number(val);
							return true; // Stop searching
						}
					}
					return false;
				});

				if (deepMatchValue !== undefined) {
					return { ...widget, value: deepMatchValue };
				}
			}

			// If widget has a subKey, it depends on report data breakdown.
			// If report data is missing or doesn't have the key, we should not fall back to total counts.
			if (widget.subKey) {
				return widget;
			}

			// Update pending dispositions widget value
			if (sourceKey === 'Pending Dispositions') {
				return { ...widget, value: pendingDispositionsCount };
			}

			// Update total dispositions widget value
			if (sourceKey === 'Total Dispositions' || sourceKey === 'Total Calls') {
				const apiTotal = reportData?.data?.totalDispositions !== undefined ? Number(reportData.data.totalDispositions) : filteredDispositions.length;
				return { ...widget, value: apiTotal };
			}

			// Check if widget title corresponds to a disposition field
			const allDispositions = getAllCampaignDispositions(dashboardSettings);
			const isDispositionField = allDispositions.some(
				(d: DispositionCategory) => d.name === sourceKey
			);
			
			// Extract matchKeys from subKey if present
			let matchKeys: string[] | undefined;
			if (widget.subKey && widget.subKey.includes(':::')) {
				const parts = widget.subKey.split(':::');
				if (parts[1] === 'sum') {
					matchKeys = parts[2] ? parts[2].split(',') : [];
				} else {
					matchKeys = [parts[1]];
				}
			}

			const isSubOptionOrLabel = allDispositions.some((d: DispositionCategory) => {
				let found = false;
				const checkNested = (opts?: NestedOption[]) => {
					if (!opts) return;
					opts.forEach(opt => {
						if (opt.value?.toLowerCase() === sourceKey.toLowerCase() || opt.subLabel?.toLowerCase() === sourceKey.toLowerCase()) {
							found = true;
						}
						if (opt.subOptions) checkNested(opt.subOptions);
					});
				};
				checkNested(d.nestedOptions);
				return found;
			});

			if (isDispositionField || isSubOptionOrLabel) {
				return { ...widget, value: calculateDispositionFieldCount(sourceKey, matchKeys) };
			}

			// Check if widget title corresponds to a call outcome
			const isCallOutcome = dashboardSettings.callOutcomes?.some(
				(o: CallOutcome) => o.name.toLowerCase() === sourceKey.toLowerCase()
			);

			if (isCallOutcome) {
				const count = filteredDispositions.filter(disp => {
					const fields = disp.dispositionData || disp.fillDisposition;
					if (fields && Array.isArray(fields)) {
						return fields.some((f: DispositionFieldEntry) =>
							f.fieldValue && f.fieldValue.toString().toLowerCase() === sourceKey.toLowerCase()
						);
					}
					return false;
				}).length;
				return { ...widget, value: count };
			}

			return widget;
		});
	}, [dashboardSettings, combinedDispositions, pendingDispositionsCount, reportData, selectedBucketId, campaignData, setupData]);

	const handleEditWidget = useCallback((widgetId: string) => {
		if (!canEdit) return;
		const widget = (dashboardSettings.widgets as Widget[]).find((w: Widget) => w.id === widgetId);
		if (widget) {
			setEditingWidget(widget);
			setIsEditWidgetModalOpen(true);
		}
	}, [canEdit, dashboardSettings.widgets]);

	const handleDeleteWidget = useCallback((widgetId: string) => {
		if (!canDelete) return;
		const widget = (dashboardSettings.widgets as Widget[]).find((w: Widget) => w?.id === widgetId);
		if (widget) {
			setDeletingWidget(widget);
			setIsDeleteWidgetModalOpen(true);
		}
	}, [canDelete, dashboardSettings.widgets]);

	const handleRemoveChart = useCallback((chartId: string) => {
		if (!canDelete) return;
		const chart = dashboardSettings.dispositionSettings.charts.find((c: Chart) => c?.id === chartId);
		if (chart) {
			setDeletingChart(chart);
			setIsDeleteChartModalOpen(true);
		}
	}, [canDelete, dashboardSettings.dispositionSettings.charts]);


	const handleConfirmDeleteChart = useCallback(() => {
		if (!canDelete || !deletingChart) return;

		const updatedCharts = dashboardSettings.dispositionSettings.charts.filter(
			(chart: Chart) => chart.id !== deletingChart.id
		);

		updateDashboardSettings({
			dispositionSettings: {
				...dashboardSettings.dispositionSettings,
				charts: updatedCharts
			}
		});

		setIsDeleteChartModalOpen(false);
		setDeletingChart(null);
	}, [canDelete, deletingChart, dashboardSettings.dispositionSettings, updateDashboardSettings]);

	const handleEditChart = useCallback((chartId: string) => {
		if (!canEdit) return;
		const chart = dashboardSettings.dispositionSettings.charts.find((c: Chart) => c.id === chartId);
		if (chart) {
			setEditingChart(chart);
			setIsEditChartModalOpen(true);
		}
	}, [canEdit, dashboardSettings.dispositionSettings.charts]);

	const generateChartDataWrapper = useCallback((dataSource: string | string[], chartColor?: string, colors?: Record<string, string>, chartTimeRange?: string): ChartDataItem[] => {
		// When a chart has its own time range, filter the (all-time) dispositions
		// client-side by that range instead of using the dashboard-scoped breakdown.
		const reportForChart = chartTimeRange ? undefined : reportData;
		return generateChartData(dataSource, chartColor, { dashboardSettings }, pendingDispositionsCount, colors, combinedDispositions, reportForChart, chartTimeRange);
	}, [dashboardSettings, pendingDispositionsCount, combinedDispositions, reportData]);

	const handleConfirmDelete = useCallback(() => {
		if (!canDelete) return;
		if (deletingWidget) {
			const updatedWidgets = (dashboardSettings.widgets as Widget[]).filter((w: Widget) => w.id !== deletingWidget.id);
			updateDashboardSettings({
				widgets: updatedWidgets,
			});
			setIsDeleteWidgetModalOpen(false);
			setDeletingWidget(null);
		}
	}, [canDelete, deletingWidget, dashboardSettings.widgets, updateDashboardSettings]);

	const handleSaveWidget = useCallback((widget: Widget) => {
		if (!canEdit) return;
		const updatedWidgets = (dashboardSettings.widgets as Widget[]).map((w: Widget) => w.id === widget.id ? widget : w);
		updateDashboardSettings({
			widgets: updatedWidgets,
		});
		setIsEditWidgetModalOpen(false);
		setEditingWidget(null);
	}, [canEdit, dashboardSettings.widgets, updateDashboardSettings]);

	const handleAddWidget = useCallback(() => {
		if (!canCreate) return;
		setIsAddWidgetModalOpen(true);
	}, [canCreate]);

	const handleSaveNewWidget = useCallback((widgetData: Omit<Widget, 'id'>) => {
		if (!canCreate) return;
		const buckets = campaignData?.dashboardSettings?.buckets || setupData?.dashboardSettings?.buckets || [];
		// Always tag the widget with a bucket in multi-bucket campaigns (falling
		// back to the first bucket) so it can never leak into other buckets' views.
		const targetBucketId = buckets.length > 1 ? (selectedBucketId || buckets[0]?.id) : undefined;
		const newWidget: Widget = {
			...widgetData,
			id: `widget-${Date.now()}`,
			...(targetBucketId ? { bucketId: targetBucketId } : {})
		};
		const updatedWidgets = [...(dashboardSettings.widgets as Widget[]), newWidget];
		updateDashboardSettings({
			widgets: updatedWidgets,
		});
		setIsAddWidgetModalOpen(false);
	}, [canCreate, dashboardSettings.widgets, updateDashboardSettings, campaignData, setupData, selectedBucketId]);

	const handleAddChart = useCallback((chartData: Omit<Chart, 'id'>) => {
		if (!canCreate) return;
		addChart(chartData);
	}, [canCreate, addChart]);

	const handleSaveChart = useCallback((chart: Chart) => {
		if (!canEdit) return;
		// Persist all editable fields, including colors map for multi-source charts
		const updates: Partial<Chart> = {
			title: chart.title,
			type: chart.type,
			dataSource: chart.dataSource,
			timeRange: chart.timeRange,
			color: chart.color,
			colors: chart.colors,
			size: chart.size
		};
		updateChart(chart.id, updates);
		setIsEditChartModalOpen(false);
		setEditingChart(null);
	}, [canEdit, updateChart]);


	const handleDragEnd = (event: DragEndEvent) => {
		if (!canEdit) return;
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = dashboardSettings.dispositionSettings.charts.findIndex(
				(chart: Chart) => chart.id === active.id
			);
			const newIndex = dashboardSettings.dispositionSettings.charts.findIndex(
				(chart: Chart) => chart.id === over?.id
			);

			const newCharts = arrayMove(
				dashboardSettings.dispositionSettings.charts,
				oldIndex,
				newIndex
			);

			// Update the charts order in the context
			updateChartsOrder(newCharts as Chart[]);
		}
	};


	if (hydrated && isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<div>
			{!canAccessDashboard && (
				<AccessRestricted
					title="Access Restricted"
					message="You do not have access permission to view the dashboard."
				/>
			)}
			{canAccessDashboard && (
				<>
					{/* Dashboard Title and Action Buttons */}
					<div className="flex justify-between items-center mb-8">
						<h1
							className="font-lato font-normal text-[20px] leading-[150%]"
							style={{ color: 'var(--text-secondary)' }}
						>
							{dashboardSettings?.dashboardName || ' Dashboard'}
						</h1>
						<div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
							<div className="w-40">
								<Dropdown
									label=""
									placeholder="Time Range"
									inputClassName="!py-[7px] !leading-5 !text-[8px] md:text-[10px] sm:!text-[10px] md:text-[12px]  flex-none "
									options={[
										{ value: 'daily', label: 'Daily' },
										{ value: 'yesterday', label: 'Yesterday' },
										{ value: 'weekly', label: 'Weekly' },
										{ value: 'monthly', label: 'Monthly' },
										{ value: 'yearly', label: 'Yearly' },
										{ value: 'all', label: 'All Time' },
									]}
									value={dashboardSettings.dispositionSettings?.timeRangeView || 'daily'}
									onChange={(value) => updateDashboardSettings({
										dispositionSettings: {
											...dashboardSettings.dispositionSettings,
											timeRangeView: value as 'daily' | 'yesterday' | 'weekly' | 'monthly' | 'yearly' | 'all',
										}
									})}
								/>
							</div>
							{pendingDispositionsCount > 0 && (
								<Button
									variant="outline"
									size="md"
									onClick={handleSyncNow}
									disabled={isSyncing}
									className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
									title={`${pendingDispositionsCount} pending disposition(s) to sync`}
								>
									<UpdateIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
									<span className="hidden sm:inline">{isSyncing ? 'Syncing…' : 'Sync'}</span>
									<span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[8px] md:text-[9px] font-bold">
										{pendingDispositionsCount}
									</span>
								</Button>
							)}
							<Button
								variant="primary"
								size="md"
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
								onMouseEnter={(event) => handlePrimaryHover(event, true)}
								onMouseLeave={(event) => handlePrimaryHover(event, false)}
							>
								<ReloadIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
								<span className="hidden sm:inline">Refresh</span>
							</Button>


							{showAddButtons && (
								<Button
									variant="primary"
									size="md"
									onClick={handleAddWidget}
									disabled={!canCreate}
									// style={primaryButtonStyle}
									className="transition-all duration-200 px-2 py-1 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
									onMouseEnter={(event) => handlePrimaryHover(event, true)}
									onMouseLeave={(event) => handlePrimaryHover(event, false)}
								>
									<PlusIcon className="w-4 h-4" />
									<span className="ml-2 hidden sm:inline">Add Widget</span>
								</Button>
							)}
							<Button
								variant="primary"
								size="md"
								onClick={() => window.dispatchEvent(new CustomEvent('createStickyNote'))}
								className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
								// style={outlineButtonStyle}
								onMouseEnter={(event) => handlePrimaryHover(event, true)}
								onMouseLeave={(event) => handlePrimaryHover(event, false)}
							>
								<Pencil1Icon className="w-4 h-4" />
								<span className="hidden sm:inline">Note</span>
							</Button>
							{showAddButtons && (
								<Button
									variant="primary"
									size="md"
									onClick={() => setIsAddChartModalOpen(true)}
									disabled={!canCreate}
									className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
									// style={outlineButtonStyle}
									onMouseEnter={(event) => handlePrimaryHover(event, true)}
									onMouseLeave={(event) => handlePrimaryHover(event, false)}
								>
									<PlusIcon className="w-4 h-4" />
									<span className="hidden sm:inline">Add Chart</span>
									{isOffline && (
										<span
											className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
											style={{ backgroundColor: '#DC350' }}
											title="Offline mode"
										/>
									)}
								</Button>
							)}
							{/* <Button
						variant="primary"
						size="md"
						onClick={handleImport}
						className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2 sm:text-[10px] md:text-[12px]"
					>
						Import
						<Icon name="share" size="sm" />
					</Button> */}
						</div>
					</div>

					{/* Widget Cards */}
					{canView ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							{widgets.map((widget: Widget) => (
								<WidgetCard
									key={widget.id}
									widgetId={widget.id}
									title={widget.title}
									value={widget.value}
									onEdit={handleEditWidget}
									onDelete={handleDeleteWidget}
									canEdit={canEdit}
									canDelete={canDelete}
								/>
							))}
						</div>
					) : (
						<AccessRestricted
							title="View Restricted"
							message="You do not have permission to view widgets and charts."
							titleTag="h3"
						/>
					)}

					{/* Charts Grid Container */}
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-[var(--radius)]"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{canView && dashboardSettings?.dispositionSettings.charts.length > 0 ? (
								<SortableContext
									items={dashboardSettings?.dispositionSettings.charts.map((chart: Chart) => chart.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{dashboardSettings?.dispositionSettings.charts.map((chart: Chart) => {
											// Default to 'small' if size is not set
											const size = chart.size || 'small';
											// Determine column span based on size
											const colSpanClass =
												size === 'small'
													? 'col-span-1'
													: 'col-span-1 md:col-span-2';
											return (
												<div key={chart.id} className={colSpanClass}>
													<SortableChart
														chart={{ ...chart, size }}
														generateChartData={generateChartDataWrapper}
														onRemoveChart={handleRemoveChart}
														onEditChart={handleEditChart}
														onTimeRangeChange={(chartId, timeRange) => updateChart(chartId, { timeRange: timeRange as Chart['timeRange'] })}
														canEdit={canEdit}
														canDelete={canDelete}
													/>
												</div>
											);
										})}
									</div>
								</SortableContext>
							) : (
								<EmptyState
									iconName="NOProduct"
									title="No Charts Configured"
									description={canCreate
										? "Add your first chart to visualize your disposition data and track important metrics."
										: "No charts have been configured for this dashboard yet. Please contact an administrator to set up visualizations."
									}
									linkLabel={canCreate ? "Add Chart" : undefined}
									onClick={canCreate ? () => setIsAddChartModalOpen(true) : undefined}
								/>

							)}
						</div>
					</DndContext>


					{/* Add Chart Modal */}
					<AddChartModal
						isOpen={isAddChartModalOpen}
						onClose={() => setIsAddChartModalOpen(false)}
						onSave={handleAddChart}
					/>

					{/* Edit Chart Modal */}
					<EditChartModal
						isOpen={isEditChartModalOpen}
						onClose={() => {
							setIsEditChartModalOpen(false);
							setEditingChart(null);
						}}
						onSave={handleSaveChart}
						chart={editingChart}
						reportData={reportData}
					/>

					{/* Add Widget Modal */}
					<AddWidgetModal
						isOpen={isAddWidgetModalOpen}
						onClose={() => setIsAddWidgetModalOpen(false)}
						onSave={handleSaveNewWidget}
					/>

					{/* Edit Widget Modal */}
					<EditWidgetModal
						isOpen={isEditWidgetModalOpen}
						onClose={() => {
							setIsEditWidgetModalOpen(false);
							setEditingWidget(null);
						}}
						onSave={handleSaveWidget}
						widget={editingWidget}
					/>

					{/* Delete Widget Modal */}
					<DeleteWidgetModal
						isOpen={isDeleteWidgetModalOpen}
						onClose={() => {
							setIsDeleteWidgetModalOpen(false);
							setDeletingWidget(null);
						}}
						onConfirm={handleConfirmDelete}
						widgetTitle={deletingWidget?.title}
					/>

					{/* Delete Chart Modal */}
					<DeleteWidgetModal
						isOpen={isDeleteChartModalOpen}
						onClose={() => {
							setIsDeleteChartModalOpen(false);
							setDeletingChart(null);
						}}
						onConfirm={handleConfirmDeleteChart}
						widgetTitle={deletingChart?.title}
					/>

				</>
			)}
		</div>
	);
};

export default function DashboardPage() {
	return <DashboardContent />;
}
