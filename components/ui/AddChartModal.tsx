'use client';

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import Icon from './Icon';

interface AddChartModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (chartData: {
		title: string;
		type: 'bar' | 'line' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'scatter' | 'bubble';
		dataSource: 'dispositions' | 'callOutcomes' | 'custom';
		timeRange: 'daily' | 'weekly' | 'monthly';
		color?: string;
		position: {
			x: number;
			y: number;
			width: number;
			height: number;
		};
	}) => void;
}

const chartTypeOptions = [
	{ value: 'bar', label: 'Bar Chart' },
	{ value: 'line', label: 'Line Chart' },
	{ value: 'pie', label: 'Pie Chart' },
	{ value: 'doughnut', label: 'Doughnut Chart' },
	{ value: 'polarArea', label: 'Polar Area Chart' },
	{ value: 'radar', label: 'Radar Chart' },
	{ value: 'scatter', label: 'Scatter Chart' },
	{ value: 'bubble', label: 'Bubble Chart' },
];

const dataSourceOptions = [
	{ value: 'dispositions', label: 'Call Dispositions' },
	{ value: 'callOutcomes', label: 'Call Outcomes' },
	{ value: 'custom', label: 'Custom Data' },
];

const timeRangeOptions = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'monthly', label: 'Monthly' },
];

export const AddChartModal: React.FC<AddChartModalProps> = ({
	isOpen,
	onClose,
	onSave,
}) => {
	const [formData, setFormData] = useState({
		title: '',
		type: 'pie' as const,
		dataSource: 'dispositions' as const,
		timeRange: 'daily' as const,
		color: '#050711',
		position: {
			x: 20,
			y: 20,
			width: 400,
			height: 300
		}
	});

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = () => {
		if (formData.title.trim()) {
			onSave(formData);
			setFormData({
				title: '',
				type: 'pie',
				dataSource: 'dispositions',
				timeRange: 'daily',
				color: '#050711',
				position: {
					x: 20,
					y: 20,
					width: 400,
					height: 300
				}
			});
			onClose();
		}
	};

	const handleCancel = () => {
		setFormData({
			title: '',
			type: 'pie',
			dataSource: 'dispositions',
			timeRange: 'daily',
			color: '#050711',
			position: {
				x: 20,
				y: 20,
				width: 400,
				height: 300
			}
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-[#0b0d1293]/50 bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white w-full max-w-md mx-4">
				{/* Modal Header */}
				<div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4 p-6">
					<h2 className="font-inter text-xl font-semibold text-[#050711]">Add New Chart</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="space-y-4 p-6">
					<Input
						label="Chart Title"
						placeholder="Enter chart title"
						value={formData.title}
						onChange={handleInputChange('title')}
						required
					/>

					<Dropdown
						label="Chart Type"
						placeholder="Select chart type"
						options={chartTypeOptions}
						value={formData.type}
						onChange={handleInputChange('type')}
						required
					/>

					<Dropdown
						label="Data Source"
						placeholder="Select data source"
						options={dataSourceOptions}
						value={formData.dataSource}
						onChange={handleInputChange('dataSource')}
						required
					/>

					<Dropdown
						label="Time Range"
						placeholder="Select time range"
						options={timeRangeOptions}
						value={formData.timeRange}
						onChange={handleInputChange('timeRange')}
						required
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Chart Color
						</label>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={formData.color}
								onChange={(e) => handleInputChange('color')(e.target.value)}
								className="w-12 h-10 border border-gray-300   cursor-pointer"
							/>
							<span className="text-sm text-gray-600">{formData.color}</span>
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end gap-3 p-6">
					<Button
						variant="outline"
						size="md"
						onClick={handleCancel}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
						disabled={!formData.title.trim()}
					>
						Add Chart
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AddChartModal;
