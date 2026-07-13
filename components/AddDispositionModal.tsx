import React from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import Radio from '@/components/ui/Radio';
import Checkbox from '@/components/ui/Checkbox';
import Icon from '@/components/ui/Icon';
import ColorPicker from '@/components/ui/ColorPicker';
import { PlusIcon } from '@radix-ui/react-icons';

import { NestedOption } from '@/types/dashboard';
import { Toggle } from '@/components/ui/Toggle';

interface AddDispositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	dispositionForm: {
		fieldType: string;
		fieldLabel: string;
		dropdownOptions: string[];
		nestedOptions?: NestedOption[];
		sortOrder: string;
		isRequired: boolean;
		color: string;
	};
	setDispositionForm: React.Dispatch<React.SetStateAction<{
		fieldType: string;
		fieldLabel: string;
		dropdownOptions: string[];
		nestedOptions: NestedOption[];
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

	const addNestedOption = (targetParentId: string | null) => {
		const newOption: NestedOption = {
			id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
			value: '',
			subOptions: []
		};

		const addRecursively = (list: NestedOption[]): NestedOption[] => {
			if (!targetParentId) {
				return [...list, newOption];
			}
			return list.map(opt => {
				if (opt.id === targetParentId) {
					return {
						...opt,
						subOptions: [...(opt.subOptions || []), newOption]
					};
				} else if (opt.subOptions && opt.subOptions.length > 0) {
					return {
						...opt,
						subOptions: addRecursively(opt.subOptions)
					};
				}
				return opt;
			});
		};

		setDispositionForm(prev => ({
			...prev,
			nestedOptions: addRecursively(prev.nestedOptions || [])
		}));
	};

	const updateNestedOption = (id: string, value: string) => {
		const updateRecursively = (list: NestedOption[]): NestedOption[] => {
			return list.map(opt => {
				if (opt.id === id) {
					return { ...opt, value };
				} else if (opt.subOptions && opt.subOptions.length > 0) {
					return {
						...opt,
						subOptions: updateRecursively(opt.subOptions)
					};
				}
				return opt;
			});
		};

		setDispositionForm(prev => ({
			...prev,
			nestedOptions: updateRecursively(prev.nestedOptions || [])
		}));
	};

	const updateNestedOptionAutoSelect = (id: string, autoSelect: boolean) => {
		const updateRecursively = (list: NestedOption[]): NestedOption[] => {
			return list.map(opt => {
				if (opt.id === id) {
					return { ...opt, autoSelect };
				} else if (opt.subOptions && opt.subOptions.length > 0) {
					return {
						...opt,
						subOptions: updateRecursively(opt.subOptions)
					};
				}
				return opt;
			});
		};

		setDispositionForm(prev => ({
			...prev,
			nestedOptions: updateRecursively(prev.nestedOptions || [])
		}));
	};

	const updateNestedOptionSubLabel = (id: string, subLabel: string) => {
		const updateRecursively = (list: NestedOption[]): NestedOption[] => {
			return list.map(opt => {
				if (opt.id === id) {
					return { ...opt, subLabel };
				} else if (opt.subOptions && opt.subOptions.length > 0) {
					return {
						...opt,
						subOptions: updateRecursively(opt.subOptions)
					};
				}
				return opt;
			});
		};

		setDispositionForm(prev => ({
			...prev,
			nestedOptions: updateRecursively(prev.nestedOptions || [])
		}));
	};

	const deleteNestedOption = (id: string) => {
		const deleteRecursively = (list: NestedOption[]): NestedOption[] => {
			return list
				.filter(opt => opt.id !== id)
				.map(opt => {
					if (opt.subOptions && opt.subOptions.length > 0) {
						return {
							...opt,
							subOptions: deleteRecursively(opt.subOptions)
						};
					}
					return opt;
				});
		};

		setDispositionForm(prev => ({
			...prev,
			nestedOptions: deleteRecursively(prev.nestedOptions || [])
		}));
	};

	const renderOptionNode = (opt: NestedOption, depth: number = 0) => {
		return (
			<div key={opt.id} className="mt-3" style={{ paddingLeft: depth > 0 ? '1.5rem' : '0', borderLeft: depth > 0 ? '2px dashed var(--light-gray)' : 'none' }}>
				<div className="flex items-center gap-2">
					<Input
						label=""
						placeholder={`Option (Level ${depth + 1})`}
						value={opt.value}
						onChange={(val) => updateNestedOption(opt.id, val)}
						className="flex-1"
					/>
					{depth > 0 && (
						<div className="flex items-center gap-1 shrink-0 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 h-9">
							<Toggle
								checked={!!opt.autoSelect}
								onChange={(checked) => updateNestedOptionAutoSelect(opt.id, checked)}
								size="sm"
							/>
							<span className="text-[10px] font-medium text-gray-500 select-none whitespace-nowrap">Auto-show</span>
						</div>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={() => addNestedOption(opt.id)}
						className="h-9 px-3 py-1 flex items-center gap-1 border-gray-300 hover:bg-gray-50 text-gray-700"
						title="Add sub-option"
					>
						<PlusIcon className="w-3.5 h-3.5" />
						<span className="text-[10px] md:text-[11px]">Sub</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => deleteNestedOption(opt.id)}
						className="dark:text-red-400 dark:hover:text-red-300 p-2 h-auto rounded-full"
						style={{ color: '#DC2626' }}
						title="Remove Option"
					>
						<Icon name="Trash_light" size="sm" />
					</Button>
				</div>
				{opt.subOptions && opt.subOptions.length > 0 && (
					<div className="mt-2 pl-4 max-w-sm">
						<Input
							label=""
							placeholder="Sub-dropdown Label (e.g. Second disposition)"
							value={opt.subLabel || ''}
							onChange={(val) => updateNestedOptionSubLabel(opt.id, val)}
							className="text-[11px]"
						/>
					</div>
				)}
				{opt.subOptions && opt.subOptions.length > 0 && (
					<div className="mt-1">
						{opt.subOptions.map(subOpt => renderOptionNode(subOpt, depth + 1))}
						<div className="mt-2" style={{ paddingLeft: `${(depth + 1) * 1.5}rem` }}>
							<Button
								variant="link"
								size="sm"
								onClick={() => addNestedOption(opt.id)}
								className="dark:text-blue-400 font-inter text-[10px] md:text-[11px] hover:underline flex items-center gap-1 p-0 h-auto"
								style={{ color: '#2563EB' }}
								type="button"
							>
								<PlusIcon className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
								{`Add Option to "${opt.value || 'this level'}"`}
							</Button>
						</div>
					</div>
				)}
			</div>
		);
	};

	const defaultFieldTypeOptions = [
		{ value: 'single-radio', label: 'SingleRadio' },
		{ value: 'radio-group', label: 'RadioGroup' },
		{ value: 'single-checkbox', label: 'Checkbox' },
		{ value: 'multiple-checkbox', label: 'MultipleCheckbox' },
		{ value: 'dropdown', label: 'Dropdown' },
		{ value: 'multi-dropdown', label: 'Multi Dropdown' },
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
				className="dark:bg-gray-800 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-[var(--radius)]"
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
						className="dark:text-gray-500 dark:hover:text-gray-300 p-1 h-auto rounded-full"
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
											className="dark:text-red-400 dark:hover:text-red-300 p-2 h-auto rounded-full"
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

					{dispositionForm.fieldType === 'multi-dropdown' && (
						<div>
							<label
								className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-2 block"
								style={{ color: 'var(--text-primary)' }}
							>
								Cascading Dropdown Structure (Nested Options)
							</label>
							<div className="space-y-3 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-[var(--radius)] bg-gray-50/50 dark:bg-gray-900/10">
								{(dispositionForm.nestedOptions || []).map(opt => renderOptionNode(opt, 0))}
								
								{(!dispositionForm.nestedOptions || dispositionForm.nestedOptions.length === 0) && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => addNestedOption(null)}
										className="w-full flex items-center justify-center gap-1 py-4 border-dashed border-2 hover:bg-gray-100/50 border-gray-300"
										type="button"
									>
										<PlusIcon className="w-4 h-4 text-gray-500" />
										<span className="text-[12px] font-medium text-gray-600">Add Cascading Dropdown Option</span>
									</Button>
								)}

								{dispositionForm.nestedOptions && dispositionForm.nestedOptions.length > 0 && (
									<div className="mt-3">
										<Button
											variant="link"
											size="sm"
											onClick={() => addNestedOption(null)}
											className="dark:text-blue-400 font-inter text-[10px] md:text-[12px] hover:underline flex items-center gap-1 p-0 h-auto"
											style={{ color: '#2563EB' }}
											type="button"
										>
											<PlusIcon className="w-4 h-4" style={{ color: '#2563EB' }} />
											Add Root Option
										</Button>
									</div>
								)}
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
