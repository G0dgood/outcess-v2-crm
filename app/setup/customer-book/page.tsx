'use client';

import React, { useState } from 'react';
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

interface CustomerField {
	id: string;
	name: string;
	type: string;
	required: boolean;
}

interface FieldType {
	id: string;
	name: string;
	description: string;
}

export default function CustomerBookPage() {
	const { setupData, updateCustomerBookSettings } = useSetup();
	const { customerBookSettings } = setupData;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedFieldType, setSelectedFieldType] = useState<string>('text');

	const availableFieldTypes: FieldType[] = [
		{ id: 'single-line-text', name: 'Single-Line Text', description: 'Add a single line of text' },
		{ id: 'email', name: 'Email', description: 'Stores email addresses' },
		{ id: 'multi-line-text', name: 'Multi-Line Text', description: 'Add a few lines of text' },
		{ id: 'number', name: 'Number', description: 'Enter a string of number' },
		{ id: 'date', name: 'Date', description: 'Select a date from a calendar' },
		{ id: 'phone', name: 'Phone', description: 'Stores phone numbers' },
		{ id: 'date-time', name: 'Date/Time', description: 'Stores a date and time value' },
		{ id: 'dropdown', name: 'Drop-down', description: 'Choose one option in a menu of choices' },
		{ id: 'radio-select', name: 'Radio Select', description: 'Select one option from a list of menu' },
		{ id: 'checkbox', name: 'Checkbox', description: 'Select Multiple Options from a list of options' },
	];

	const handleDeleteField = (fieldId: string) => {
		updateCustomerBookSettings({
			configuredFields: customerBookSettings.configuredFields.filter(field => field.id !== fieldId)
		});
	};

	const handleAddField = (fieldType: FieldType) => {
		setSelectedFieldType(fieldType.id);
		setIsModalOpen(true);
	};

	const handleAddFieldFromModal = (fieldData: { name: string; type: string; required: boolean }) => {
		const newField: CustomerField = {
			id: Date.now().toString(),
			name: fieldData.name,
			type: fieldData.type,
			required: fieldData.required,
		};
		updateCustomerBookSettings({
			configuredFields: [...customerBookSettings.configuredFields, newField]
		});
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
						className="text-xs"
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
						className="text-xs"
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
						className="text-xs"
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
						className="text-xs"
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
						className="text-xs"
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
						className="text-xs"
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
						className="text-xs"
						inputClassName="h-10"
					/>
				);
		}
	};

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1
							className="font-lato not-italic font-semibold text-[20px] sm:text-[24px] leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							Customer Book
						</h1>
						<p
							className="font-lato not-italic font-normal text-[14px] sm:text-[16px] leading-[150%] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							Configure the fields that you&apos;ll use to store customer information. Add custom fields to match your business needs.
						</p>
					</div>
					<Button
						variant="primary"
						size="md"
						onClick={() => setIsModalOpen(true)}
						className="flex items-center gap-2 w-full sm:w-auto justify-center"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
						Add New Field
					</Button>
				</div>
			</div>

			{/* Configured Fields Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 mb-8"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr
								className="border-b dark:border-gray-700"
								style={{
									borderColor: 'var(--light-gray)',
									borderBottom: '1px solid'
								}}
							>
								<th
									className="text-left py-4 px-6 font-inter text-sm font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Field Name
								</th>
								<th
									className="text-left py-4 px-6 font-inter text-sm font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Type
								</th>
								<th
									className="text-left py-4 px-6 font-inter text-sm font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Required
								</th>
								<th
									className="text-left py-4 px-6 font-inter text-sm font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{customerBookSettings.configuredFields.map((field, index) => (
								<tr
									key={field.id}
									className={index !== customerBookSettings.configuredFields.length - 1 ? 'dark:border-gray-700' : ''}
									style={index !== customerBookSettings.configuredFields.length - 1 ? { borderBottom: '1px solid', borderBottomColor: 'var(--light-gray)' } : {}}
								>
									<td
										className="py-4 px-6 font-inter text-sm dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{field.name}
									</td>
									<td
										className="py-4 px-6 font-inter text-sm dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{field.type}
									</td>
									<td className="py-4 px-6">
										{field.required ? (
											<span
												className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium dark:bg-green-900/30 dark:text-green-400"
												style={{
													backgroundColor: 'rgba(34, 197, 94, 0.1)',
													color: '#16A34A'
												}}
											>
												Required
											</span>
										) : (
											<span
												className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-300"
												style={{
													backgroundColor: 'var(--bg-primary)',
													color: 'var(--text-tertiary)'
												}}
											>
												Optional
											</span>
										)}
									</td>
									<td className="py-4 px-6">
										<button
											onClick={() => handleDeleteField(field.id)}
											className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
										>
											<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M2 4H14M5 4V2C5 1.44772 5.44772 1 6 1H10C10.5523 1 11 1.44772 11 2V4M13 4V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V4H13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
												<path d="M6 7V11M10 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
											</svg>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Available Field Types */}
			<div>
				<h3
					className="font-inter text-base font-medium dark:text-gray-100 mb-4"
					style={{ color: 'var(--text-primary)' }}
				>
					Available Field Types
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{availableFieldTypes.map((fieldType) => (
						<div
							key={fieldType.id}
							className="dark:bg-gray-800 border dark:border-gray-700 p-4 cursor-pointer dark:hover:border-gray-600 dark:hover:bg-gray-700 transition-colors"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = '#94A3B8';
								e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = 'var(--light-gray)';
								e.currentTarget.style.backgroundColor = 'var(--accent-white)';
							}}
							onClick={() => handleAddField(fieldType)}
						>
							<h4
								className="font-inter text-sm font-medium dark:text-gray-100 mb-2"
								style={{ color: 'var(--text-primary)' }}
							>
								{fieldType.name}
							</h4>
							<p
								className="font-lato text-xs dark:text-gray-400 mb-3"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{fieldType.description}
							</p>
							<div
								className="dark:bg-gray-700 border dark:border-gray-600 p-2"
								style={{
									backgroundColor: 'var(--bg-primary)',
									borderColor: 'var(--light-gray)'
								}}
								onClick={(e) => e.stopPropagation()}
							>
								{renderFieldPreview(fieldType)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Field Properties Modal */}
			<FieldPropertiesModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onAddField={handleAddFieldFromModal}
				fieldType={selectedFieldType}
			/>
		</div>
	);
}
