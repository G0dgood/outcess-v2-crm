'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import AddChartModal from '@/components/ui/AddChartModal';
import EditChartModal from '@/components/ui/EditChartModal';
import AddWidgetModal from '@/components/ui/AddWidgetModal';
import EditWidgetModal from '@/components/ui/EditWidgetModal';
import DeleteWidgetModal from '@/components/ui/DeleteWidgetModal';
import StickyNote, { StickyNoteData } from '@/components/ui/StickyNote';
import StickyNoteModal from '@/components/ui/StickyNoteModal';
import { PlusIcon, Pencil1Icon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import type { Chart, Widget } from '@/contexts/SetupContext';
import { getPendingDispositionsCount, getOfflineDispositions, getSyncedDispositions } from '@/utils/offlineDispositions';
import { useSocket } from '@/contexts/SocketContext';
import { syncPendingDispositions } from '@/utils/offlineDispositions';
import { WidgetCard } from '@/components/dashboard/WidgetCard';
import { SortableChart } from '@/components/dashboard/SortableChart';
import { generateChartData } from '@/utils/chartDataGenerator';
import { serializeStickyNote, type StoredStickyNote } from '@/utils/stickyNoteUtils';
import type { ChartDataItem } from '@/components/dashboard/charts/types';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';


const DashboardContent: React.FC = () => {
	const { setupData, addChart, removeChart, updateChart, updateChartsOrder, updateDashboardSettings } = useSetup();
	const { isOnline, isConnected, isOffline, send } = useSocket();
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

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const primaryColor = setupData.primaryColor || 'var(--text-primary)';





	const handlePrimaryHover = (event: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
		event.currentTarget.style.filter = isHover ? 'brightness(0.95)' : '';
	};



	// Load sticky notes from localStorage on mount
	useEffect(() => {
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

	// Get widgets from context and update values dynamically based on disposition data
	const widgets = useMemo(() => {
		// Get all dispositions for calculations
		const allOfflineDispositions = getOfflineDispositions();
		const allSyncedDispositions = getSyncedDispositions();
		const allDispositions = [...allOfflineDispositions, ...allSyncedDispositions];

		// Calculate disposition field counts
		const calculateDispositionFieldCount = (fieldKey: string): number => {
			return allDispositions.filter(disp => {
				const fieldValue = disp[fieldKey as keyof typeof disp];
				return fieldValue && fieldValue.toString().trim() !== '' && fieldValue !== '-';
			}).length;
		};

		return setupData.dashboardSettings.widgets.map(widget => {
			// Update pending dispositions widget value
			if (widget.title === 'Pending Dispositions') {
				return { ...widget, value: pendingDispositionsCount };
			}

			// Update total dispositions widget value
			if (widget.title === 'Total Dispositions') {
				return { ...widget, value: allDispositions.length };
			}

			// Update disposition field-based widgets
			if (widget.title === 'Call Answered') {
				return { ...widget, value: calculateDispositionFieldCount('callAnswered') };
			}
			if (widget.title === 'Reason For Non Payment') {
				return { ...widget, value: calculateDispositionFieldCount('reasonForNonPayment') };
			}
			if (widget.title === 'Commitment Date') {
				return { ...widget, value: calculateDispositionFieldCount('commitmentDate') };
			}
			if (widget.title === 'Amount To Pay') {
				return { ...widget, value: calculateDispositionFieldCount('amountToPay') };
			}
			if (widget.title === 'Reason For Not Watching') {
				return { ...widget, value: calculateDispositionFieldCount('reasonForNotWatching') };
			}

			return widget;
		});
	}, [setupData.dashboardSettings.widgets, pendingDispositionsCount]);

	// Wrapper function to generate chart data using the utility function
	const generateChartDataWrapper = (dataSource: string | string[], chartColor?: string, colors?: Record<string, string>): ChartDataItem[] => {
		return generateChartData(dataSource, chartColor, setupData, pendingDispositionsCount, colors);
	};

	const handleEditWidget = (widgetId: string) => {
		const widget = widgets.find((w: Widget) => w.id === widgetId);
		if (widget) {
			setEditingWidget(widget);
			setIsEditWidgetModalOpen(true);
		}
	};

	const handleDeleteWidget = (widgetId: string) => {
		const widget = widgets.find((w: Widget) => w.id === widgetId);
		if (widget) {
			setDeletingWidget(widget);
			setIsDeleteWidgetModalOpen(true);
		}
	};

	const handleConfirmDelete = () => {
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
		const updatedWidgets = widgets.map((w: Widget) => w.id === widget.id ? widget : w);
		updateDashboardSettings({
			widgets: updatedWidgets,
		});
		setIsEditWidgetModalOpen(false);
		setEditingWidget(null);
	};

	const handleAddWidget = () => {
		setIsAddWidgetModalOpen(true);
	};

	const handleSaveNewWidget = (widgetData: Omit<Widget, 'id'>) => {
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
		addChart(chartData);
	};

	const handleEditChart = (chartId: string) => {
		const chart = setupData.dashboardSettings.dispositionSettings.charts.find(c => c.id === chartId);
		if (chart) {
			setEditingChart(chart);
			setIsEditChartModalOpen(true);
		}
	};

	const handleSaveChart = (chart: Chart) => {
		updateChart(chart.id, {
			title: chart.title,
			type: chart.type,
			dataSource: chart.dataSource,
			timeRange: chart.timeRange,
			color: chart.color,
		});
		setIsEditChartModalOpen(false);
		setEditingChart(null);
	};

	const handleRemoveChart = (chartId: string) => {
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
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = setupData.dashboardSettings.dispositionSettings.charts.findIndex(
				(chart) => chart.id === active.id
			);
			const newIndex = setupData.dashboardSettings.dispositionSettings.charts.findIndex(
				(chart) => chart.id === over?.id
			);

			const newCharts = arrayMove(
				setupData.dashboardSettings.dispositionSettings.charts,
				oldIndex,
				newIndex
			);

			// Update the charts order in the context
			updateChartsOrder(newCharts);
		}
	};

	return (
		<div>
			{/* Dashboard Title and Action Buttons */}
			<div className="flex justify-between items-center mb-8">
				<h1
					className="font-lato font-normal text-[20px] leading-[150%]"
					style={{ color: 'var(--text-secondary)' }}
				>
					{setupData.dashboardSettings.dashboardName || ' Dashboard'}
				</h1>
				<div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
					<Button
						variant="primary"
						size="md"
						onClick={handleAddWidget}
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
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{widgets.map((widget: Widget) => (
					<WidgetCard
						key={widget.id}
						widgetId={widget.id}
						title={widget.title}
						value={widget.value}
						onEdit={handleEditWidget}
						onDelete={handleDeleteWidget}
					/>
				))}
			</div>

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
					{setupData.dashboardSettings.dispositionSettings.charts.length > 0 ? (
						<SortableContext
							items={setupData.dashboardSettings.dispositionSettings.charts.map(chart => chart.id)}
							strategy={verticalListSortingStrategy}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{setupData.dashboardSettings.dispositionSettings.charts.map((chart) => (
									<SortableChart
										key={chart.id}
										chart={chart}
										generateChartData={generateChartDataWrapper}
										onRemoveChart={handleRemoveChart}
										onEditChart={handleEditChart}
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
							<Button
								variant="primary"
								size="md"
								onClick={() => setIsAddChartModalOpen(true)}
								className="flex items-center gap-2 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
							>
								<PlusIcon className="w-4 h-4" />
								<span className="hidden sm:inline">Add Chart</span>
							</Button>
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
		</div>
	);
};

export default function DashboardPage() {
	return <DashboardContent />;
}
