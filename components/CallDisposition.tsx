'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import AddDispositionModal from './AddDispositionModal';
import AddBucketModal from './AddBucketModal';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import { useSetup, Bucket, DispositionCategory } from '@/contexts/SetupContext';
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
import Icon from '@/components/ui/Icon';
import {
	useAssignMemberToBucketMutation,
	useRemoveMemberFromBucketMutation
} from '@/store/services/campaignApi';
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

	const [activeBucketId, setActiveBucketId] = useState<string | null>(null);
	const [isAddDispositionModalOpen, setIsAddDispositionModalOpen] = useState(false);
	const [isEditDispositionModalOpen, setIsEditDispositionModalOpen] = useState(false);
	const [editingDisposition, setEditingDisposition] = useState<DispositionCategory | null>(null);

	const [isAddBucketModalOpen, setIsAddBucketModalOpen] = useState(false);
	const [isEditBucketModalOpen, setIsEditBucketModalOpen] = useState(false);
	const [editingBucket, setEditingBucket] = useState<Bucket | null>(null);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string, type: 'bucket' | 'disposition' } | null>(null);

	const [isAssignMemberModalOpen, setIsAssignMemberModalOpen] = useState(false);
	const [assigningToBucketId, setAssigningToBucketId] = useState<string | null>(null);
	const [assigningToBucketName, setAssigningToBucketName] = useState<string>('');

	const [assignMember] = useAssignMemberToBucketMutation();
	const [removeMember] = useRemoveMemberFromBucketMutation();

	const [bucketForm, setBucketForm] = useState({
		name: '',
		description: '',
		color: '#050711'
	});

	const [dispositionForm, setDispositionForm] = useState({
		fieldType: 'dropdown',
		fieldLabel: '',
		dropdownOptions: [''],
		sortOrder: 'entered',
		isRequired: false,
		color: '#050711'
	});

	const [isChartReady, setIsChartReady] = useState(false);
	const [ChartComp, setChartComp] = useState<ChartComponentType | null>(null);

	// Set initial active bucket
	useEffect(() => {
		if (buckets?.length > 0 && !activeBucketId) {
			setActiveBucketId(buckets[0].id);
		}
	}, [buckets, activeBucketId]);

	const activeBucket = useMemo(() =>
		buckets?.find(b => b.id === activeBucketId),
		[buckets, activeBucketId]);

	const dispositions = activeBucket?.dispositions || [];

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
		{ value: 'single-radio', label: 'Single Radio' },
		{ value: 'radio-group', label: 'Radio Group' },
		{ value: 'single-checkbox', label: 'Checkbox' },
		{ value: 'multiple-checkbox', label: 'Multiple Checkbox' },
		{ value: 'phone', label: 'Phone' },
		{ value: 'single-line-text', label: 'Single Line Text' },
		{ value: 'multi-line-text', label: 'Multi Line Text' },
		{ value: 'email', label: 'Email' },
		{ value: 'date-time', label: 'Date/Time' }
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
		setDispositionForm({ fieldType: 'dropdown', fieldLabel: '', dropdownOptions: [''], sortOrder: 'entered', isRequired: false, color: '#EF4444' });
		setIsAddDispositionModalOpen(true);
	};

	const handleEditDisposition = (d: DispositionCategory) => {
		setEditingDisposition(d);
		setDispositionForm({ fieldType: d.fieldType, fieldLabel: d.name, dropdownOptions: d.dropdownOptions || [''], sortOrder: d.sortOrder || 'entered', isRequired: d.isRequired || false, color: d.color });
		setIsEditDispositionModalOpen(true);
	};

	const handleDeleteDispositionClick = (d: DispositionCategory) => {
		setItemToDelete({ id: d.id, name: d.name, type: 'disposition' });
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!itemToDelete) return;
		if (itemToDelete.type === 'bucket') {
			deleteBucket(itemToDelete.id);
		} else {
			if (activeBucketId) {
				deleteDispositionFromBucket(activeBucketId, itemToDelete.id);
			}
		}
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleSaveDisposition = () => {
		if (!activeBucketId) return;

		// Basic Validation
		if (!dispositionForm.fieldLabel.trim()) {
			toast.error("Please enter a field label");
			return;
		}

		if (editingDisposition) {
			updateDispositionInBucket(activeBucketId, editingDisposition.id, {
				name: dispositionForm.fieldLabel,
				color: dispositionForm.color,
				fieldType: dispositionForm.fieldType,
				dropdownOptions: dispositionForm.dropdownOptions,
				sortOrder: dispositionForm.sortOrder,
				isRequired: dispositionForm.isRequired
			});
			toast.success("Disposition updated successfully");
			setIsEditDispositionModalOpen(false);
		} else {
			addDispositionToBucket(activeBucketId, {
				name: dispositionForm.fieldLabel,
				color: dispositionForm.color,
				fieldType: dispositionForm.fieldType,
				dropdownOptions: dispositionForm.dropdownOptions,
				sortOrder: dispositionForm.sortOrder,
				isRequired: dispositionForm.isRequired
			});
			toast.success("New disposition added");
			setIsAddDispositionModalOpen(false);
		}
		setEditingDisposition(null);
	};

	const handleOpenAssignModal = (bucket: Bucket) => {
		setAssigningToBucketId(bucket.id);
		setAssigningToBucketName(bucket.name);
		setIsAssignMemberModalOpen(true);
	};

	const handleAssignMember = async (memberId: string, memberName: string, duration?: number) => {
		if (!assigningToBucketId || !setupData.campaignId) return;

		try {
			const result = await assignMember({
				id: setupData.campaignId,
				bucketId: assigningToBucketId,
				memberId,
				memberName,
				duration
			}).unwrap();

			if (result.campaign) {
				updateDashboardSettings({ buckets: result.campaign.dashboardSettings.buckets });
				if (result.existingBucket) {
					toast.info(`${memberName} is also active in the "${result.existingBucket}" bucket.`);
				} else {
					toast.success(`Assigned ${memberName} to ${assigningToBucketName}`);
				}
			}
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toast.error(err.data?.message || "Failed to assign member");
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
		} catch (error: unknown) {
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
						{buckets?.length > 0 ? (
							buckets?.map((bucket: Bucket) => (
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
										{buckets.length > 1 && (
											<button onClick={(e) => { e.stopPropagation(); handleDeleteBucketClick(bucket); }} className="p-1 hover:text-red-500 text-gray-400">
												<TrashIcon className="w-3.5 h-3.5" />
											</button>
										)}
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{dispositions.map(d => (
										<div
											key={d.id}
											className="p-4 border dark:border-gray-700 rounded-[var(--radius)] hover:shadow-sm transition-all bg-white dark:bg-gray-900/50 group"
											style={{ borderColor: 'var(--light-gray)' }}
										>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
													<span className="text-[12px] font-medium text-gray-700 dark:text-gray-200">{d.name}</span>
												</div>
												<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
													<button onClick={() => handleEditDisposition(d)} className="p-1 hover:text-primary text-gray-400">
														<Pencil1Icon className="w-3.5 h-3.5" />
													</button>
													<button onClick={() => handleDeleteDispositionClick(d)} className="p-1 hover:text-red-500 text-gray-400">
														<TrashIcon className="w-3.5 h-3.5" />
													</button>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase font-semibold">
													{d.fieldType}
												</span>
												{d.isRequired && (
													<span className="text-[10px] text-red-500 font-medium">* Required</span>
												)}
											</div>
										</div>
									))}
								</div>
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
			/>

			<DeleteRecordModal
				isOpen={isDeleteModalOpen}
				onClose={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
				onConfirm={handleConfirmDelete}
				recordName={itemToDelete?.name || ''}
			/>

			<AssignMemberModal
				isOpen={isAssignMemberModalOpen}
				onClose={() => setIsAssignMemberModalOpen(false)}
				bucketId={assigningToBucketId || ''}
				bucketName={assigningToBucketName}
				campaignId={setupData.campaignId || ''}
				onAssign={handleAssignMember}
			/>
		</div>
	);
}
