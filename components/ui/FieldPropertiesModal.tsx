'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Input from './Input';
import Dropdown from './Dropdown';
import Button from './Button';
import Modal from './Modal';
import Toggle from './Toggle';
import { icons, HelpCircle } from 'lucide-react';

interface FieldPropertiesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddField: (fieldData: FieldData) => void;
	fieldType?: string;
	initialData?: FieldData | null;
}

interface FieldData {
	name: string;
	type: string;
	required: boolean;
	icon?: string;
	showTotal?: boolean;
}

const fieldTypeOptions = [
	{ value: 'single-line-text', label: 'Single-Line Text' },
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Phone' },
	{ value: 'number', label: 'Number' },
	{ value: 'date', label: 'Date' },
	{ value: 'date-time', label: 'Date/Time' },
	{ value: 'multi-line-text', label: 'Multi-Line Text' },
	{ value: 'dropdown', label: 'Drop-down' },
	{ value: 'radio-select', label: 'Radio Select' },
	{ value: 'checkbox', label: 'Checkbox' },
];

const LucideIcon = ({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) => {
	const IconComponent = (icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name] || HelpCircle;
	return <IconComponent size={size} className={className} />;
};

interface IconPickerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (iconName: string) => void;
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelect }) => {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredIcons = useMemo(() => {
		if (!isOpen) return [];
		try {
			const iconsList = Object.keys(icons || {}).sort();
			return iconsList.filter(name =>
				name.toLowerCase().includes(searchQuery.toLowerCase())
			);
		} catch (e) {
			console.error(e);
			return [];
		}
	}, [searchQuery, isOpen]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Select Field Icon"
			size="sm"
		>
			<div className="p-6 flex flex-col max-h-[60vh]">
				<input
					type="text"
					placeholder="Search icons..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="w-full px-3 py-2 border dark:border-gray-600 rounded text-[11px] md:text-[12px] dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 mb-4"
					style={{
						borderColor: 'var(--light-gray)',
						backgroundColor: 'var(--accent-white)',
						color: 'var(--text-primary)'
					}}
				/>
				<div className="grid grid-cols-5 gap-3 overflow-y-auto pr-1">
					{filteredIcons.map(name => (
						<button
							key={name}
							onClick={() => {
								onSelect(name);
								onClose();
							}}
							className="p-2.5 rounded border border-gray-100 hover:border-blue-500 hover:bg-blue-50/20 dark:border-gray-700 dark:hover:border-blue-500 flex flex-col items-center gap-1.5 transition-colors group"
							title={name}
							type="button"
						>
							<div className="text-gray-500 group-hover:text-blue-500 dark:text-gray-400">
								<LucideIcon name={name} size={18} />
							</div>
							<span className="text-[8px] text-gray-400 truncate w-full text-center">{name}</span>
						</button>
					))}
				</div>
			</div>
		</Modal>
	);
};

export const FieldPropertiesModal: React.FC<FieldPropertiesModalProps> = ({
	isOpen,
	onClose,
	onAddField,
	fieldType = 'single-line-text',
	initialData = null
}) => {
	const [fieldName, setFieldName] = useState('');
	const [selectedType, setSelectedType] = useState(fieldType);
	const [isRequired, setIsRequired] = useState(false);
	const [selectedIcon, setSelectedIcon] = useState('');
	const [showTotal, setShowTotal] = useState(false);
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			if (initialData) {
				setFieldName(initialData.name);
				setSelectedType(initialData.type);
				setIsRequired(initialData.required);
				setSelectedIcon(initialData.icon || '');
				setShowTotal(!!initialData.showTotal);
			} else {
				setFieldName('');
				setSelectedType(fieldType);
				setIsRequired(false);
				setSelectedIcon('');
				setShowTotal(false);
			}
		}
	}, [isOpen, fieldType, initialData]);

	const handleSubmit = () => {
		if (!fieldName.trim()) return;

		const fieldData: FieldData = {
			name: fieldName.trim(),
			type: selectedType,
			required: isRequired,
			icon: selectedIcon || undefined,
			showTotal
		};

		onAddField(fieldData);
		onClose();
	};

	const getPlaceholderText = () => {
		switch (selectedType) {
			case 'email': return 'Enter email address';
			case 'phone': return 'Enter phone number';
			case 'number': return 'Enter number';
			case 'date': return 'Select date';
			case 'date-time': return 'Select date & time';
			case 'multi-line-text': return 'Enter text...';
			case 'dropdown': return 'Select option';
			case 'radio-select': return 'Select option';
			case 'checkbox': return 'Select options';
			default: return 'Enter text';
		}
	};

	const renderPreview = () => {
		const label = fieldName || 'Field Name';
		const placeholder = getPlaceholderText();

		switch (selectedType) {
			case 'multi-line-text':
				return (
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-1"
							style={{ color: 'var(--text-secondary)' }}
						>
							{label}
						</label>
						<textarea
							placeholder={placeholder}
							className="w-full px-3 py-2 dark:border-gray-600 rounded text-[10px] md:text-[12px] dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500"
							style={{
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)',
								color: 'var(--text-primary)'
							}}
							rows={3}
							disabled
						/>
					</div>
				);
			case 'dropdown':
				return (
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-1"
							style={{ color: 'var(--text-secondary)' }}
						>
							{label}
						</label>
						<select
							className="w-full px-3 py-2 dark:border-gray-600 rounded text-[10px] md:text-[12px] dark:bg-gray-700 dark:text-gray-300"
							style={{
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)',
								color: 'var(--text-primary)'
							}}
							disabled
						>
							<option>{placeholder}</option>
						</select>
					</div>
				);
			case 'radio-select':
				return (
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-1"
							style={{ color: 'var(--text-secondary)' }}
						>
							{label}
						</label>
						<div className="space-y-2">
							<label className="flex items-center">
								<input type="radio" name="preview" className="mr-2" disabled />
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Option 1
								</span>
							</label>
							<label className="flex items-center">
								<input type="radio" name="preview" className="mr-2" disabled />
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Option 2
								</span>
							</label>
						</div>
					</div>
				);
			case 'checkbox':
				return (
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-1"
							style={{ color: 'var(--text-secondary)' }}
						>
							{label}
						</label>
						<div className="space-y-2">
							<label className="flex items-center">
								<input type="checkbox" className="mr-2" disabled />
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Option 1
								</span>
							</label>
							<label className="flex items-center">
								<input type="checkbox" className="mr-2" disabled />
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Option 2
								</span>
							</label>
						</div>
					</div>
				);
			default:
				return (
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium dark:text-gray-300 mb-1"
							style={{ color: 'var(--text-secondary)' }}
						>
							{label}
						</label>
						<input
							type={selectedType === 'email' ? 'email' : selectedType === 'number' ? 'number' : 'text'}
							placeholder={placeholder}
							className="w-full px-3 py-2 dark:border-gray-600 rounded text-[10px] md:text-[12px] dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500"
							style={{
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)',
								color: 'var(--text-primary)'
							}}
							disabled
						/>
					</div>
				);
		}
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={initialData ? 'Edit Field' : `${fieldTypeOptions.find(o => o.value === selectedType)?.label || 'Field'} Properties`}
			size="sm"
			position="right"
		>
			<div className="flex flex-col h-full">
				{/* Content */}
				<div className="flex-1 p-6 space-y-6 overflow-y-auto">
					{/* Field Name */}
					<div>
						<Input
							label="Field Name"
							value={fieldName}
							onChange={setFieldName}
							placeholder="Enter field name"
						/>
					</div>

					{/* Field Type */}
					<div>
						<Dropdown
							label="Field Type"
							value={selectedType}
							onChange={(value) => setSelectedType(Array.isArray(value) ? value[0] : value)}
							options={fieldTypeOptions}
							placeholder="Select field type"
						/>
					</div>

					{/* Field Icon */}
					<div>
						<label
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Field Icon
						</label>
						<div className="flex items-center gap-3">
							<div
								className="w-10 h-10 border dark:border-gray-600 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
								style={{ borderColor: 'var(--light-gray)' }}
							>
								{selectedIcon ? (
									<LucideIcon name={selectedIcon} size={20} />
								) : (
									<HelpCircle size={20} className="opacity-40" />
								)}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsIconPickerOpen(true)}
								type="button"
							>
								{selectedIcon ? 'Change Icon' : 'Select Icon'}
							</Button>
							{selectedIcon && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedIcon('')}
									className="text-red-500 hover:text-red-600 !p-1 h-auto"
									type="button"
								>
									Remove
								</Button>
							)}
						</div>
					</div>

					{/* Required Field */}
					<div>
						<label
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Required Field
						</label>
						<Toggle
							checked={isRequired}
							onChange={setIsRequired}
							label={isRequired ? 'Required' : 'Optional'}
						/>
					</div>

					{/* Sum column total in Customer Book */}
					<div>
						<label
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Show column total (₦)
						</label>
						<Toggle
							checked={showTotal}
							onChange={setShowTotal}
							label={showTotal ? 'Total shown' : 'No total'}
						/>
						<p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
							Sums this column in the Customer Book and shows the total (₦) at the bottom.
						</p>
					</div>

					{/* Preview */}
					<div>
						<label
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Preview
						</label>
						<div
							className="p-4 dark:bg-gray-700 border dark:border-gray-600"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{renderPreview()}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div
					className="p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="primary"
						size="md"
						onClick={handleSubmit}
						disabled={!fieldName.trim()}
						className="w-full"
					>
						Add Field
					</Button>
				</div>
			</div>
			<IconPickerModal
				isOpen={isIconPickerOpen}
				onClose={() => setIsIconPickerOpen(false)}
				onSelect={setSelectedIcon}
			/>
		</Modal>
	);
};

export default FieldPropertiesModal;
