'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import ColorPicker from '@/components/ui/ColorPicker';
import EmptyState from '@/components/ui/EmptyState';
import { MixIcon } from '@radix-ui/react-icons';

interface Widget {
	id: string;
	title: string;
	value: number;
	color: string;
	callOutcome?: string;
}

interface CallOutcome {
	id: string;
	name: string;
}

interface KPIMetricProps {
	widgets: Widget[];
	onWidgetsChange: (widgets: Widget[]) => void;
	callOutcomes: CallOutcome[];
	onCallOutcomesChange: (callOutcomes: CallOutcome[]) => void;
}

interface WidgetModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	onSave: () => void;
	widgetForm: {
		title: string;
		callOutcome: string;
		color: string;
	};
	setWidgetForm: React.Dispatch<React.SetStateAction<{
		title: string;
		callOutcome: string;
		color: string;
	}>>;
	callOutcomes: CallOutcome[];
}

interface OutcomesModalProps {
	isOpen: boolean;
	onClose: () => void;
	newOutcome: string;
	setNewOutcome: React.Dispatch<React.SetStateAction<string>>;
	callOutcomes: CallOutcome[];
	onAddOutcome: () => void;
	onUpdateOutcome: (id: string, name: string) => void;
	onDeleteOutcome: (id: string) => void;
}

const WidgetModal: React.FC<WidgetModalProps> = ({
	isOpen,
	onClose,
	title,
	onSave,
	widgetForm,
	setWidgetForm,
	callOutcomes
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
				className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{title}
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>
				<div className="p-6 space-y-4">
					<Input
						label="Title"
						placeholder="Enter KPI Title (e.g., Total Calls Made)"
						value={widgetForm.title}
						onChange={(value) => setWidgetForm(prev => ({ ...prev, title: value }))}
						type="text"
					/>
					<Dropdown
						label="Call Outcomes"
						placeholder="Select call outcome"
						value={widgetForm.callOutcome}
						onChange={(value) => setWidgetForm(prev => ({ ...prev, callOutcome: Array.isArray(value) ? value[0] : value }))}
						options={callOutcomes.map(outcome => ({ value: outcome.id, label: outcome.name }))}
					/>
					<ColorPicker
						label="Colour"
						value={widgetForm.color}
						onChange={(color: string) => setWidgetForm(prev => ({ ...prev, color }))}
					/>
				</div>
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
					<Button variant="primary" size="md" onClick={onSave}>Save</Button>
				</div>
			</div>
		</div>
	);
};

const OutcomesModal: React.FC<OutcomesModalProps> = ({
	isOpen,
	onClose,
	newOutcome,
	setNewOutcome,
	callOutcomes,
	onAddOutcome,
	onUpdateOutcome,
	onDeleteOutcome
}) => {
	const [editingId, setEditingId] = useState<string | null>(null);

	if (!isOpen) return null;

	const handleEditClick = (outcome: CallOutcome) => {
		setEditingId(outcome.id);
		setNewOutcome(outcome.name);
	};

	const handleUpdateClick = () => {
		if (editingId && newOutcome.trim()) {
			onUpdateOutcome(editingId, newOutcome.trim());
			setEditingId(null);
			setNewOutcome('');
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setNewOutcome('');
	};

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
				className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Call Outcomes
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>
				<div className="p-6 space-y-4">
					<div className="flex gap-2">
						<Input
							label=""
							placeholder={editingId ? "Update Outcome" : "Add New Outcome"}
							value={newOutcome}
							onChange={setNewOutcome}
							className="h-12.5"
						/>
						{editingId ? (
							<>
								<Button className='' variant="primary" size="md" onClick={handleUpdateClick}>Update</Button>
								<Button className='' variant="outline" size="md" onClick={handleCancelEdit}>Cancel</Button>
							</>
						) : (
							<Button className='' variant="primary" size="md" onClick={onAddOutcome}>Add</Button>
						)}
					</div>

					{/* Empty State */}
					{callOutcomes.length === 0 ? (
						<EmptyState
							icon={MixIcon}
							title="No Call Outcomes Yet"
							description="Add your first call outcome above to get started"
							className="py-10"
						/>
					) : (
						<div className="space-y-2">
							{callOutcomes.map((outcome) => (
								<div key={outcome.id} className="flex items-center justify-between">
									<span
										className="font-lato text-[10px] md:text-[12px] dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{outcome.name}
									</span>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditClick(outcome)}
											className="p-1 h-auto"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											title="Edit Outcome"
										>
											<Icon name="Edit_duotone_line" size="sm" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDeleteOutcome(outcome.id)}
											className="p-1 h-auto"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = '#DC2626';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
											}}
											title="Delete Outcome"
										>
											<Icon name="Trash_light" size="sm" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
				<div
					className="flex justify-end p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose}>Done</Button>
				</div>
			</div>
		</div>
	);
};

export default function KPIMetric({
	widgets,
	onWidgetsChange,
	callOutcomes,
	onCallOutcomesChange
}: KPIMetricProps) {
	const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
	const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
	const [isOutcomesModalOpen, setIsOutcomesModalOpen] = useState(false);
	const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
	const [newOutcome, setNewOutcome] = useState('');
	const [widgetForm, setWidgetForm] = useState({
		title: '',
		callOutcome: '',
		color: '#6C8B7D'
	});

	const handleAddWidget = () => {
		setIsWidgetModalOpen(true);
		setWidgetForm({ title: '', callOutcome: '', color: '#6C8B7D' });
	};

	const handleEditWidget = (widget: Widget) => {
		setEditingWidget(widget);
		setWidgetForm({
			title: widget.title,
			callOutcome: widget.callOutcome || '',
			color: widget.color
		});
		setIsEditWidgetModalOpen(true);
	};

	const handleSaveWidget = () => {
		if (editingWidget) {
			const updatedWidgets = widgets.map(w =>
				w.id === editingWidget.id
					? { ...w, title: widgetForm.title, callOutcome: widgetForm.callOutcome, color: widgetForm.color }
					: w
			);
			onWidgetsChange(updatedWidgets);
			setIsEditWidgetModalOpen(false);
		} else {
			const newWidget: Widget = {
				id: Date.now().toString(),
				title: widgetForm.title,
				value: 0,
				color: widgetForm.color,
				callOutcome: widgetForm.callOutcome
			};
			onWidgetsChange([...widgets, newWidget]);
			setIsWidgetModalOpen(false);
		}
		setEditingWidget(null);
		setWidgetForm({ title: '', callOutcome: '', color: '#6C8B7D' });
	};

	const handleAddOutcome = () => {
		if (newOutcome.trim()) {
			const newCallOutcome: CallOutcome = {
				id: Date.now().toString(),
				name: newOutcome.trim()
			};
			onCallOutcomesChange([...callOutcomes, newCallOutcome]);
			setNewOutcome('');
		}
	};

	const handleDeleteOutcome = (id: string) => {
		const updatedOutcomes = callOutcomes.filter(o => o.id !== id);
		onCallOutcomesChange(updatedOutcomes);
	};

	const handleUpdateOutcome = (id: string, name: string) => {
		const updatedOutcomes = callOutcomes.map(o =>
			o.id === id ? { ...o, name } : o
		);
		onCallOutcomesChange(updatedOutcomes);
	};

	return (
		<div className="space-y-6">
			{/* Action Buttons */}
			<div className="flex justify-end gap-3">
				<Button
					variant="primary"
					size="md"
					onClick={() => setIsOutcomesModalOpen(true)}
				>
					Manage Outcomes
				</Button>
				<Button
					variant="primary"
					size="md"
					onClick={handleAddWidget}
				>
					Add Widget
				</Button>
			</div>

			{/* Widgets Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{widgets.map((widget) => (
					<div
						key={widget.id}
						className="dark:bg-gray-800 border dark:border-gray-700 p-6 relative rounded-[var(--radius)] overflow-hidden"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						{/* Widget Color Accent */}
						<div
							className="absolute top-0 left-0 w-full h-1"
							style={{ backgroundColor: widget.color }}
						/>
						<div className="flex items-center justify-between mb-4">
							<h3
								className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{widget.title}
							</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => handleEditWidget(widget)}
								className="p-1 h-auto"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}}
								title="Edit Widget"
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z" fill="currentColor" />
									<path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" fill="currentColor" />
									<path d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z" fill="currentColor" />
								</svg>
							</Button>
						</div>
						<div
							className="text-3xl font-bold"
							style={{ color: widget.color }}
						>
							{widget.value}
						</div>
					</div>
				))}
			</div>

			{/* Modals */}
			<WidgetModal
				isOpen={isWidgetModalOpen}
				onClose={() => setIsWidgetModalOpen(false)}
				title="Widget"
				onSave={handleSaveWidget}
				widgetForm={widgetForm}
				setWidgetForm={setWidgetForm}
				callOutcomes={callOutcomes}
			/>
			<WidgetModal
				isOpen={isEditWidgetModalOpen}
				onClose={() => setIsEditWidgetModalOpen(false)}
				title="Edit"
				onSave={handleSaveWidget}
				widgetForm={widgetForm}
				setWidgetForm={setWidgetForm}
				callOutcomes={callOutcomes}
			/>
			<OutcomesModal
				isOpen={isOutcomesModalOpen}
				onClose={() => setIsOutcomesModalOpen(false)}
				newOutcome={newOutcome}
				setNewOutcome={setNewOutcome}
				callOutcomes={callOutcomes}
				onAddOutcome={handleAddOutcome}
				onUpdateOutcome={handleUpdateOutcome}
				onDeleteOutcome={handleDeleteOutcome}
			/>
		</div>
	);
}
