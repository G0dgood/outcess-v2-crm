'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import AddDispositionModal from './AddDispositionModal';
import AddBucketModal from './AddBucketModal';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import ConfirmChangeTypeModal from '@/components/ui/ConfirmChangeTypeModal';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Autosuggestions from '@/components/ Autosuggestions';
import { useSetup, Bucket, DispositionCategory } from '@/contexts/SetupContext';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAssignedBuckets, BucketWithMembers } from '@/utils/bucketUtils';
import { NestedOption } from '@/types/dashboard';
import {
	ArchiveIcon,
	PlusIcon,
	Pencil1Icon,
	TrashIcon,
	PieChartIcon,
	IdCardIcon,
} from '@radix-ui/react-icons';
import EmptyState from '@/components/ui/EmptyState';
import AssignMemberModal from '@/components/features/dashboard/AssignMemberModal';
import { toast } from 'sonner';
import {
	useAssignMemberToBucketMutation,
	useRemoveMemberFromBucketMutation,
	useDeleteBucketFromCampaignMutation
} from '@/store/services/campaignApi';
import Icon from '@/components/ui/Icon';
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
	rectSortingStrategy,
	useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RefreshCw, Eye } from 'lucide-react';

import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	RadialLinearScale,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import type { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';

type ChartComponentType = React.ComponentType<{
	data: ChartData<keyof ChartTypeRegistry>;
	options: ChartOptions<keyof ChartTypeRegistry>;
}>;

interface SortableDispositionCardProps {
	d: DispositionCategory;
	handleEditDisposition: (d: DispositionCategory) => void;
	handleDeleteDispositionClick: (d: DispositionCategory) => void;
	handleChangeTypeClick: (d: DispositionCategory) => void;
	handlePreviewDisposition: (d: DispositionCategory) => void;
}

const SortableDispositionCard = ({ d, handleEditDisposition, handleDeleteDispositionClick, handleChangeTypeClick, handlePreviewDisposition }: SortableDispositionCardProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: d.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 20 : 'auto',
		position: isDragging ? 'relative' : undefined,
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="p-4 border dark:border-gray-700 rounded-[var(--radius)] hover:shadow-sm transition-all bg-white dark:bg-gray-900/50 group flex flex-col justify-between"
		>
			<div>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2 min-w-0">
						<button
							type="button"
							className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors mr-1 shrink-0"
							{...attributes}
							{...listeners}
							title="Drag to reorder"
						>
							<GripVertical size={14} className="text-gray-400" />
						</button>
						<div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
						<span className="text-[12px] font-medium text-gray-700 dark:text-gray-200 truncate">{d.name}</span>
					</div>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							onClick={() => handlePreviewDisposition(d)}
							className="p-1 hover:text-blue-500 text-gray-400 transition-colors"
							title="Preview Field"
						>
							<Eye className="w-3 h-3" />
						</button>
						<button
							onClick={() => handleChangeTypeClick(d)}
							className="p-1 hover:text-amber-500 text-gray-400 transition-colors"
							title="Change Field Type"
						>
							<RefreshCw className="w-3 h-3" />
						</button>
						<button onClick={() => handleEditDisposition(d)} className="p-1 hover:text-primary text-gray-400">
							<Pencil1Icon className="w-3.5 h-3.5" />
						</button>
						<button onClick={() => handleDeleteDispositionClick(d)} className="p-1 hover:text-red-500 text-gray-400">
							<TrashIcon className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
				<div className="flex items-center gap-3 mt-auto">
					<span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-semibold">
						{d.fieldType}
					</span>
					{d.isRequired && (
						<span className="text-[10px] text-red-500 font-medium">* Required</span>
					)}
				</div>
			</div>
		</div>
	);
};

export default function CallDisposition() {
	const {
		setupData,
		updateDashboardSettings,
		addBucket,
		updateBucket,
		deleteBucket,
		addDispositionToBucket,
		updateDispositionInBucket,
		deleteDispositionFromBucket
	} = useSetup();
	const { dispositionSettings, buckets } = setupData.dashboardSettings;

	// Scope which buckets are visible: admins / super-admins / roles with
	// allBucketAccess see every bucket; everyone else (e.g. a supervisor) only
	// sees buckets they are assigned to. Mirrors customer-book / setup-book / report.
	const { isAdmin, isSuperAdmin, allBucketAccess } = usePrivilege();
	const { user } = useAuth();
	const userId = String(user?.id || user?._id || '');
	const hasFullBucketAccess = isAdmin || isSuperAdmin || allBucketAccess;
	const accessibleBuckets = useMemo(
		() =>
			hasFullBucketAccess
				? buckets
				: (getUserAssignedBuckets(userId, (buckets || []) as unknown as BucketWithMembers[]) as unknown as Bucket[]),
		[buckets, userId, hasFullBucketAccess]
	);

	const [activeBucketId, setActiveBucketId] = useState<string | null>(null);
	const [isAddDispositionModalOpen, setIsAddDispositionModalOpen] = useState(false);
	const [isEditDispositionModalOpen, setIsEditDispositionModalOpen] = useState(false);
	const [editingDisposition, setEditingDisposition] = useState<DispositionCategory | null>(null);
	const [allowTypeChange, setAllowTypeChange] = useState(false);
	const [isConfirmChangeTypeOpen, setIsConfirmChangeTypeOpen] = useState(false);
	const [changeTypeTarget, setChangeTypeTarget] = useState<DispositionCategory | null>(null);

	const [isAddBucketModalOpen, setIsAddBucketModalOpen] = useState(false);
	const [isEditBucketModalOpen, setIsEditBucketModalOpen] = useState(false);
	const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string, type: 'bucket' | 'disposition' } | null>(null);

	const [isAssignMemberModalOpen, setIsAssignMemberModalOpen] = useState(false);
	const [assigningToBucketId, setAssigningToBucketId] = useState<string | null>(null);
	const [assigningToBucketName, setAssigningToBucketName] = useState<string>('');
	const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

	const [previewDisposition, setPreviewDisposition] = useState<DispositionCategory | null>(null);
	const [previewValue, setPreviewValue] = useState<string>('');

	const handleRestoreDisposition = (id: string) => {
		if (activeBucketId) {
			updateDispositionInBucket(activeBucketId, id, { isArchived: false });
			toast.success("Disposition restored successfully");
		}
	};

	const handlePermanentDeleteDisposition = (id: string) => {
		if (activeBucketId) {
			deleteDispositionFromBucket(activeBucketId, id);
			toast.success("Disposition permanently deleted");
		}
	};

	const [assignMember] = useAssignMemberToBucketMutation();
	const [removeMember] = useRemoveMemberFromBucketMutation();
	const [deleteBucketMutation] = useDeleteBucketFromCampaignMutation();

	const [bucketForm, setBucketForm] = useState({
		name: '',
		description: '',
		color: '#050711'
	});

	const [dispositionForm, setDispositionForm] = useState({
		fieldType: 'dropdown',
		fieldLabel: '',
		dropdownOptions: [''],
		nestedOptions: [] as NestedOption[],
		sortOrder: 'entered',
		isRequired: false,
		color: '#050711',
		subFields: [] as DispositionCategory[],
		optionSubFields: {} as Record<string, DispositionCategory[]>
	});

	const [isChartReady, setIsChartReady] = useState(false);
	const [ChartComp, setChartComp] = useState<ChartComponentType | null>(null);

	// Set initial active bucket
	useEffect(() => {
		if (accessibleBuckets?.length > 0 && !activeBucketId) {
			setActiveBucketId(accessibleBuckets[0].id);
		}
	}, [accessibleBuckets, activeBucketId]);

	const activeBucket = useMemo(() =>
		buckets?.find(b => b.id === activeBucketId),
		[buckets, activeBucketId]);

	const allDispositions = useMemo(() => activeBucket?.dispositions || [], [activeBucket?.dispositions]);
	const dispositions = useMemo(() => {
		return allDispositions.filter(d => !d.isArchived);
	}, [allDispositions]);
	const archivedDispositions = useMemo(() => {
		return allDispositions.filter(d => d.isArchived === true);
	}, [allDispositions]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id && activeBucketId) {
			const oldIndex = dispositions.findIndex((d) => d.id === active.id);
			const newIndex = dispositions.findIndex((d) => d.id === over.id);

			const reorderedActive = arrayMove(dispositions, oldIndex, newIndex);
			const finalDispositions = [
				...reorderedActive,
				...archivedDispositions
			];

			updateDashboardSettings({
				buckets: buckets.map(b =>
					b.id === activeBucketId ? { ...b, dispositions: finalDispositions } : b
				)
			});
		}
	};

	useEffect(() => {
		const chartType = dispositionSettings.chartType || 'pie';
		try {
			switch (chartType) {
				case 'bar':
					ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
					break;
				case 'line':
					ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);
					break;
				case 'doughnut':
				case 'pie':
					ChartJS.register(ArcElement, Title, Tooltip, Legend);
					break;
				case 'polarArea':
					ChartJS.register(RadialLinearScale, ArcElement, Title, Tooltip, Legend);
					break;
				case 'radar':
					ChartJS.register(RadialLinearScale, LineElement, PointElement, Title, Tooltip, Legend);
					break;
				case 'scatter':
					ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);
					break;
				case 'bubble':
					ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend);
					break;
				default:
					ChartJS.register(ArcElement, Title, Tooltip, Legend);
			}
			setIsChartReady(true);
		} catch {
			setIsChartReady(true);
		}
	}, [dispositionSettings.chartType]);

	useEffect(() => {
		const chartType = dispositionSettings.chartType || 'pie';
		const loadComponent = async () => {
			const mod = await import('react-chartjs-2');
			switch (chartType) {
				case 'bar':
					setChartComp(() => mod.Bar as ChartComponentType);
					return;
				case 'line':
					setChartComp(() => mod.Line as ChartComponentType);
					return;
				case 'doughnut':
					setChartComp(() => mod.Doughnut as ChartComponentType);
					return;
				case 'polarArea':
					setChartComp(() => mod.PolarArea as ChartComponentType);
					return;
				case 'radar':
					setChartComp(() => mod.Radar as ChartComponentType);
					return;
				case 'scatter':
					setChartComp(() => mod.Scatter as ChartComponentType);
					return;
				case 'bubble':
					setChartComp(() => mod.Bubble as ChartComponentType);
					return;
				case 'pie':
				default:
					setChartComp(() => mod.Pie as ChartComponentType);
					return;
			}
		};
		loadComponent();
	}, [dispositionSettings.chartType]);

	const chartTypeOptions = [
		{ value: 'bar', label: 'Bar Chart' },
		{ value: 'line', label: 'Line Chart' },
		{ value: 'pie', label: 'Pie Chart' },
		{ value: 'doughnut', label: 'Doughnut Chart' },
		{ value: 'polarArea', label: 'Polar Area Chart' },
		{ value: 'radar', label: 'Radar Chart' },
		{ value: 'scatter', label: 'Scatter Chart' },
		{ value: 'bubble', label: 'Bubble Chart' }
	];

	const fieldTypeOptions = [
		{ value: 'number', label: 'Number' },
		{ value: 'date', label: 'Date' },
		{ value: 'dropdown', label: 'Dropdown' },
		{ value: 'multi-dropdown', label: 'Multi Dropdown' },
		{ value: 'single-radio', label: 'Single Radio' },
		{ value: 'radio-group', label: 'Radio Group' },
		{ value: 'single-checkbox', label: 'Checkbox' },
		{ value: 'multiple-checkbox', label: 'Multiple Checkbox' },
		{ value: 'phone', label: 'Phone' },
		{ value: 'single-line-text', label: 'Single Line Text' },
		{ value: 'multi-line-text', label: 'Multi Line Text' },
		{ value: 'email', label: 'Email' },
		{ value: 'date-time', label: 'Date/Time' },
		{ value: 'autosuggest', label: 'Auto Suggestion' }
	];

	const chartData = {
		labels: dispositions.length > 0 ? dispositions.map(d => d.name) : ['No dispositions'],
		datasets: [
			{
				label: 'Count',
				data: dispositions.length > 0 ? dispositions.map(() => Math.floor(Math.random() * 100) + 10) : [0],
				backgroundColor: dispositions.length > 0 ? dispositions.map(d => d.color) : ['#E5E7EB'],
				borderColor: dispositions.length > 0 ? dispositions.map(d => d.color) : ['#E5E7EB'],
				borderWidth: ['line', 'radar'].includes(dispositionSettings.chartType || 'pie') ? 2 : 0,
			},
		],
	};

	const renderChart = () => {
		if (!isChartReady) return <div className="h-64 flex items-center justify-center text-sm">Preparing chart...</div>;
		if (dispositions.length === 0) {
			return (
				<EmptyState
					icon={PieChartIcon}
					title="No Dispositions in this Bucket"
					description="Add categories to see them visualized here."
					className="h-full justify-center"
				/>
			);
		}

		if (!ChartComp) return <div className="h-full flex items-center justify-center text-sm">Loading chart...</div>;

		return (
			<ChartComp
				data={chartData}
				options={{
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false }, title: { display: false } }
				}}
			/>
		);
	};

	// Bucket Actions
	const handleAddBucket = () => {
		setBucketForm({ name: '', description: '', color: '#050711' });
		setIsAddBucketModalOpen(true);
	};

	const handleEditBucket = (bucket: Bucket) => {
		setEditingBucket(bucket);
		setBucketForm({ name: bucket.name, description: bucket.description || '', color: bucket.color || '#050711' });
		setIsEditBucketModalOpen(true);
	};

	const handleSaveBucket = () => {
		if (editingBucket) {
			updateBucket(editingBucket.id, { name: bucketForm.name, description: bucketForm.description, color: bucketForm.color });
			setIsEditBucketModalOpen(false);
		} else {
			addBucket({ name: bucketForm.name, description: bucketForm.description, color: bucketForm.color });
			setIsAddBucketModalOpen(false);
		}
		setEditingBucket(null);
	};

	const handleDeleteBucketClick = (bucket: Bucket) => {
		setItemToDelete({ id: bucket.id, name: bucket.name, type: 'bucket' });
		setIsDeleteModalOpen(true);
	};

	// Disposition Actions
	const handleAddDisposition = () => {
		if (!activeBucketId) return;
		setDispositionForm({ fieldType: 'dropdown', fieldLabel: '', dropdownOptions: [''], nestedOptions: [], sortOrder: 'entered', isRequired: false, color: '#EF4444', subFields: [], optionSubFields: {} });
		setIsAddDispositionModalOpen(true);
	};

	const handleEditDisposition = (d: DispositionCategory) => {
		setAllowTypeChange(false);
		setEditingDisposition(d);
		setDispositionForm({ fieldType: d.fieldType, fieldLabel: d.name, dropdownOptions: d.dropdownOptions || [''], nestedOptions: d.nestedOptions || [], sortOrder: d.sortOrder || 'entered', isRequired: d.isRequired || false, color: d.color, subFields: d.subFields || [], optionSubFields: d.optionSubFields || {} });
		setIsEditDispositionModalOpen(true);
	};

	const handleChangeTypeClick = (d: DispositionCategory) => {
		setChangeTypeTarget(d);
		setIsConfirmChangeTypeOpen(true);
	};

	const handleConfirmChangeType = () => {
		if (changeTypeTarget) {
			setAllowTypeChange(true);
			setEditingDisposition(changeTypeTarget);
			setDispositionForm({
				fieldType: changeTypeTarget.fieldType,
				fieldLabel: changeTypeTarget.name,
				dropdownOptions: changeTypeTarget.dropdownOptions || [''],
				nestedOptions: changeTypeTarget.nestedOptions || [],
				sortOrder: changeTypeTarget.sortOrder || 'entered',
				isRequired: changeTypeTarget.isRequired || false,
				color: changeTypeTarget.color,
				subFields: changeTypeTarget.subFields || [],
				optionSubFields: changeTypeTarget.optionSubFields || {}
			});
			setIsEditDispositionModalOpen(true);
			setChangeTypeTarget(null);
		}
	};

	const handleDeleteDispositionClick = (d: DispositionCategory) => {
		setItemToDelete({ id: d.id, name: d.name, type: 'disposition' });
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		if (itemToDelete.type === 'bucket') {
			try {
				if (setupData.campaignId) {
					await deleteBucketMutation({ id: setupData.campaignId, bucketId: itemToDelete.id }).unwrap();
				}
			} catch (e) {
				console.error("Backend delete bucket error:", e);
			}
			deleteBucket(itemToDelete.id);
			toast.success("Bucket deleted successfully");
		} else {
			if (activeBucketId) {
				updateDispositionInBucket(activeBucketId, itemToDelete.id, { isArchived: true });
				toast.success("Disposition moved to archive");
			}
		}
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleSaveDisposition = (isArchived?: boolean) => {
		if (!activeBucketId) return;

		// Basic Validation
		if (!dispositionForm.fieldLabel.trim()) {
			toast.error("Please enter a field label");
			return;
		}

		if (editingDisposition) {
			// Update active disposition
			updateDispositionInBucket(activeBucketId, editingDisposition.id, {
				name: dispositionForm.fieldLabel,
				color: dispositionForm.color,
				fieldType: dispositionForm.fieldType,
				dropdownOptions: dispositionForm.dropdownOptions,
				nestedOptions: dispositionForm.nestedOptions,
				sortOrder: dispositionForm.sortOrder,
				isRequired: dispositionForm.isRequired,
				subFields: dispositionForm.subFields,
				optionSubFields: dispositionForm.optionSubFields,
				isArchived: editingDisposition.isArchived
			});

			// If this disposition is active and has a linked archived backup copy, update the backup copy too!
			if (!editingDisposition.isArchived) {
				const backupCopy = activeBucket?.dispositions?.find(
					d => d.backupOfId === editingDisposition.id || d.id === editingDisposition.backupId
				);
				if (backupCopy) {
					updateDispositionInBucket(activeBucketId, backupCopy.id, {
						name: dispositionForm.fieldLabel,
						color: dispositionForm.color,
						fieldType: dispositionForm.fieldType,
						dropdownOptions: dispositionForm.dropdownOptions,
						nestedOptions: dispositionForm.nestedOptions,
						sortOrder: dispositionForm.sortOrder,
						isRequired: dispositionForm.isRequired,
						subFields: dispositionForm.subFields,
						optionSubFields: dispositionForm.optionSubFields
					});
				}
			}

			toast.success("Disposition updated successfully");
			setIsEditDispositionModalOpen(false);
		} else {
			if (isArchived) {
				// Simply archive the new disposition
				addDispositionToBucket(activeBucketId, {
					name: dispositionForm.fieldLabel,
					color: dispositionForm.color,
					fieldType: dispositionForm.fieldType,
					dropdownOptions: dispositionForm.dropdownOptions,
					nestedOptions: dispositionForm.nestedOptions,
					sortOrder: dispositionForm.sortOrder,
					isRequired: dispositionForm.isRequired,
					subFields: dispositionForm.subFields,
					optionSubFields: dispositionForm.optionSubFields,
					isArchived: true
				});
				toast.success("Disposition saved to archive");
			} else {
				// Create the new active disposition AND also automatically archive a linked backup copy!
				const activeId = `dsp-${Date.now()}`;
				const archivedId = `dsp-${Date.now()}-archived`;

				// Add active disposition
				addDispositionToBucket(activeBucketId, {
					id: activeId,
					name: dispositionForm.fieldLabel,
					color: dispositionForm.color,
					fieldType: dispositionForm.fieldType,
					dropdownOptions: dispositionForm.dropdownOptions,
					nestedOptions: dispositionForm.nestedOptions,
					sortOrder: dispositionForm.sortOrder,
					isRequired: dispositionForm.isRequired,
					subFields: dispositionForm.subFields,
					optionSubFields: dispositionForm.optionSubFields,
					isArchived: false,
					backupId: archivedId
				});

				// Add archived copy
				addDispositionToBucket(activeBucketId, {
					id: archivedId,
					name: dispositionForm.fieldLabel,
					color: dispositionForm.color,
					fieldType: dispositionForm.fieldType,
					dropdownOptions: dispositionForm.dropdownOptions,
					nestedOptions: dispositionForm.nestedOptions,
					sortOrder: dispositionForm.sortOrder,
					isRequired: dispositionForm.isRequired,
					subFields: dispositionForm.subFields,
					optionSubFields: dispositionForm.optionSubFields,
					isArchived: true,
					backupOfId: activeId
				});

				toast.success("New disposition added and backup copy archived");
			}
			setIsAddDispositionModalOpen(false);
		}
		setEditingDisposition(null);
	};

	const handleOpenAssignModal = (bucket: Bucket) => {
		setAssigningToBucketId(bucket.id);
		setAssigningToBucketName(bucket.name);
		setIsAssignMemberModalOpen(true);
	};

	const handleAssignMember = async (membersToAssign: { memberId: string, memberName: string }[], duration?: number) => {
		if (!assigningToBucketId || !setupData.campaignId) return;

		try {
			const result = await assignMember({
				id: setupData.campaignId,
				bucketId: assigningToBucketId,
				members: membersToAssign,
				duration
			}).unwrap();

			if (result.campaign) {
				updateDashboardSettings({ buckets: result.campaign.dashboardSettings.buckets });
				if (result.existingBucket) {
					toast.info(`Some members are also active in the "${result.existingBucket}" bucket.`);
				} else {
					toast.success(`Assigned ${membersToAssign.length} member(s) to ${assigningToBucketName}`);
				}
			}
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toast.error(err.data?.message || "Failed to assign members");
			throw error;
		}
	};

	const handleRemoveMember = async (bucketId: string, memberId: string, memberName: string) => {
		if (!setupData.campaignId) return;

		try {
			const result = await removeMember({
				id: setupData.campaignId,
				bucketId,
				memberId
			}).unwrap();

			if (result.campaign) {
				updateDashboardSettings({ buckets: result.campaign.dashboardSettings.buckets });
				toast.success(`Removed ${memberName} from bucket`);
			}
		} catch {
			toast.error("Failed to remove member");
		}
	};

	return (
		<div >
			<div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
				{/* Left: Buckets Sidebar */}
				<div
					className="w-full lg:w-72 shrink-0 dark:bg-gray-800 border dark:border-gray-700 flex flex-col rounded-[var(--radius)]"
					style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				>
					<div className="p-5 border-b dark:border-gray-700 flex items-center justify-between" style={{ borderColor: 'var(--light-gray)' }}>
						<div className="flex items-center gap-2">
							<ArchiveIcon className="w-3.5 h-3.5 text-gray-400" />
							<h3 className="font-inter text-xs font-semibold uppercase tracking-wider text-gray-500">Buckets</h3>
						</div>
						<Button variant="ghost" size="sm" onClick={handleAddBucket} className="p-1 h-auto text-primary hover:bg-primary/10 rounded-full">
							<PlusIcon className="w-4 h-4" />
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto p-2 space-y-1">
						{accessibleBuckets?.length > 0 ? (
							accessibleBuckets?.map((bucket: Bucket) => (
								<div
									key={bucket?.id}
									onClick={() => setActiveBucketId(bucket?.id)}
									className={`group p-3 rounded-[var(--radius)] cursor-pointer transition-all flex items-center justify-between ${activeBucketId === bucket?.id
										? 'bg-primary/5 border-primary/20 border'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
										}`}
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: bucket.color || '#6B7280' }} />
										<div className="flex flex-col min-w-0 flex-1">
											<span className={`text-[12px] font-medium truncate ${activeBucketId === bucket?.id ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
												{bucket?.name}
											</span>
											<div className="flex items-center gap-2">
												<span className="text-[10px] text-gray-400 truncate">{bucket?.dispositions?.length} disp.</span>
												{bucket?.assignedMembers && bucket?.assignedMembers?.length > 0 && (
													<span className="text-[10px] text-primary bg-primary/10 px-1.5 rounded-full font-medium">
														{bucket?.assignedMembers?.length} assigned
													</span>
												)}
											</div>
										</div>
									</div>
									<div className={`flex items-center gap-1 transition-opacity ${activeBucketId === bucket?.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
										<button
											onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(bucket); }}
											className="p-1 hover:text-primary text-gray-400"
											title="Assign Members"
										>
											<IdCardIcon className="w-3.5 h-3.5" />
										</button>
										<button onClick={(e) => { e.stopPropagation(); handleEditBucket(bucket); }} className="p-1 hover:text-primary text-gray-400">
											<Pencil1Icon className="w-3.5 h-3.5" />
										</button>
										<button onClick={(e) => { e.stopPropagation(); handleDeleteBucketClick(bucket); }} className="p-1 hover:text-red-500 text-gray-400" title="Delete Bucket">
											<TrashIcon className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
							))
						) : (
							<EmptyState
								icon={ArchiveIcon}
								title="No Buckets Found"
								description="Create your first bucket to begin organizing your dispositions."
								className="py-10"
							/>
						)}
					</div>
				</div>

				{/* Center: Dispositions for active bucket */}
				<div className="flex-1 flex flex-col gap-6">
					<div
						className="flex-1 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden flex flex-col"
						style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
					>
						<div className="p-6 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/10" style={{ borderColor: 'var(--light-gray)' }}>
							<div>
								<h2 className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
									{activeBucket?.name || 'Select a Bucket'}
								</h2>
								<p className="text-[11px] text-gray-500 mt-0.5">{activeBucket?.description || 'Bucket details and dispositions'}</p>
							</div>
							<div className="flex items-center gap-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => activeBucket && handleOpenAssignModal(activeBucket)}
									disabled={!activeBucket}
									className="flex items-center gap-2"
								>
									<IdCardIcon className="w-4 h-4" />
									Manage Members
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsArchiveModalOpen(true)}
									disabled={!activeBucketId}
									className="flex items-center gap-2"
								>
									<ArchiveIcon className="w-4 h-4" />
									Archive ({archivedDispositions.length})
								</Button>
								<Button variant="primary" size="sm" onClick={handleAddDisposition} disabled={!activeBucketId}>
									Add Disposition
								</Button>
							</div>
						</div>

						{/* Assigned Members List (Subheader) */}
						{activeBucket?.assignedMembers && activeBucket.assignedMembers?.length > 0 && (
							<div className="px-6 py-3 bg-gray-50/30 dark:bg-gray-900/5 border-b dark:border-gray-700 flex flex-wrap gap-2 items-center" style={{ borderColor: 'var(--light-gray)' }}>
								<span className="text-[10px] font-semibold text-gray-400 uppercase mr-2">Assigned:</span>
								{activeBucket.assignedMembers.map(member => {
									const mId = typeof member.memberId === 'object' && member.memberId !== null
										? (member.memberId._id || member.memberId.id || '')
										: member.memberId;
									return (
										<div
											key={mId}
											className="flex items-center gap-2 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xs group/member pr-1"
											style={{ borderColor: 'var(--light-gray)' }}
										>
											<span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">{member.memberName}</span>
											{member?.duration && (
												<span className="text-[9px] text-primary bg-primary/5 px-1 rounded-sm font-mono">
													{member?.duration}m
												</span>
											)}
											<button
												onClick={() => handleRemoveMember(activeBucket.id, mId, member?.memberName || 'Member')}
												className="p-0.5 hover:text-red-500 text-gray-400 transition-colors cursor-pointer"
											>
												<Icon name="Close_round_light" size="sm" />
											</button>
										</div>
									);
								})}
							</div>
						)}

						<div className="p-6 overflow-y-auto">
							{dispositions.length > 0 ? (
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={dispositions.map(d => d.id)}
										strategy={rectSortingStrategy}
									>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{dispositions.map(d => (
												<SortableDispositionCard
													key={d.id}
													d={d}
													handleEditDisposition={handleEditDisposition}
													handleDeleteDispositionClick={handleDeleteDispositionClick}
													handleChangeTypeClick={handleChangeTypeClick}
													handlePreviewDisposition={(d) => { setPreviewDisposition(d); setPreviewValue(''); }}
												/>
											))}
										</div>
									</SortableContext>
								</DndContext>
							) : (
								<EmptyState
									icon={ArchiveIcon}
									title="No Dispositions Found"
									description="Kickstart this bucket by adding its first category."
									className="py-12"
								/>
							)}
						</div>
					</div>
				</div>

				{/* Right: Review/Preview Chart */}
				<div
					className="w-full lg:w-80 shrink-0 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)] overflow-hidden flex flex-col"
					style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
				>
					<div className="p-6 border-b dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
						<h2 className="font-inter text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Live Preview</h2>
						<Dropdown
							label=""
							value={dispositionSettings.chartType || 'pie'}
							onChange={(val) => {
								const stringValue = Array.isArray(val) ? val[0] : val;
								updateDashboardSettings({
									dispositionSettings: {
										...dispositionSettings,
										chartType: stringValue as 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble'
									}
								});
							}}
							options={chartTypeOptions}
							className="w-full"
						/>
					</div>

					<div className="p-6 flex-1 flex flex-col">
						<div className="h-48 mb-6">
							{renderChart()}
						</div>

						{dispositions.length > 0 && (
							<div className="space-y-4 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
								{dispositions.map(d => (
									<div key={d.id} className="flex items-center justify-between">
										<div className="flex items-center gap-2 min-w-0">
											<div className="w-2.5 h-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: d.color }} />
											<span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
										</div>
										<span className="text-[11px] font-semibold text-gray-900 dark:text-gray-100">
											{Math.floor(Math.random() * 40)}%
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<AddBucketModal
				isOpen={isAddBucketModalOpen}
				onClose={() => setIsAddBucketModalOpen(false)}
				bucketForm={bucketForm}
				setBucketForm={setBucketForm}
				onSave={handleSaveBucket}
			/>
			<AddBucketModal
				isOpen={isEditBucketModalOpen}
				onClose={() => setIsEditBucketModalOpen(false)}
				title="Edit Bucket"
				bucketForm={bucketForm}
				setBucketForm={setBucketForm}
				onSave={handleSaveBucket}
			/>

			<AddDispositionModal
				isOpen={isAddDispositionModalOpen}
				onClose={() => setIsAddDispositionModalOpen(false)}
				title={activeBucket ? `New Disposition in ${activeBucket.name}` : "New Disposition"}
				dispositionForm={dispositionForm}
				setDispositionForm={setDispositionForm}
				fieldTypeOptions={fieldTypeOptions}
				onSave={handleSaveDisposition}
				onAddDropdownOption={() => setDispositionForm(prev => ({ ...prev, dropdownOptions: [...prev.dropdownOptions, ''] }))}
				onDropdownOptionChange={(idx, val) => setDispositionForm(prev => ({ ...prev, dropdownOptions: prev.dropdownOptions.map((o, i) => i === idx ? val : o) }))}
				allowTypeChange={true}
			/>
			<AddDispositionModal
				isOpen={isEditDispositionModalOpen}
				onClose={() => setIsEditDispositionModalOpen(false)}
				title="Edit Disposition"
				dispositionForm={dispositionForm}
				setDispositionForm={setDispositionForm}
				fieldTypeOptions={fieldTypeOptions}
				onSave={handleSaveDisposition}
				onAddDropdownOption={() => setDispositionForm(prev => ({ ...prev, dropdownOptions: [...prev.dropdownOptions, ''] }))}
				onDropdownOptionChange={(idx, val) => setDispositionForm(prev => ({ ...prev, dropdownOptions: prev.dropdownOptions.map((o, i) => i === idx ? val : o) }))}
				allowTypeChange={allowTypeChange}
			/>

			<ArchiveModal
				isOpen={isArchiveModalOpen}
				onClose={() => setIsArchiveModalOpen(false)}
				archivedDispositions={archivedDispositions}
				onRestore={handleRestoreDisposition}
				onDeletePermanently={handlePermanentDeleteDisposition}
			/>

			<DeleteRecordModal
				isOpen={isDeleteModalOpen}
				onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
				onConfirm={handleConfirmDelete}
				recordName={itemToDelete?.name || ''}
			/>

			<ConfirmChangeTypeModal
				isOpen={isConfirmChangeTypeOpen}
				onClose={() => { setIsConfirmChangeTypeOpen(false); setChangeTypeTarget(null); }}
				onConfirm={handleConfirmChangeType}
				dispositionName={changeTypeTarget?.name || ''}
			/>

			<AssignMemberModal
				isOpen={isAssignMemberModalOpen}
				onClose={() => setIsAssignMemberModalOpen(false)}
				bucketId={assigningToBucketId || ''}
				bucketName={assigningToBucketName}
				campaignId={setupData.campaignId || ''}
				onAssign={handleAssignMember}
			/>

			{/* Disposition Preview Modal */}
			<Modal
				isOpen={!!previewDisposition}
				onClose={() => setPreviewDisposition(null)}
				title="Field Preview"
				size="lg"
			>
				{previewDisposition && (
					<div className="p-6 space-y-5">
						{/* Field info header */}
						<div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--light-gray)' }}>
							<div className="w-4 h-4 rounded" style={{ backgroundColor: previewDisposition.color }} />
							<div>
								<p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{previewDisposition.name}</p>
								<p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
									Type: <span className="font-medium capitalize">{previewDisposition.fieldType.replace(/-/g, ' ')}</span>
									{previewDisposition.isRequired && <span className="text-red-500 ml-2">• Required</span>}
								</p>
							</div>
						</div>

						{/* Interactive preview */}
						<div className="p-5 rounded-lg border" style={{ borderColor: 'var(--light-gray)', backgroundColor: 'var(--bg-primary)' }}>
							<p className="text-[10px] uppercase tracking-wider font-semibold mb-4" style={{ color: 'var(--text-tertiary)' }}>Agent View Preview</p>

							{(() => {
								const field = previewDisposition;
								switch (field.fieldType) {
									case 'dropdown':
										return (
											<Dropdown
												label={field.name}
												placeholder="Select an option"
												options={(field.dropdownOptions || []).map(opt => ({ value: opt, label: opt }))}
												value={previewValue}
												onChange={(val) => setPreviewValue(Array.isArray(val) ? val[0] : val)}
												required={field.isRequired}
											/>
										);

									case 'autosuggest':
										return (
											<div className="w-full">
												<label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
													{field.name}
													{field.isRequired && <span className="text-red-500 ml-1">*</span>}
												</label>
												<Autosuggestions
													suggestions={field.dropdownOptions || []}
													value={previewValue}
													onChange={setPreviewValue}
													required={field.isRequired}
												/>
											</div>
										);

									case 'multi-dropdown':
										return (
											<div className="space-y-3">
												{(field.nestedOptions || []).length > 0 ? (
													<>
														<Dropdown
															label={field.name}
															placeholder="Select option"
															options={(field.nestedOptions || []).map(opt => ({ value: opt.value, label: opt.value }))}
															value={previewValue}
															onChange={(val) => setPreviewValue(Array.isArray(val) ? val[0] : val)}
														/>
														{previewValue && (() => {
															const selected = (field.nestedOptions || []).find(o => o.value === previewValue);
															if (selected?.subOptions && selected.subOptions.length > 0) {
																return (
																	<Dropdown
																		label={selected.subLabel || `Sub-option for "${previewValue}"`}
																		placeholder="Select sub-option"
																		options={selected.subOptions.map(s => ({ value: s.value, label: s.value }))}
																		value=""
																		onChange={() => {}}
																	/>
																);
															}
															return null;
														})()}
													</>
												) : (
													<p className="text-xs text-gray-400 italic">No nested options configured yet.</p>
												)}
											</div>
										);

									case 'radio-select':
									case 'radio-group':
										return (
											<div>
												<label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
													{field.name}
													{field.isRequired && <span className="text-red-500 ml-1">*</span>}
												</label>
												<div className="space-y-2">
													{(field.dropdownOptions || []).map((opt, i) => (
														<label key={i} className="flex items-center gap-2 cursor-pointer group">
															<input
																type="radio"
																name="preview-radio"
																value={opt}
																checked={previewValue === opt}
																onChange={() => setPreviewValue(opt)}
																className="accent-[var(--secondary)]"
															/>
															<span className="text-[12px] group-hover:text-[var(--text-primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
														</label>
													))}
												</div>
											</div>
										);

									case 'single-radio':
										return (
											<label className="flex items-center gap-2 cursor-pointer">
												<input
													type="radio"
													checked={previewValue === 'true'}
													onChange={() => setPreviewValue(previewValue === 'true' ? 'false' : 'true')}
													className="accent-[var(--secondary)]"
												/>
												<span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{field.name}</span>
											</label>
										);

									case 'checkbox':
									case 'multiple-checkbox':
										return (
											<div>
												<label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
													{field.name}
													{field.isRequired && <span className="text-red-500 ml-1">*</span>}
												</label>
												<div className="space-y-2">
													{(field.dropdownOptions || []).map((opt, i) => (
														<label key={i} className="flex items-center gap-2 cursor-pointer group">
															<input
																type="checkbox"
																checked={previewValue.split(',').includes(opt)}
																onChange={(e) => {
																	const vals = previewValue ? previewValue.split(',').filter(Boolean) : [];
																	if (e.target.checked) vals.push(opt);
																	else vals.splice(vals.indexOf(opt), 1);
																	setPreviewValue(vals.join(','));
																}}
																className="accent-[var(--secondary)]"
															/>
															<span className="text-[12px] group-hover:text-[var(--text-primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>{opt}</span>
														</label>
													))}
												</div>
											</div>
										);

									case 'single-checkbox':
										return (
											<label className="flex items-center gap-2 cursor-pointer">
												<input
													type="checkbox"
													checked={previewValue === 'true'}
													onChange={() => setPreviewValue(previewValue === 'true' ? 'false' : 'true')}
													className="accent-[var(--secondary)]"
												/>
												<span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{field.name}</span>
											</label>
										);

									case 'number':
										return (
											<Input
												label={field.name}
												placeholder="Enter a number"
												value={previewValue}
												onChange={setPreviewValue}
												type="number"
											/>
										);

									case 'phone':
										return (
											<Input
												label={field.name}
												placeholder="Enter phone number"
												value={previewValue}
												onChange={setPreviewValue}
												type="tel"
											/>
										);

									case 'email':
										return (
											<Input
												label={field.name}
												placeholder="Enter email address"
												value={previewValue}
												onChange={setPreviewValue}
												type="email"
											/>
										);

									case 'date':
										return (
											<Input
												label={field.name}
												placeholder="DD/MM/YYYY"
												value={previewValue}
												onChange={setPreviewValue}
												type="date"
											/>
										);

									case 'multi-line-text':
										return (
											<div>
												<label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
													{field.name}
													{field.isRequired && <span className="text-red-500 ml-1">*</span>}
												</label>
												<textarea
													rows={4}
													value={previewValue}
													onChange={(e) => setPreviewValue(e.target.value)}
													placeholder="Enter text..."
													className="w-full rounded-[var(--radius)] border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] dark:bg-gray-800 dark:text-white"
													style={{ borderColor: 'var(--light-gray)', color: 'var(--text-primary)' }}
												/>
											</div>
										);

									case 'date-time':
										return (
											<div>
												<label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
													{field.name}
													{field.isRequired && <span className="text-red-500 ml-1">*</span>}
												</label>
												<div className="grid grid-cols-2 gap-3">
													<Input label="" placeholder="DD/MM/YYYY" value="" onChange={() => {}} type="date" />
													<Input label="" placeholder="HH:MM" value="" onChange={() => {}} type="time" />
												</div>
											</div>
										);

									default:
										// text and any other type
										return (
											<Input
												label={field.name}
												placeholder="Enter text"
												value={previewValue}
												onChange={setPreviewValue}
											/>
										);
								}
							})()}
						</div>

						{/* Options summary */}
						{(previewDisposition.dropdownOptions && previewDisposition.dropdownOptions.length > 0 && !['radio-select', 'radio-group', 'checkbox', 'multiple-checkbox'].includes(previewDisposition.fieldType)) && (
							<div className="pt-3 border-t" style={{ borderColor: 'var(--light-gray)' }}>
								<p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Configured Options ({previewDisposition.dropdownOptions.length})</p>
								<div className="max-h-24 overflow-y-auto flex flex-wrap gap-1.5 p-2 rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
									{previewDisposition.dropdownOptions.map((opt, i) => (
										<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-sm" style={{ color: 'var(--text-secondary)' }}>
											{opt}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</Modal>
		</div>
	);
}

interface ArchiveModalProps {
	isOpen: boolean;
	onClose: () => void;
	archivedDispositions: DispositionCategory[];
	onRestore: (dispositionId: string) => void;
	onDeletePermanently: (dispositionId: string) => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({
	isOpen,
	onClose,
	archivedDispositions,
	onRestore,
	onDeletePermanently
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
			<div className="bg-white dark:bg-gray-800 border dark:border-gray-700 w-full max-w-md rounded-[var(--radius)] shadow-xl flex flex-col max-h-[80vh]">
				{/* Header */}
				<div className="p-5 border-b dark:border-gray-700 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ArchiveIcon className="w-4 h-4 text-primary" />
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Archived Dispositions</h3>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-500">
						<Icon name="Close_round_light" size="md" />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-5 space-y-3">
					{archivedDispositions.length > 0 ? (
						archivedDispositions.map((d) => (
							<div
								key={d.id}
								className="flex items-center justify-between p-3 rounded-[var(--radius)] border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10"
							>
								<div className="flex items-center gap-2 min-w-0">
									<div className="w-3 h-3 rounded-[2px] shrink-0" style={{ backgroundColor: d.color }} />
									<span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 truncate">{d.name}</span>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onRestore(d.id)}
										className="h-7 text-[10px] px-2"
									>
										Restore
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDeletePermanently(d.id)}
										className="h-7 text-[10px] px-2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
									>
										Delete
									</Button>
								</div>
							</div>
						))
					) : (
						<div className="py-8 text-center text-gray-400 dark:text-gray-500">
							<ArchiveIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
							<p className="text-[11px]">No archived dispositions in this bucket.</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t dark:border-gray-700 flex justify-end">
					<Button variant="outline" size="sm" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
};
