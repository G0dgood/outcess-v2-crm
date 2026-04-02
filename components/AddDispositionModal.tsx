import React from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import Radio from '@/components/ui/Radio';
import Checkbox from '@/components/ui/Checkbox';
import Icon from '@/components/ui/Icon';
import ColorPicker from '@/components/ui/ColorPicker';
import { PlusIcon } from '@radix-ui/react-icons';

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

	const defaultFieldTypeOptions = [
		{ value: 'single-radio', label: 'SingleRadio' },
		{ value: 'radio-group', label: 'RadioGroup' },
		{ value: 'single-checkbox', label: 'Checkbox' },
		{ value: 'multiple-checkbox', label: 'MultipleCheckbox' },
		{ value: 'dropdown', label: 'Dropdown' },
		{ value: 'number', label: 'Number' },
		{ value: 'phone', label: 'Phone' },
		{ value: 'email', label: 'Email' },
		{ value: 'single-line-text', label: 'Single Line Text' },
		{ value: 'multi-line-text', label: 'Multi Line Text' },
		{ value: 'date', label: 'Date' },
		{ value: 'date-time', label: 'Date & Time' },
	];
	const computedFieldTypeOptions = fieldTypeOptions && fieldTypeOptions.length > 0 ? fieldTypeOptions : defaultFieldTypeOptions;

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
				className="dark:bg-gray-800 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Fixed Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
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
						className="dark:text-gray-500 dark:hover:text-gray-300 p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
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
						options={computedFieldTypeOptions}
					/>

					{/* Field Label */}
					<Input
						label="Field Label"
						placeholder="Enter Disposition Question"
						value={dispositionForm.fieldLabel}
						onChange={(value) => setDispositionForm(prev => ({ ...prev, fieldLabel: value }))}
					/>

					{['dropdown', 'multiple-checkbox', 'radio-group'].includes(dispositionForm.fieldType) && (
						<div>
							<label
								className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
								style={{ color: 'var(--text-primary)' }}
							>
								Options
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
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												const newOptions = dispositionForm.dropdownOptions.filter((_, i) => i !== index);
												setDispositionForm(prev => ({ ...prev, dropdownOptions: newOptions }));
											}}
											className="dark:text-red-400 dark:hover:text-red-300 p-2 h-auto"
											style={{ color: '#DC2626' }}
											onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.currentTarget.style.color = '#B91C1C';
											}}
											onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.currentTarget.style.color = '#DC2626';
											}}
											type="button"
											title="Remove Option"
										>
											<Icon name="Trash_light" size="sm" />
										</Button>
									</div>
								))}
								<Button
									variant="link"
									size="sm"
									onClick={onAddDropdownOption}
									className="dark:text-blue-400 font-inter text-[10px] md:text-[12px] hover:underline flex items-center gap-1 p-0 h-auto"
									style={{ color: '#2563EB' }}
									onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.currentTarget.style.textDecoration = 'underline';
									}}
									onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.currentTarget.style.textDecoration = 'none';
									}}
									title="Add Option"
								>
									<PlusIcon
										className="w-4 h-4"
										style={{ color: '#2563EB' }}
									/>
									Add Option
								</Button>
							</div>
						</div>
					)}

					{/* Sort Order Preference */}
					<div>
						<label
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-3 block"
							style={{ color: 'var(--text-primary)' }}
						>
							Sort order preference
						</label>
						<Radio
							name="sortOrder"
							value={dispositionForm.sortOrder}
							onChange={(value) => setDispositionForm(prev => ({ ...prev, sortOrder: value }))}
							options={[
								{ value: 'entered', label: 'Entered Order' },
								{ value: 'alphabetical', label: 'Alphabetical Order' },
							]}
							className="flex gap-6"
						/>
					</div>

					{/* Required Field */}
					<div className="ml-2">

						<Checkbox
							id="required"
							checked={dispositionForm.isRequired}
							onChange={(checked) => setDispositionForm(prev => ({ ...prev, isRequired: checked }))}
							label="Mark as Required"
							size="medium"
							className="flex  gap-0"
						/>
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
					<Button
						variant="outline"
						size="md"
						onClick={onClose}>Cancel</Button>
					<Button
						variant="primary"
						size="md" onClick={onSave}>Save Disposition</Button>
				</div>
			</div>
		</div>
	);
};

export default AddDispositionModal;
