'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
	verticalListSortingStrategy,
	useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, X, ChevronRight } from 'lucide-react';
import { RowsIcon } from '@radix-ui/react-icons';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import DateInput from '@/components/ui/DateInput';
import DateTimeInput from '@/components/ui/DateTimeInput';
import RadioSelect from '@/components/ui/RadioSelect';
import CheckboxSelect from '@/components/ui/CheckboxSelect';
import Dropdown from '@/components/ui/Dropdown';
import FieldPropertiesModal from '@/components/ui/FieldPropertiesModal';
import { useSetup } from '@/contexts/SetupContext';
import SelectBucketModalPrompt from '@/components/ui/SelectBucketModalPrompt';
import { SelectBucketModal } from '@/components/ui/SelectBucketModal';

interface CustomerField {
	id: string;
	name: string;
	type: string;
	required: boolean;
	options?: string[];
}

interface FieldType {
	id: string;
	name: string;
	description: string;
}

interface SortableRowProps {
	field: CustomerField;
	handleEditField: (field: CustomerField) => void;
	handleDeleteField: (fieldId: string) => void;
	isLast: boolean;
}

const SortableRow = ({ field, handleEditField, handleDeleteField, isLast }: SortableRowProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: field.id });

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 20 : 'auto',
		position: isDragging ? 'relative' : undefined,
	};

	return (
		<tr
			ref={setNodeRef}
			style={{
				...style,
				...(isLast ? {} : { borderBottom: '1px solid', borderBottomColor: 'var(--light-gray)' }),
				backgroundColor: isDragging ? 'var(--bg-primary)' : 'transparent',
			} as React.CSSProperties}
			className={!isLast ? 'dark:border-gray-700' : ''}
		>
			<td className="py-4 px-2 w-10">
				<Button
					variant="ghost"
					size="sm"
					{...attributes}
					{...listeners}
					className="cursor-grab active:cursor-grabbing p-2 transition-colors h-auto"
					style={{ color: 'var(--text-tertiary)' }}
					title="Drag to reorder"
				>
					<GripVertical size={16} />
				</Button>
			</td>
			<td
				className="py-4 px-6 font-inter text-[10px] md:text-[12px] dark:text-gray-100"
				style={{ color: 'var(--text-primary)' }}
			>
				{field.name}
			</td>
			<td
				className="py-4 px-6 font-inter text-[10px] md:text-[12px] dark:text-gray-400"
				style={{ color: 'var(--text-tertiary)' }}
			>
				{(() => {
					switch (field.type) {
						case 'single-line-text': return 'Text';
						case 'multi-line-text': return 'Long Text';
						case 'email': return 'Email';
						case 'phone': return 'Phone';
						case 'number': return 'Number';
						case 'date': return 'Date';
						case 'date-time': return 'Date/Time';
						case 'dropdown': return 'Dropdown';
						case 'radio-select': return 'Radio Select';
						case 'checkbox': return 'Checkbox';
						default: return field.type;
					}
				})()}
			</td>
			<td className="py-4 px-6">
				{field.required ? (
					<span
						className="inline-flex items-center px-2 py-1 rounded-full text-[8px] md:text-[10px] font-medium dark:bg-green-900/30 dark:text-green-400"
						style={{
							backgroundColor: 'rgba(34, 197, 94, 0.1)',
							color: '#16A34A'
						}}
					>
						Required
					</span>
				) : (
					<span
						className="inline-flex items-center px-2 py-1 rounded-full text-[8px] md:text-[10px] font-medium dark:bg-gray-700 dark:text-gray-300"
						style={{
							backgroundColor: 'var(--bg-primary)',
							color: 'var(--text-tertiary)'
						}}
					>
						Optional
					</span>
				)}
			</td>
			<td className="flex items-center gap-5 border-none py-4 px-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleEditField(field)}
					className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-1 h-auto"
					title="Edit Field"
				>
					<Pencil size={16} />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleDeleteField(field.id)}
					className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 h-auto"
					title="Delete Field"
				>
					<Trash2 size={16} />
				</Button>
			</td>
		</tr>
	);
};

export default function CustomerBookPage() {
	const { setupData, updateBucketCustomerFields, isDirty, onPersist, setCurrentStep } = useSetup();

	useEffect(() => {
		setCurrentStep(3);
	}, [setCurrentStep]);

	const buckets = setupData?.dashboardSettings?.buckets || [];
	const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
	const selectedBucket = useMemo(() => {
		return buckets.find(b => b.id === selectedBucketId);
	}, [buckets, selectedBucketId]);
	const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
	const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
	const [selectedFieldType, setSelectedFieldType] = useState<string>('single-line-text');
	const [editingField, setEditingField] = useState<CustomerField | null>(null);

	const configuredFields = useMemo(() => {
		if (!selectedBucketId) return [];
		const bucketConfig = setupData.customerBookSettings.configuredFields.find(cf => cf && cf.bucketId === selectedBucketId);
		if (bucketConfig?.fields) return bucketConfig.fields;

		// Fallback to bucket's own customerFields for and newly created buckets or older versions
		const bucket = buckets.find(b => b.id === selectedBucketId);
		return bucket?.customerFields || [];
	}, [setupData.customerBookSettings.configuredFields, selectedBucketId, buckets]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id && selectedBucketId) {
			const oldIndex = configuredFields.findIndex((field) => field.id === active.id);
			const newIndex = configuredFields.findIndex((field) => field.id === over.id);

			updateBucketCustomerFields(selectedBucketId, arrayMove(configuredFields, oldIndex, newIndex));
		}
	};

	const availableFieldTypes: FieldType[] = [
		{
			id: 'single-line-text',
			name: 'Single-Line Text',
			description: 'Add a single line of text'
		},
		{
			id: 'email',
			name: 'Email',
			description: 'Stores email addresses'
		},
		{
			id: 'multi-line-text',
			name: 'Multi-Line Text',
			description: 'Add a few lines of text'
		},
		{
			id: 'number',
			name: 'Number',
			description: 'Enter a string of number'
		},
		{
			id: 'date',
			name: 'Date',
			description: 'Select a date from a calendar'
		},
		{
			id: 'phone',
			name: 'Phone',
			description: 'Stores phone numbers'
		},
		{
			id: 'date-time',
			name: 'Date/Time',
			description: 'Stores a date and time value'
		},
		{
			id: 'dropdown',
			name: 'Drop-down',
			description: 'Choose one option in a menu of choices'
		},
		{
			id: 'radio-select',
			name: 'Radio Select',
			description: 'Select one option from a list of menu'
		},
		{
			id: 'checkbox',
			name: 'Checkbox',
			description: 'Select Multiple Options from a list of options'
		},
	];

	const handleDeleteField = (fieldId: string) => {
		if (selectedBucketId) {
			const updatedFields = configuredFields.filter(f => f.id !== fieldId);
			updateBucketCustomerFields(selectedBucketId, updatedFields);
		}
	};

	const handleAddField = (fieldType: FieldType) => {
		setEditingField(null);
		setSelectedFieldType(fieldType.id);
		setIsFieldModalOpen(true);
	};

	const handleEditField = (field: CustomerField) => {
		setEditingField(field);
		setSelectedFieldType(field.type);
		setIsFieldModalOpen(true);
	};

	const handleAddFieldFromModal = (fieldData: { name: string; type: string; required: boolean; options?: string[] }) => {
		if (!selectedBucketId) return;

		if (editingField) {
			const updatedFields = configuredFields.map(f =>
				f.id === editingField.id ? { ...f, ...fieldData } : f
			);
			updateBucketCustomerFields(selectedBucketId, updatedFields);
			setEditingField(null);
		} else {
			const newField: CustomerField = {
				id: Math.random().toString(36).substr(2, 9),
				...fieldData
			};
			updateBucketCustomerFields(selectedBucketId, [...configuredFields, newField]);
		}
		setIsFieldModalOpen(false);
	};

	const renderFieldPreview = (fieldType: FieldType) => {
		const getFieldName = () => {
			switch (fieldType.id) {
				case 'single-line-text': return 'Text Field';
				case 'email': return 'Email';
				case 'multi-line-text': return 'Description';
				case 'number': return 'Amount';
				case 'date': return 'Birth Date';
				case 'phone': return 'Phone Number';
				case 'date-time': return 'Created At';
				case 'dropdown': return 'Status';
				case 'radio-select': return 'Priority';
				case 'checkbox': return 'Categories';
				default: return 'Field Name';
			}
		};

		const getPlaceholder = () => {
			switch (fieldType.id) {
				case 'single-line-text': return 'Enter text';
				case 'email': return 'Enter email';
				case 'multi-line-text': return 'Enter description...';
				case 'number': return '0';
				case 'date': return 'Select date';
				case 'phone': return 'Enter phone';
				case 'date-time': return 'Select date & time';
				case 'dropdown': return 'Choose option';
				case 'radio-select': return 'Select option';
				case 'checkbox': return 'Select options';
				default: return 'Enter value';
			}
		};

		const fieldName = getFieldName();
		const placeholder = getPlaceholder();

		switch (fieldType.id) {
			case 'multi-line-text':
				return (
					<Textarea
						label={fieldName}
						value=""
						onChange={() => { }}
						placeholder={placeholder}
						rows={2}
						resize="none"
						className="text-[8px] md:text-[10px]"
						inputClassName="h-20"
					/>
				);
			case 'dropdown':
				return (
					<Dropdown
						label={fieldName}
						value=""
						onChange={() => { }}
						placeholder={placeholder}
						options={[
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' },
							{ value: 'pending', label: 'Pending' }
						]}
						className="text-[8px] md:text-[10px]"
						inputClassName="h-10"
					/>
				);
			case 'date':
				return (
					<DateInput
						label={fieldName}
						value=""
						onChange={() => { }}
						placeholder={placeholder}
						className="text-[8px] md:text-[10px]"
						inputClassName="h-10"

					/>
				);
			case 'date-time':
				return (
					<DateTimeInput
						label={fieldName}
						value=""
						onChange={() => { }}
						placeholder={placeholder}
						className="text-[8px] md:text-[10px]"
						inputClassName="h-10"
					/>
				);
			case 'radio-select':
				return (
					<RadioSelect
						label={fieldName}
						name={`preview-${fieldType.id}`}
						value=""
						onChange={() => { }}
						options={[
							{ value: 'high', label: 'High' },
							{ value: 'medium', label: 'Medium' },
							{ value: 'low', label: 'Low' }
						]}
						className="text-[8px] md:text-[10px]"
					/>
				);
			case 'checkbox':
				return (
					<CheckboxSelect
						label={fieldName}
						value={[]}
						onChange={() => { }}
						options={[
							{ value: 'marketing', label: 'Marketing' },
							{ value: 'sales', label: 'Sales' },
							{ value: 'support', label: 'Support' }
						]}
						className="text-[8px] md:text-[10px]"
					/>
				);
			default:
				return (
					<Input
						label={fieldName}
						value=""
						onChange={() => { }}
						placeholder={placeholder}
						type={fieldType.id === 'email' ? 'email' : fieldType.id === 'number' ? 'number' : 'text'}
						className="text-[8px] md:text-[10px]"
						inputClassName="h-10"
					/>
				);
		}
	};

	return (
		<div className="relative w-full h-full min-h-[600px]">
			{/* Header Section */}
			<div className="mb-0">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1
							className="font-lato not-italic font-semibold text-[20px] sm:text-[24px] leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							Customer Book
						</h1>
						<p
							className="font-lato not-italic font-normal text-[10px] md:text-[12px] sm:text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							Configure unique customer data fields for each bucket to keep your data organized and relevant.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
						{selectedBucket && (
							<div
								className="flex items-center gap-3 px-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
								style={{ borderColor: 'var(--light-gray)' }}
							>
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: selectedBucket.color }}
								/>
								<span className="text-sm font-medium dark:text-gray-200" style={{ color: 'var(--text-primary)' }}>
									{selectedBucket.name}
								</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setIsBucketModalOpen(true)}
									className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 p-1 h-auto"
								>
									Change
								</Button>
							</div>
						)}
						{isDirty && onPersist && (
							<Button
								variant="outline"
								size="md"
								onClick={() => onPersist?.(false)}
								className="flex items-center gap-2 justify-center"
							>
								Save
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="mt-8">
				{!selectedBucketId ? (
					<div
						className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/20 group"
						onClick={() => setIsBucketModalOpen(true)}
					>
						<div
							className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"
						>
							<Plus size={32} />
						</div>
						<h3 className="text-xl font-bold dark:text-white mb-2" style={{ color: 'var(--text-primary)' }}>
							Start by Selecting a Bucket
						</h3>
						<p className="text-sm dark:text-gray-400 max-w-sm text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>
							Configure unique customer data fields for each segment. Choose a bucket to begin.
						</p>
						<Button
							variant="primary"
							onClick={(e) => {
								e.stopPropagation();
								setIsBucketModalOpen(true);
							}}
						>
							Select a Bucket
						</Button>
					</div>
				) : (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
						{/* Configured Fields Table */}
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 mb-8 rounded-[var(--radius)] overflow-hidden"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div className="overflow-x-auto">
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<table className="w-full">
										<thead>
											<tr>
												<th className="w-10"></th>
												<th>Field Name</th>
												<th>Type</th>
												<th>Required</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{configuredFields?.length === 0 ? (
												<tr>
													<td colSpan={5} className="py-4 px-6 text-center">
														<EmptyState
															icon={RowsIcon}
															title="No Fields Found"
															description="No custom fields have been configured for this bucket yet."
															actionLabel="Add New Field"
															onAction={() => {
																setEditingField(null);
																setSelectedFieldType('single-line-text');
																setIsFieldModalOpen(true);
															}}
															className="py-12"
														/>
													</td>
												</tr>
											) : (
												<SortableContext
													items={configuredFields.map(f => f.id)}
													strategy={verticalListSortingStrategy}
												>
													{configuredFields.map((field, index) => (
														<SortableRow
															key={field.id}
															field={field}
															handleEditField={handleEditField}
															handleDeleteField={handleDeleteField}
															isLast={index === configuredFields.length - 1}
														/>
													))}
												</SortableContext>
											)}
										</tbody>
									</table>
								</DndContext>
							</div>
						</div>

						{/* Available Field Types */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<h3
									className="font-inter text-base font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Available Field Types
								</h3>
								<Button
									variant="primary"
									size="sm"
									onClick={() => {
										setEditingField(null);
										setSelectedFieldType('single-line-text');
										setIsFieldModalOpen(true);
									}}
									className="flex items-center gap-2"
								>
									<Plus size={14} />
									Add Field
								</Button>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{availableFieldTypes.map((fieldType) => (
									<div
										key={fieldType.id}
										className="dark:bg-gray-800 border dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all rounded-[var(--radius)] hover:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-hover)]"
										style={{
											backgroundColor: 'var(--accent-white)',
											borderColor: 'var(--light-gray)'
										}}
										onClick={() => handleAddField(fieldType)}
									>
										<h4
											className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2"
											style={{ color: 'var(--text-primary)' }}
										>
											{fieldType.name}
										</h4>
										<p
											className="font-lato text-[8px] md:text-[10px] dark:text-gray-400 mb-3"
											style={{ color: 'var(--text-tertiary)' }}
										>
											{fieldType.description}
										</p>
										<div
											className="dark:bg-gray-700 border dark:border-gray-600 p-2 pointer-events-none rounded-[var(--radius)]"
											style={{
												backgroundColor: 'var(--bg-primary)',
												borderColor: 'var(--light-gray)'
											}}
										>
											{renderFieldPreview(fieldType)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Bucket Selection Modal */}
			<SelectBucketModal
				isOpen={isBucketModalOpen}
				onClose={() => setIsBucketModalOpen(false)}
				buckets={buckets}
				selectedBucketId={selectedBucketId}
				onSelect={(bucketId: string) => {
					setSelectedBucketId(bucketId);
					setIsBucketModalOpen(false);
				}}
				onNavigateToDashboard={() => setCurrentStep(2)}
				getFieldCount={(bucketId) => {
					const configCount = setupData.customerBookSettings.configuredFields.find(cf => cf && cf.bucketId === bucketId)?.fields?.length;
					if (configCount !== undefined) return configCount;

					return buckets.find(b => b.id === bucketId)?.customerFields?.length || 0;
				}}
			/>

			<FieldPropertiesModal
				isOpen={isFieldModalOpen}
				onClose={() => setIsFieldModalOpen(false)}
				onAddField={handleAddFieldFromModal}
				fieldType={selectedFieldType}
				initialData={editingField}
			/>
		</div>
	);
}
