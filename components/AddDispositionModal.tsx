import React from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import IndividualRadio from '@/components/ui/IndividualRadio';
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
						className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
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
								className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
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
									className="dark:text-blue-400 font-inter text-[10px] md:text-[12px] hover:underline flex items-center gap-1"
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
							className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-3 block"
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
							className="font-inter text-[10px] md:text-[12px] dark:text-gray-100"
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

export default AddDispositionModal;
