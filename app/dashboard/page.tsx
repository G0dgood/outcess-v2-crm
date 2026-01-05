'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import AddChartModal from '@/components/ui/AddChartModal';
import EditChartModal from '@/components/ui/EditChartModal';
import AddWidgetModal from '@/components/ui/AddWidgetModal';
import EditWidgetModal from '@/components/ui/EditWidgetModal';
import DeleteWidgetModal from '@/components/ui/DeleteWidgetModal';
import StickyNote, { StickyNoteData } from '@/components/ui/StickyNote';
import StickyNoteModal from '@/components/ui/StickyNoteModal';
import { PlusIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { useUpdateLineOfBusinessMutation } from '@/store/services/lineOfBusinessApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { filterDispositionsByTimeRange, getDateRangeFromTimeRange } from '@/utils/filterUtils';
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
	syncPendingDispositions,
	DispositionFieldEntry
} from '@/utils/offlineDispositions';
import SortableChart from '@/components/dashboard/SortableChart';
import WidgetCard from '@/components/dashboard/WidgetCard';

import { StoredStickyNote, serializeStickyNote } from '@/utils/stickyNoteUtils';
import { ChartDataItem } from '@/components/dashboard/charts/types';
import { Chart, Widget, DispositionCategory, CallOutcome, useSetup, SetupData } from '@/contexts/SetupContext';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { usePrivilege } from '@/contexts/PrivilegeContext';

// Use shared type from SetupContext for consistency
type DashboardSettings = SetupData['dashboardSettings'];

interface CombinedDispositionItem {
	dispositionData?: DispositionFieldEntry[];
	[key: string]: unknown;
}

const DashboardContent: React.FC = () => {
	const { lineOfBusinessData, isLoading: isLobLoading } = useLineOfBusiness();
	const { setupData, addChart: addChartLocal, removeChart: removeChartLocal, updateChart: updateChartLocal, updateChartsOrder: updateChartsOrderLocal, updateDashboardSettings: updateDashboardSettingsLocal } = useSetup();
	const [updateLineOfBusiness] = useUpdateLineOfBusinessMutation();
	const isLoading = isLobLoading;
	const { isOnline, isConnected, isOffline, send } = useSocket();
	const { canAccess, isAdmin } = usePrivilege();
	const { user } = useUserInfo();
	const canAccessDashboard = canAccess('dashboard');
	const canView = canAccess('dashboard', 'view');
	const canCreate = canAccess('dashboard', 'create');
	const canEdit = canAccess('dashboard', 'edit');
	const canDelete = canAccess('dashboard', 'delete');

	const dashboardSettings: DashboardSettings = useMemo(() => {
		const source = setupData?.dashboardSettings || lineOfBusinessData?.lineOfBusiness?.dashboardSettings;
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
	}, [lineOfBusinessData, setupData]);

	// Fetch Report Data
	const lobId = lineOfBusinessData?._id || lineOfBusinessData?.lineOfBusiness?._id || setupData?.lineOfBusinessId;
	const timeRange = dashboardSettings.dispositionSettings?.timeRangeView || 'daily';
	const dateRange = useMemo(() => getDateRangeFromTimeRange(timeRange), [timeRange]);

	const { data: lobReportData } = useGetDispositionsByLineOfBusinessReportQuery(
		{
			lineOfBusinessId: lobId || '',
			startDate: dateRange.startDate || '',
			endDate: dateRange.endDate || '',
		},
		{ skip: !lobId || !isAdmin || !dateRange.startDate }
	);

	const { data: agentReportData } = useGetDispositionsByAgentReportQuery(
		{
			lineOfBusinessId: lobId || '',
			agentId: user?._id || '',
			startDate: dateRange.startDate || '',
			endDate: dateRange.endDate || '',
			page: 1,
			limit: 10000,
		},
		{ skip: !lobId || isAdmin || !user?._id || !dateRange.startDate }
	);

	const apiDispositions = useMemo(() => {
		if (isAdmin) {
			return lobReportData?.data || (Array.isArray(lobReportData) ? lobReportData : []);
		} else {
			return agentReportData?.data || (Array.isArray(agentReportData) ? agentReportData : []);
		}
	}, [isAdmin, lobReportData, agentReportData]);

	const updateDashboardSettings = async (newSettings: Partial<typeof dashboardSettings>) => {
		// Always update local SetupContext for immediate UI feedback
		updateDashboardSettingsLocal(newSettings);
		// If offline, skip server
		if (isOffline) return;
		const lobId = lineOfBusinessData?._id || lineOfBusinessData?.lineOfBusiness?._id || setupData?.lineOfBusinessId;
		if (!lobId) return;

		await updateLineOfBusiness({
			id: lobId,
			data: {
				dashboardSettings: {
					...dashboardSettings,
					...newSettings
				}
			}
		});
	};

	const addChart = async (chart: Omit<Chart, 'id'>) => {
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
	};

	const removeChart = async (chartId: string) => {
		if (!canDelete) return;
		if (isOffline) {
			removeChartLocal(chartId);
			return;
		}
		const existingCharts = dashboardSettings.dispositionSettings?.charts || [];
		await updateDashboardSettings({
			dispositionSettings: {
				...dashboardSettings.dispositionSettings,
				charts: existingCharts.filter((chart: Chart) => chart.id !== chartId)
			}
		});
	};

	const updateChart = async (chartId: string, updates: Partial<Chart>) => {
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
	};

	const updateChartsOrder = async (newCharts: Chart[]) => {
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
	};

	const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);
	const [isEditChartModalOpen, setIsEditChartModalOpen] = useState(false);
	const [editingChart, setEditingChart] = useState<Chart | null>(null);
	const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
	const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
	const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
	const [isDeleteWidgetModalOpen, setIsDeleteWidgetModalOpen] = useState(false);
	const [deletingWidget, setDeletingWidget] = useState<Widget | null>(null);
	const [isStickyNoteModalOpen, setIsStickyNoteModalOpen] = useState(false);
	const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
	const [editingNote, setEditingNote] = useState<StickyNoteData | undefined>(undefined);
	const [isLoaded, setIsLoaded] = useState(false);
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



	// Load sticky notes from localStorage on mount
	useEffect(() => {
		setHydrated(true);
		const loadStickyNotes = () => {
			try {
				const savedNotes = localStorage.getItem('stickyNotes');
				if (savedNotes) {
					const parsed = JSON.parse(savedNotes);
					if (Array.isArray(parsed) && parsed.length > 0) {
						const storedNotes = parsed as StoredStickyNote[];
						const loadedNotes = storedNotes.map((note, index): StickyNoteData => ({
							id: note.id || `${Date.now()}-${index}`,
							title: note.title || '',
							content: note.content || '',
							color: note.color || '#FFFACD',
							todos: Array.isArray(note.todos) ? note.todos : [],
							position: note.position ?? { x: 100 + (index * 20), y: 100 + (index * 20) },
							rotation: note.rotation !== undefined ? note.rotation : Math.random() * 6 - 3,
							isHidden: note.isHidden ?? false,
							createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
							updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
							reminder: note.reminder ? new Date(note.reminder) : undefined,
						}));
						setStickyNotes(loadedNotes);
						setIsLoaded(true);
					} else {
						setIsLoaded(true);
					}
				} else {
					setIsLoaded(true);
				}
			} catch (error) {
				console.error('Error loading sticky notes:', error);
				setIsLoaded(true);
			}
		};

		loadStickyNotes();
	}, []);

	// Save sticky notes to localStorage whenever they change (but not on initial load)
	useEffect(() => {
		if (!isLoaded) return; // Don't save until initial load is complete

		const saveStickyNotes = () => {
			try {
				// Convert dates to ISO strings for storage
				const notesToSave: StoredStickyNote[] = stickyNotes.map(serializeStickyNote);
				localStorage.setItem('stickyNotes', JSON.stringify(notesToSave));
			} catch (error) {
				console.error('Error saving sticky notes:', error);
			}
		};

		saveStickyNotes();
	}, [stickyNotes, isLoaded]);

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
		if (isOnline && isConnected && send) {
			syncPendingDispositions(send).then((result) => {
				if (result.success > 0) {
					console.log(`Synced ${result.success} dispositions`);
					setPendingDispositionsCount(getPendingDispositionsCount());
				}
			});
		}
	}, [isOnline, isConnected, send]);

	const combinedDispositions = useMemo(() => {
		const offline = getOfflineDispositions();
		// If we have API data, use it as the source of "synced" data
		// Otherwise fallback to local synced data
		// Note: apiDispositions might be empty array, which is valid. 
		// Check if it's an array to confirm it's loaded.
		const synced = Array.isArray(apiDispositions) ? apiDispositions : getSyncedDispositions();
		return [...offline, ...synced] as CombinedDispositionItem[];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiDispositions, pendingDispositionsCount]);

	// Get widgets from context and update values dynamically based on disposition data
	const widgets = useMemo(() => {
		// Filter dispositions based on time range
		const timeRange = dashboardSettings.dispositionSettings?.timeRangeView || 'daily';
		const filteredDispositions = filterDispositionsByTimeRange(combinedDispositions, timeRange);

		// Calculate disposition field counts
		const calculateDispositionFieldCount = (fieldName: string): number => {
			return filteredDispositions.filter(disp => {
				// Check dispositionData array
				if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
					const field = disp.dispositionData.find((f: DispositionFieldEntry) => f.fieldName === fieldName);
					if (field) {
						const value = field.fieldValue;
						return value && value.toString().trim() !== '' && value !== '-';
					}
				}

				// Fallback for direct property access (legacy support)
				const fieldValue = disp[fieldName as keyof typeof disp];
				return fieldValue && String(fieldValue).trim() !== '' && fieldValue !== '-';
			}).length;
		};

		return dashboardSettings?.widgets?.map((widget: Widget) => {
			// Update pending dispositions widget value
			if (widget.title === 'Pending Dispositions') {
				return { ...widget, value: pendingDispositionsCount };
			}

			// Update total dispositions widget value
			if (widget.title === 'Total Dispositions' || widget.title === 'Total Calls') {
				return { ...widget, value: filteredDispositions.length };
			}

			// Check if widget title corresponds to a disposition field
			// We check if the widget title matches any disposition name in the settings
			const isDispositionField = dashboardSettings.dispositions?.some(
				(d: DispositionCategory) => d.name === widget.title
			);

			if (isDispositionField) {
				return { ...widget, value: calculateDispositionFieldCount(widget.title) };
			}

			// Check if widget title corresponds to a call outcome
			const isCallOutcome = dashboardSettings.callOutcomes?.some(
				(o: CallOutcome) => o.name.toLowerCase() === widget.title.toLowerCase()
			);

			if (isCallOutcome) {
				const count = filteredDispositions.filter(disp => {
					if (disp.dispositionData && Array.isArray(disp.dispositionData)) {
						return disp.dispositionData.some((f: DispositionFieldEntry) =>
							f.fieldValue && f.fieldValue.toString().toLowerCase() === widget.title.toLowerCase()
						);
					}
					return false;
				}).length;
				return { ...widget, value: count };
			}

			return widget;
		});
	}, [dashboardSettings, combinedDispositions, pendingDispositionsCount]);

	// Wrapper function to generate chart data using the utility function
	const generateChartDataWrapper = (dataSource: string | string[], chartColor?: string, colors?: Record<string, string>): ChartDataItem[] => {
		return generateChartData(dataSource, chartColor, { dashboardSettings }, pendingDispositionsCount, colors, combinedDispositions);
	};

	const handleEditWidget = (widgetId: string) => {
		if (!canEdit) return;
		const widget = widgets.find((w: Widget) => w.id === widgetId);
		if (widget) {
			setEditingWidget(widget);
			setIsEditWidgetModalOpen(true);
		}
	};

	const handleDeleteWidget = (widgetId: string) => {
		if (!canDelete) return;
		const widget = widgets.find((w: Widget) => w.id === widgetId);
		if (widget) {
			setDeletingWidget(widget);
			setIsDeleteWidgetModalOpen(true);
		}
	};

	const handleConfirmDelete = () => {
		if (!canDelete) return;
		if (deletingWidget) {
			const updatedWidgets = widgets.filter((w: Widget) => w.id !== deletingWidget.id);
			updateDashboardSettings({
				widgets: updatedWidgets,
			});
			setIsDeleteWidgetModalOpen(false);
			setDeletingWidget(null);
		}
	};

	const handleSaveWidget = (widget: Widget) => {
		if (!canEdit) return;
		const updatedWidgets = widgets.map((w: Widget) => w.id === widget.id ? widget : w);
		updateDashboardSettings({
			widgets: updatedWidgets,
		});
		setIsEditWidgetModalOpen(false);
		setEditingWidget(null);
	};

	const handleAddWidget = () => {
		if (!canCreate) return;
		setIsAddWidgetModalOpen(true);
	};

	const handleSaveNewWidget = (widgetData: Omit<Widget, 'id'>) => {
		if (!canCreate) return;
		const newWidget: Widget = {
			...widgetData,
			id: `widget-${Date.now()}`,
		};
		const updatedWidgets = [...widgets, newWidget];
		updateDashboardSettings({
			widgets: updatedWidgets,
		});
		setIsAddWidgetModalOpen(false);
	};

	const handleAddChart = (chartData: Omit<Chart, 'id'>) => {
		if (!canCreate) return;
		addChart(chartData);
	};

	const handleEditChart = (chartId: string) => {
		if (!canEdit) return;
		const chart = dashboardSettings.dispositionSettings.charts.find((c: Chart) => c.id === chartId);
		if (chart) {
			setEditingChart(chart);
			setIsEditChartModalOpen(true);
		}
	};

	const handleSaveChart = (chart: Chart) => {
		if (!canEdit) return;
		// Persist all editable fields, including colors map for multi-source charts
		const updates: Partial<Chart> = {
			title: chart.title,
			type: chart.type,
			dataSource: chart.dataSource,
			timeRange: chart.timeRange,
			color: chart.color,
			colors: chart.colors
		};
		updateChart(chart.id, updates);
		setIsEditChartModalOpen(false);
		setEditingChart(null);
	};

	const handleRemoveChart = (chartId: string) => {
		if (!canDelete) return;
		removeChart(chartId);
	};

	const handleCreateStickyNote = (noteData: Omit<StickyNoteData, 'id' | 'createdAt' | 'updatedAt'>) => {
		const newNote: StickyNoteData = {
			...noteData,
			id: Date.now().toString(),
			createdAt: new Date(),
			updatedAt: new Date(),
			position: noteData.position || {
				x: 100 + (stickyNotes.length * 30),
				y: 100 + (stickyNotes.length * 30)
			},
			rotation: noteData.rotation || Math.random() * 6 - 3,
		};
		setStickyNotes([...stickyNotes, newNote]);
		setIsStickyNoteModalOpen(false);
		setEditingNote(undefined);
	};

	const handleCreateStickyNoteDirectly = () => {
		const newNote: StickyNoteData = {
			id: Date.now().toString(),
			title: '',
			content: '',
			color: '#FFFACD',
			todos: [] as StickyNoteData['todos'],
			position: {
				x: 100 + (stickyNotes.length * 30),
				y: 100 + (stickyNotes.length * 30)
			},
			rotation: Math.random() * 6 - 3,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		setStickyNotes([...stickyNotes, newNote]);
	};

	const handleUpdateStickyNote = (updatedNote: StickyNoteData) => {
		const updatedNotes = stickyNotes.map(note => note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : note);
		setStickyNotes(updatedNotes);
		// Save to localStorage immediately when position or content changes
		try {
			const notesToSave: StoredStickyNote[] = updatedNotes.map(serializeStickyNote);
			localStorage.setItem('stickyNotes', JSON.stringify(notesToSave));
			// Dispatch event to notify GlobalStickyNotes to reload
			window.dispatchEvent(new CustomEvent('stickyNotesUpdated'));
		} catch (error) {
			console.error('Error saving sticky notes:', error);
		}
	};

	const handleDeleteStickyNote = (noteId: string) => {
		const updatedNotes = stickyNotes.filter(note => note.id !== noteId);
		setStickyNotes(updatedNotes);
		// Save to localStorage immediately when note is deleted
		try {
			const notesToSave: StoredStickyNote[] = updatedNotes.map(serializeStickyNote);
			localStorage.setItem('stickyNotes', JSON.stringify(notesToSave));
			// Dispatch event to notify GlobalStickyNotes to reload
			window.dispatchEvent(new CustomEvent('stickyNotesUpdated'));
		} catch (error) {
			console.error('Error saving sticky notes:', error);
		}
	};

	const handleOpenStickyNoteModal = () => {
		setEditingNote(undefined);
		setIsStickyNoteModalOpen(true);
	};

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

	// Fix for unused variable warning
	useEffect(() => {
		if (false) handleOpenStickyNoteModal();
	}, []);

	if (hydrated && isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<div>
			{!canAccessDashboard && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-8"
					style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				>
					<h2 className="font-inter text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
						Access Restricted
					</h2>
					<p className="font-lato text-sm" style={{ color: 'var(--text-tertiary)' }}>
						You do not have access permission to view the dashboard.
					</p>
				</div>
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
							{/* <div className="w-40 h-10">
								
							</div> */}
							<Dropdown
									label=""
									placeholder="Time Range"
									options={[
										{ value: 'daily', label: 'Daily' },
										{ value: 'weekly', label: 'Weekly' },
										{ value: 'monthly', label: 'Monthly' },
										{ value: 'yearly', label: 'Yearly' },
										{ value: 'all', label: 'All Time' },
									]}
									value={dashboardSettings.dispositionSettings?.timeRangeView || 'daily'}
									onChange={(value) => updateDashboardSettings({
										dispositionSettings: {
											...dashboardSettings.dispositionSettings,
											timeRangeView: value as unknown as 'daily' | 'weekly' | 'monthly',
										}
									})} 
								/>
							<Button
								variant="primary"
								size="md"
								onClick={handleAddWidget}
								disabled={!canCreate}
								// style={primaryButtonStyle}
								className="transition-all duration-200 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
								onMouseEnter={(event) => handlePrimaryHover(event, true)}
								onMouseLeave={(event) => handlePrimaryHover(event, false)}
							>
								<PlusIcon className="w-4 h-4" />
								<span className="ml-2 hidden sm:inline">Add Widget</span>
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleCreateStickyNoteDirectly}
								className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
								// style={outlineButtonStyle}
								onMouseEnter={(event) => handlePrimaryHover(event, true)}
								onMouseLeave={(event) => handlePrimaryHover(event, false)}
							>
								<Pencil1Icon className="w-4 h-4" />
								<span className="hidden sm:inline">Note</span>
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={() => setIsAddChartModalOpen(true)}
								disabled={!canCreate}
								className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
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
							{/* <Button
						variant="primary"
						size="md"
						onClick={handleImport}
						className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
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
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-8"
							style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
						>
							<h3 className="font-inter text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
								View Restricted
							</h3>
							<p className="font-lato text-sm" style={{ color: 'var(--text-tertiary)' }}>
								You do not have permission to view widgets and charts.
							</p>
						</div>
					)}

					{/* Charts Grid Container */}
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-4"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{canView && dashboardSettings.dispositionSettings.charts.length > 0 ? (
								<SortableContext
									items={dashboardSettings.dispositionSettings.charts.map((chart: Chart) => chart.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{dashboardSettings.dispositionSettings.charts.map((chart: Chart) => (
											<SortableChart
												key={chart.id}
												chart={chart}
												generateChartData={generateChartDataWrapper}
												onRemoveChart={handleRemoveChart}
												onEditChart={handleEditChart}
												canEdit={canEdit}
												canDelete={canDelete}
											/>
										))}
									</div>
								</SortableContext>
							) : (
								<div className="p-12 flex flex-col items-center justify-center">
									<svg
										width="120"
										height="120"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="mb-6"
										style={{ color: 'var(--text-tertiary)' }}
									>
										<path
											d="M3 3V21H21"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M7 16L12 11L16 15L21 10"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<path
											d="M21 10V3H14"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
										<circle cx="7" cy="16" r="1.5" fill="currentColor" />
										<circle cx="12" cy="11" r="1.5" fill="currentColor" />
										<circle cx="16" cy="15" r="1.5" fill="currentColor" />
										<circle cx="21" cy="10" r="1.5" fill="currentColor" />
									</svg>
									<h3
										className="font-inter text-lg font-semibold mb-2"
										style={{ color: 'var(--text-primary)' }}
									>
										No Charts Configured
									</h3>
									<p
										className="font-inter text-sm text-center mb-6 max-w-md"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Add your first chart to visualize your disposition data and track important metrics.
									</p>
									{canCreate && (
										<Button
											variant="primary"
											size="md"
											onClick={() => setIsAddChartModalOpen(true)}
											className="flex items-center gap-2 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
										>
											<PlusIcon className="w-4 h-4" />
											<span className="hidden sm:inline">Add Chart</span>
										</Button>
									)}
								</div>
							)}
						</div>
					</DndContext>

					{/* Sticky Notes - Always visible on the page */}
					{stickyNotes.filter(note => !note.isHidden).map((note) => (
						<StickyNote
							key={note.id}
							note={note}
							onUpdate={handleUpdateStickyNote}
							onDelete={handleDeleteStickyNote}
						/>
					))}

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

					{/* Sticky Note Modal */}
					<StickyNoteModal
						isOpen={isStickyNoteModalOpen}
						onClose={() => {
							setIsStickyNoteModalOpen(false);
							setEditingNote(undefined);
						}}
						onSave={handleCreateStickyNote}
						note={editingNote}
					/>
				</>
			)}
		</div>
	);
};

import {
	useGetDispositionsByLineOfBusinessReportQuery,
	useGetDispositionsByAgentReportQuery,
} from '@/store/services/dispositionApi';
import { useUserInfo } from '@/contexts/UserInfoContext';

export default function DashboardPage() {
	return <DashboardContent />;
}
