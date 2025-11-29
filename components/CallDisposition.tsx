'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import IndividualRadio from '@/components/ui/IndividualRadio';
import Icon from '@/components/ui/Icon';
import ColorPicker from '@/components/ui/ColorPicker';
import { PlusIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import Image from 'next/image';
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
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	RadialLinearScale,
	Title,
	Tooltip,
	Legend
);

interface DispositionCategory {
	id: string;
	name: string;
	color: string;
}

interface CallDispositionProps {
	dispositions: DispositionCategory[];
	onDispositionsChange: (dispositions: DispositionCategory[]) => void;
}

interface AddDispositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	dispositionForm: {
		fieldType: string;
		fieldLabel: string;
		dropdownOptions: string[];
		sortOrder: string;
		isRequired: boolean;
		color: string;
	};
	setDispositionForm: React.Dispatch<React.SetStateAction<{
		fieldType: string;
		fieldLabel: string;
		dropdownOptions: string[];
		sortOrder: string;
		isRequired: boolean;
		color: string;
	}>>;
	fieldTypeOptions: Array<{ value: string; label: string }>;
	onSave: () => void;
	onAddDropdownOption: () => void;
	onDropdownOptionChange: (index: number, value: string) => void;
}

const AddDispositionModal: React.FC<AddDispositionModalProps> = ({
	isOpen,
	onClose,
	title = "Add New Disposition",
	dispositionForm,
	setDispositionForm,
	fieldTypeOptions,
	onSave,
	onAddDropdownOption,
	onDropdownOptionChange
}) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Fixed Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-lg font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{title}
					</h2>
					<button
						onClick={onClose}
						className="dark:text-gray-500 dark:hover:text-gray-300"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Scrollable Body */}
				<div className="p-6 space-y-6 overflow-y-auto flex-1">
					{/* Field Type */}
					<Dropdown
						label="Field Type"
						placeholder="Select Field Type"
						value={dispositionForm.fieldType}
						onChange={(value) => {
							const stringValue = Array.isArray(value) ? value[0] : value;
							setDispositionForm(prev => ({ ...prev, fieldType: stringValue }));
						}}
						options={fieldTypeOptions}
					/>

					{/* Field Label */}
					<Input
						label="Field Label"
						placeholder="Enter Disposition Question"
						value={dispositionForm.fieldLabel}
						onChange={(value) => setDispositionForm(prev => ({ ...prev, fieldLabel: value }))}
					/>

					{/* Dropdown Options */}
					{dispositionForm.fieldType === 'dropdown' && (
						<div>
							<label
								className="font-inter text-sm font-medium dark:text-gray-100 mb-2 block"
								style={{ color: 'var(--text-primary)' }}
							>
								Dropdown Options
							</label>
							<div className="space-y-3">
								{dispositionForm.dropdownOptions.map((option, index) => (
									<div key={index} className="flex items-center gap-2">
										<Input
											label=""
											placeholder="Enter option"
											value={option}
											onChange={(value) => onDropdownOptionChange(index, value)}
											className="flex-1"
										/>
										<button
											onClick={() => {
												const newOptions = dispositionForm.dropdownOptions.filter((_, i) => i !== index);
												setDispositionForm(prev => ({ ...prev, dropdownOptions: newOptions }));
											}}
											className="dark:text-red-400 dark:hover:text-red-300 p-2"
											style={{ color: '#DC2626' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = '#B91C1C';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = '#DC2626';
											}}
											type="button"
										>
											<Icon name="Trash_light" size="sm" />
										</button>
									</div>
								))}
								<button
									onClick={onAddDropdownOption}
									className="dark:text-blue-400 font-inter text-sm hover:underline flex items-center gap-1"
									style={{ color: '#2563EB' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.textDecoration = 'underline';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.textDecoration = 'none';
									}}
								>
									<PlusIcon
										className="w-4 h-4"
										style={{ color: '#2563EB' }}
									/>
									Add Option
								</button>
							</div>
						</div>
					)}

					{/* Sort Order Preference */}
					<div>
						<label
							className="font-inter text-sm font-medium dark:text-gray-100 mb-3 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Sort order preference
						</label>
						<div className="space-y-2">
							<IndividualRadio
								name="sortOrder"
								value="entered"
								checked={dispositionForm.sortOrder === 'entered'}
								onChange={(value) => setDispositionForm(prev => ({ ...prev, sortOrder: value }))}
								label="Entered Order"
							/>
							<IndividualRadio
								name="sortOrder"
								value="alphabetical"
								checked={dispositionForm.sortOrder === 'alphabetical'}
								onChange={(value) => setDispositionForm(prev => ({ ...prev, sortOrder: value }))}
								label="Alphabetical Order"
							/>
						</div>
					</div>

					{/* Required Field */}
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="required"
							checked={dispositionForm.isRequired}
							onChange={(e) => setDispositionForm(prev => ({ ...prev, isRequired: e.target.checked }))}
							className="w-4 h-4 dark:text-gray-100 dark:border-gray-600 rounded dark:focus:ring-gray-400 dark:bg-gray-700"
							style={{
								borderColor: 'var(--light-gray)',
								accentColor: 'var(--text-primary)'
							}}
						/>
						<label
							htmlFor="required"
							className="font-inter text-sm dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Mark as Required
						</label>
					</div>

					{/* Colour Picker */}
					<ColorPicker
						label="Colour Picker"
						value={dispositionForm.color}
						onChange={(color) => setDispositionForm(prev => ({ ...prev, color }))}
					/>
				</div>

				{/* Fixed Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
					<Button variant="primary" size="md" onClick={onSave}>Save Disposition</Button>
				</div>
			</div>
		</div>
	);
};

export default function CallDisposition({ dispositions, onDispositionsChange }: CallDispositionProps) {
	const { setupData, updateDashboardSettings } = useSetup();
	const { dispositionSettings } = setupData.dashboardSettings;
	const [isAddDispositionModalOpen, setIsAddDispositionModalOpen] = useState(false);
	const [isEditDispositionModalOpen, setIsEditDispositionModalOpen] = useState(false);
	const [editingDisposition, setEditingDisposition] = useState<DispositionCategory | null>(null);
	const [dispositionForm, setDispositionForm] = useState({
		fieldType: 'dropdown',
		fieldLabel: '',
		dropdownOptions: [''],
		sortOrder: 'entered',
		isRequired: false,
		color: '#050711'
	});

	const timeRangeOptions = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' }
	];

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
		{ value: 'radio-select', label: 'Radio Select' },
		{ value: 'checkbox', label: 'Checkbox' },
		{ value: 'phone', label: 'Phone' },
		{ value: 'single-line-text', label: 'Single Line Text' },
		{ value: 'multi-line-text', label: 'Multi Line Text' },
		{ value: 'email', label: 'Email' },
		{ value: 'date-time', label: 'Date/Time' }
	];

	// Generate chart data from call outcomes
	const chartData = {
		labels: dispositions.length > 0 ? dispositions.map(d => d.name) : ['No dispositions configured'],
		datasets: [
			{
				label: 'Count',
				data: dispositions.length > 0 ? dispositions.map(() => Math.floor(Math.random() * 100) + 10) : [0],
				backgroundColor: dispositions.length > 0 ? dispositions.map(d => d.color) : ['#E5E7EB'],
				borderColor: dispositions.length > 0 ? dispositions.map(d => d.color) : ['#E5E7EB'],
				borderWidth: 0,
			},
		],
	};

	// Render chart based on dispositions data
	const renderChart = () => {
		if (dispositions.length === 0) {
			return (
				<div className="h-64 flex flex-col items-center justify-center text-center">
					<Image
						src="/illustrations/Pie-Chart-1--Streamline-Ux.png"
						alt="No chart data"
						className="w-32 h-32 mb-4 opacity-60 "
						width={100}
						height={100}
					/>
					<h3
						className="font-inter text-base font-medium dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						No Dispositions Configured
					</h3>
					<p
						className="font-lato text-sm dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Add disposition categories to see them visualized in your chart
					</p>
				</div>
			);
		}

		const commonOptions = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: false,
				},
			},
		};

		// Default to pie chart for disposition visualization
		return <Pie data={chartData} options={commonOptions} />;
	};

	const handleAddDisposition = () => {
		setIsAddDispositionModalOpen(true);
		setDispositionForm({
			fieldType: 'dropdown',
			fieldLabel: '',
			dropdownOptions: [''],
			sortOrder: 'entered',
			isRequired: false,
			color: '#EF4444'
		});
	};

	const handleEditDisposition = (id: string) => {
		const disposition = dispositions.find(d => d.id === id);
		if (disposition) {
			setEditingDisposition(disposition);
			setDispositionForm({
				fieldType: 'dropdown',
				fieldLabel: disposition.name,
				dropdownOptions: [''],
				sortOrder: 'entered',
				isRequired: false,
				color: disposition.color
			});
			setIsEditDispositionModalOpen(true);
		}
	};

	const handleDeleteDisposition = (id: string) => {
		const updatedDispositions = dispositions.filter(d => d.id !== id);
		onDispositionsChange(updatedDispositions);
	};

	const handleAddDropdownOption = () => {
		setDispositionForm(prev => ({
			...prev,
			dropdownOptions: [...prev.dropdownOptions, '']
		}));
	};

	const handleDropdownOptionChange = (index: number, value: string) => {
		setDispositionForm(prev => ({
			...prev,
			dropdownOptions: prev.dropdownOptions.map((option, i) => i === index ? value : option)
		}));
	};

	const handleSaveDisposition = () => {
		if (editingDisposition) {
			// Edit existing disposition
			const updatedDisposition: DispositionCategory = {
				id: editingDisposition.id,
				name: dispositionForm.fieldLabel,
				color: dispositionForm.color
			};
			const updatedDispositions = dispositions.map(d =>
				d.id === editingDisposition.id ? updatedDisposition : d
			);
			onDispositionsChange(updatedDispositions);
			setIsEditDispositionModalOpen(false);
			setEditingDisposition(null);
		} else {
			// Add new disposition
			const newDisposition: DispositionCategory = {
				id: Date.now().toString(),
				name: dispositionForm.fieldLabel,
				color: dispositionForm.color
			};
			const updatedDispositions = [...dispositions, newDisposition];
			onDispositionsChange(updatedDispositions);
			setIsAddDispositionModalOpen(false);
		}
	};


	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Manage Disposition Categories */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<h2
							className="font-inter text-lg font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Manage Disposition Categories
						</h2>
						<Button
							variant="primary"
							size="sm"
							onClick={handleAddDisposition}
							className="w-full sm:w-auto justify-center"
						>
							Add Disposition
						</Button>
					</div>
				</div>

				<div className="p-6 space-y-4">
					{dispositions.map((disposition) => (
						<div key={disposition.id} className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div
									className="w-3 h-3 rounded-sm"
									style={{ backgroundColor: disposition.color }}
								></div>
								<span
									className="font-lato text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{disposition.name}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<button
									onClick={() => handleEditDisposition(disposition.id)}
									className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
									style={{ color: 'var(--text-tertiary)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = 'var(--text-secondary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}}
								>
									<Icon name="Edit_duotone_line" size="sm" />
								</button>
								<button
									onClick={() => handleDeleteDisposition(disposition.id)}
									className="dark:text-gray-500 dark:hover:text-red-400 transition-colors"
									style={{ color: 'var(--text-tertiary)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.color = '#DC2626';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}}
								>
									<Icon name="Trash_light" size="sm" />
								</button>
							</div>
						</div>
					))}
				</div>

				<div
					className="p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h3
						className="font-inter text-base font-medium dark:text-gray-100 mb-4"
						style={{ color: 'var(--text-primary)' }}
					>
						Disposition display settings in Dashboard
					</h3>
					<div className="space-y-4">
						<div>
							<Dropdown
								label="Time Range View"
								value={dispositionSettings.timeRangeView}
								onChange={(value) => updateDashboardSettings({
									dispositionSettings: {
										...dispositionSettings,
										timeRangeView: value as 'daily' | 'weekly' | 'monthly'
									}
								})}
								options={timeRangeOptions}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Chart Area */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center justify-between">
						<h2
							className="font-inter text-lg font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							review
						</h2>
						<Dropdown
							label=""
							value={dispositionSettings.timeRangeView}
							onChange={(value) => updateDashboardSettings({
								dispositionSettings: {
									...dispositionSettings,
									timeRangeView: value as 'daily' | 'weekly' | 'monthly'
								}
							})}
							options={timeRangeOptions}
							className="min-w-[120px]"
							inputClassName="h-10 ml-4"
						/>
					</div>
				</div>

				<div className="p-6">
					{/* Dynamic Chart Rendering */}
					<div className="h-64 mb-4">
						{renderChart()}
					</div>

					{/* Legend */}
					<div className="space-y-2">
						{dispositions.length > 0 ? (
							dispositions.map((disposition, index) => (
								<div key={disposition.id} className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-sm"
										style={{ backgroundColor: disposition.color }}
									></div>
									<span
										className="font-lato text-sm dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{disposition.name}
									</span>
								</div>
							))
						) : (
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 dark:bg-gray-600"
									style={{ backgroundColor: '#D1D5DB' }}
								></div>
								<span
									className="font-lato text-sm dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No dispositions configured
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modals */}
			<AddDispositionModal
				isOpen={isAddDispositionModalOpen}
				onClose={() => setIsAddDispositionModalOpen(false)}
				dispositionForm={dispositionForm}
				setDispositionForm={setDispositionForm}
				fieldTypeOptions={fieldTypeOptions}
				onSave={handleSaveDisposition}
				onAddDropdownOption={handleAddDropdownOption}
				onDropdownOptionChange={handleDropdownOptionChange}
			/>
			<AddDispositionModal
				isOpen={isEditDispositionModalOpen}
				onClose={() => {
					setIsEditDispositionModalOpen(false);
					setEditingDisposition(null);
				}}
				title="Edit Disposition"
				dispositionForm={dispositionForm}
				setDispositionForm={setDispositionForm}
				fieldTypeOptions={fieldTypeOptions}
				onSave={handleSaveDisposition}
				onAddDropdownOption={handleAddDropdownOption}
				onDropdownOptionChange={handleDropdownOptionChange}
			/>
		</div>
	);
}
