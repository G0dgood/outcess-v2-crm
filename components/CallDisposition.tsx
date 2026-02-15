'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import AddDispositionModal from './AddDispositionModal';
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
import type { ChartData, ChartOptions, ChartTypeRegistry } from 'chart.js';
type ChartComponentType = React.ComponentType<{
	data: ChartData<keyof ChartTypeRegistry>;
	options: ChartOptions<keyof ChartTypeRegistry>;
}>;

interface DispositionCategory {
	id: string;
	name: string;
	color: string;
	fieldType: string;
	dropdownOptions?: string[];
	sortOrder?: string;
	isRequired?: boolean;
}

interface CallDispositionProps {
	dispositions: DispositionCategory[];
	onDispositionsChange: (dispositions: DispositionCategory[]) => void;
}

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
	const [isChartReady, setIsChartReady] = useState(false);
	const [ChartComp, setChartComp] = useState<ChartComponentType | null>(null);

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

	// Generate chart data from call outcomes
	const isLineOrRadar = ['line', 'radar'].includes(dispositionSettings.chartType || 'pie');

	const chartData = {
		labels: dispositions.length > 0 ? dispositions?.map(d => d.name) : ['No dispositions configured'],
		datasets: [
			{
				label: 'Count',
				data: dispositions.length > 0 ? dispositions?.map(() => Math.floor(Math.random() * 100) + 10) : [0],
				backgroundColor: dispositions.length > 0 ? dispositions?.map(d => d.color) : ['#E5E7EB'],
				borderColor: dispositions.length > 0 ? dispositions?.map(d => d.color) : ['#E5E7EB'],
				borderWidth: isLineOrRadar ? 2 : 0,
			},
		],
	};

	const renderChart = () => {
		if (!isChartReady) {
			return <div className="h-64 flex items-center justify-center text-sm">Preparing chart...</div>;
		}
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
						className="font-lato text-[10px] md:text-[12px] dark:text-gray-400"
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

		switch (dispositionSettings.chartType) {
			default:
				if (!ChartComp) {
					return <div className="h-full flex items-center justify-center text-sm">Loading chart...</div>;
				}
				return <ChartComp data={chartData} options={commonOptions} />;
		}
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
				fieldType: disposition.fieldType || 'dropdown',
				fieldLabel: disposition.name,
				dropdownOptions: disposition.dropdownOptions || [''],
				sortOrder: disposition.sortOrder || 'entered',
				isRequired: disposition.isRequired || false,
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
				color: dispositionForm.color,
				fieldType: dispositionForm.fieldType,
				dropdownOptions: dispositionForm.dropdownOptions,
				sortOrder: dispositionForm.sortOrder,
				isRequired: dispositionForm.isRequired
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
				color: dispositionForm.color,
				fieldType: dispositionForm.fieldType,
				dropdownOptions: dispositionForm.dropdownOptions,
				sortOrder: dispositionForm.sortOrder,
				isRequired: dispositionForm.isRequired
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
							className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
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
									className="font-lato text-[10px] md:text-[12px] dark:text-gray-100"
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
							className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							review
						</h2>
						<Dropdown
							label=""
							value={dispositionSettings.chartType || 'pie'}
							onChange={(value) => updateDashboardSettings({
								dispositionSettings: {
									...dispositionSettings,
									chartType: value as 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble'
								}
							})}
							options={chartTypeOptions}
							className="min-w-[150px]"
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
							dispositions.map((disposition) => (
								<div key={disposition.id} className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-sm"
										style={{ backgroundColor: disposition?.color }}
									></div>
									<span
										className="font-lato text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{disposition?.name}
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
									className="font-lato text-[10px] md:text-[12px] dark:text-gray-400"
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
