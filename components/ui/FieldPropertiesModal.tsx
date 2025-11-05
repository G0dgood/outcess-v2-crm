'use client';

import React, { useState, useEffect } from 'react';
import Input from './Input';
import Dropdown from './Dropdown';
import Button from './Button';
import Modal from './Modal';
import Toggle from './Toggle';

interface FieldPropertiesModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddField: (fieldData: FieldData) => void;
	fieldType?: string;
}

interface FieldData {
	name: string;
	type: string;
	required: boolean;
}

const fieldTypeOptions = [
	{ value: 'text', label: 'Text Field' },
	{ value: 'email', label: 'Email Field' },
	{ value: 'phone', label: 'Phone Field' },
	{ value: 'number', label: 'Number Field' },
	{ value: 'date', label: 'Date Field' },
	{ value: 'textarea', label: 'Multi-Line Text' },
	{ value: 'dropdown', label: 'Drop-down' },
	{ value: 'radio', label: 'Radio Select' },
	{ value: 'checkbox', label: 'Checkbox' },
];

export const FieldPropertiesModal: React.FC<FieldPropertiesModalProps> = ({
	isOpen,
	onClose,
	onAddField,
	fieldType = 'text'
}) => {
	const [fieldName, setFieldName] = useState('');
	const [selectedType, setSelectedType] = useState(fieldType);
	const [isRequired, setIsRequired] = useState(false);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setFieldName('');
			setSelectedType(fieldType);
			setIsRequired(false);
		}
	}, [isOpen, fieldType]);

	const handleSubmit = () => {
		if (!fieldName.trim()) return;

		const fieldData: FieldData = {
			name: fieldName.trim(),
			type: selectedType,
			required: isRequired,
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
			case 'textarea': return 'Enter text...';
			case 'dropdown': return 'Select option';
			case 'radio': return 'Select option';
			case 'checkbox': return 'Select options';
			default: return 'Enter text';
		}
	};

	const renderPreview = () => {
		const label = fieldName || 'Field Name';
		const placeholder = getPlaceholderText();

		switch (selectedType) {
			case 'textarea':
				return (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
						<textarea
							placeholder={placeholder}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500"
							rows={3}
							disabled
						/>
					</div>
				);
			case 'dropdown':
				return (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
						<select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-300" disabled>
							<option>{placeholder}</option>
						</select>
					</div>
				);
			case 'radio':
				return (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
						<div className="space-y-2">
							<label className="flex items-center">
								<input type="radio" name="preview" className="mr-2" disabled />
								<span className="text-sm text-gray-500 dark:text-gray-400">Option 1</span>
							</label>
							<label className="flex items-center">
								<input type="radio" name="preview" className="mr-2" disabled />
								<span className="text-sm text-gray-500 dark:text-gray-400">Option 2</span>
							</label>
						</div>
					</div>
				);
			case 'checkbox':
				return (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
						<div className="space-y-2">
							<label className="flex items-center">
								<input type="checkbox" className="mr-2" disabled />
								<span className="text-sm text-gray-500 dark:text-gray-400">Option 1</span>
							</label>
							<label className="flex items-center">
								<input type="checkbox" className="mr-2" disabled />
								<span className="text-sm text-gray-500 dark:text-gray-400">Option 2</span>
							</label>
						</div>
					</div>
				);
			default:
				return (
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
						<input
							type={selectedType === 'email' ? 'email' : selectedType === 'number' ? 'number' : 'text'}
							placeholder={placeholder}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500"
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
			title="Field Properties"
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
							onChange={setSelectedType}
							options={fieldTypeOptions}
							placeholder="Select field type"
						/>
					</div>

					{/* Required Field */}
					<div>
						<label className="font-inter text-sm font-medium text-[#050711] dark:text-gray-100 mb-2 block">Required Field</label>
						<Toggle
							checked={isRequired}
							onChange={setIsRequired}
							label={isRequired ? 'Required' : 'Optional'}
						/>
					</div>

					{/* Preview */}
					<div>
						<label className="font-inter text-sm font-medium text-[#050711] dark:text-gray-100 mb-2 block">Preview</label>
						<div className="p-4 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600">
							{renderPreview()}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-200 dark:border-gray-700">
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
		</Modal>
	);
};

export default FieldPropertiesModal;
