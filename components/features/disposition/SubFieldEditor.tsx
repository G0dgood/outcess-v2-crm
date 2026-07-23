'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { Toggle } from '@/components/ui/Toggle';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import type { DispositionCategory } from '@/types/dashboard';

export const SUB_FIELD_TYPE_OPTIONS = [
	{ value: 'single-line-text', label: 'Single line text' },
	{ value: 'multi-line-text', label: 'Multi line text' },
	{ value: 'dropdown', label: 'Dropdown' },
	{ value: 'radio-group', label: 'Radio' },
	{ value: 'multiple-checkbox', label: 'Checkboxes' },
	{ value: 'checkbox', label: 'Checkbox' },
	{ value: 'number', label: 'Number' },
	{ value: 'date', label: 'Date' },
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Phone' },
];

const CHOICE_TYPES = ['dropdown', 'radio-group', 'radio-select', 'multiple-checkbox'];
export const isChoiceType = (t: string) => CHOICE_TYPES.includes(t);

const uid = () => `dsp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const blankField = (): DispositionCategory => ({
	id: uid(),
	name: '',
	color: '#6B7280',
	fieldType: 'single-line-text',
	dropdownOptions: [],
	isRequired: false,
});

interface SubFieldListProps {
	fields: DispositionCategory[] | undefined;
	onChange: (next: DispositionCategory[]) => void;
	addLabel?: string;
	depth?: number;
}

// A list of sub-fields with add/remove; each item is a recursive FieldNode.
export const SubFieldList: React.FC<SubFieldListProps> = ({ fields, onChange, addLabel = 'Add sub-field', depth = 0 }) => {
	const list = fields || [];
	const add = () => onChange([...list, blankField()]);
	const updateAt = (i: number, f: DispositionCategory) => onChange(list.map((x, idx) => (idx === i ? f : x)));
	const removeAt = (i: number) => onChange(list.filter((_, idx) => idx !== i));

	return (
		<div className="space-y-2">
			{list.map((f, i) => (
				<FieldNode key={f.id} field={f} onChange={(nf) => updateAt(i, nf)} onRemove={() => removeAt(i)} depth={depth} />
			))}
			<button
				type="button"
				onClick={add}
				className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
			>
				<PlusIcon className="w-3.5 h-3.5" />
				{addLabel}
			</button>
		</div>
	);
};

interface FieldNodeProps {
	field: DispositionCategory;
	onChange: (f: DispositionCategory) => void;
	onRemove: () => void;
	depth: number;
}

const FieldNode: React.FC<FieldNodeProps> = ({ field, onChange, onRemove, depth }) => {
	const [open, setOpen] = useState(true);
	const patch = (p: Partial<DispositionCategory>) => onChange({ ...field, ...p });
	const options = field.dropdownOptions || [];
	const choice = isChoiceType(field.fieldType);

	const setOptionValue = (index: number, value: string) => {
		const prevVal = options[index];
		const nextOptions = options.map((o, i) => (i === index ? value : o));
		// Keep any per-option sub-fields attached to the renamed option.
		const optionSubFields = { ...(field.optionSubFields || {}) };
		if (prevVal !== value && optionSubFields[prevVal]) {
			optionSubFields[value] = optionSubFields[prevVal];
			delete optionSubFields[prevVal];
		}
		patch({ dropdownOptions: nextOptions, optionSubFields });
	};

	const addOption = () => patch({ dropdownOptions: [...options, ''] });

	const removeOption = (index: number) => {
		const val = options[index];
		const optionSubFields = { ...(field.optionSubFields || {}) };
		delete optionSubFields[val];
		patch({ dropdownOptions: options.filter((_, i) => i !== index), optionSubFields });
	};

	const setOptionSubs = (optionValue: string, subs: DispositionCategory[]) => {
		patch({ optionSubFields: { ...(field.optionSubFields || {}), [optionValue]: subs } });
	};

	return (
		<div
			className="rounded-[var(--radius)] border p-3 bg-white dark:bg-gray-900/40"
			style={{ borderColor: 'var(--light-gray)', marginLeft: depth > 0 ? 8 : 0 }}
		>
			<div className="flex items-center gap-2">
				<button type="button" onClick={() => setOpen((o) => !o)} className="text-gray-400 hover:text-gray-600 shrink-0">
					{open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
				</button>
				<Input
					label=""
					placeholder="Sub-field label"
					value={field.name}
					onChange={(v) => patch({ name: v })}
					className="flex-1"
				/>
				<div className="w-40 shrink-0">
					<Dropdown
						label=""
						options={SUB_FIELD_TYPE_OPTIONS}
						value={field.fieldType}
						onChange={(v) => patch({ fieldType: (Array.isArray(v) ? v[0] : v) })}
					/>
				</div>
				<button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 shrink-0" title="Remove sub-field">
					<TrashIcon className="w-4 h-4" />
				</button>
			</div>

			{open && (
				<div className="mt-3 space-y-3 pl-6">
					<div className="flex items-center gap-2">
						<Toggle checked={!!field.isRequired} onChange={(c) => patch({ isRequired: c })} size="sm" />
						<span className="text-[11px] text-gray-500">Required</span>
					</div>

					{/* Options (for choice fields) + per-option sub-fields */}
					{choice && (
						<div className="space-y-2">
							<span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Options</span>
							{options.map((opt, i) => (
								<div key={i} className="rounded border p-2" style={{ borderColor: 'var(--light-gray)' }}>
									<div className="flex items-center gap-2">
										<Input label="" placeholder={`Option ${i + 1}`} value={opt} onChange={(v) => setOptionValue(i, v)} className="flex-1" />
										<button type="button" onClick={() => removeOption(i)} className="p-1 text-gray-400 hover:text-red-500 shrink-0" title="Remove option">
											<TrashIcon className="w-4 h-4" />
										</button>
									</div>
									{/* Sub-fields shown when THIS option is selected */}
									{opt.trim() !== '' && (
										<div className="mt-2 pl-3 border-l" style={{ borderColor: 'var(--light-gray)' }}>
											<span className="text-[10px] text-gray-400 block mb-1">Shown when &quot;{opt}&quot; is selected</span>
											<SubFieldList
												fields={field.optionSubFields?.[opt]}
												onChange={(subs) => setOptionSubs(opt, subs)}
												addLabel="Add field to this option"
												depth={depth + 1}
											/>
										</div>
									)}
								</div>
							))}
							<button type="button" onClick={addOption} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
								<PlusIcon className="w-3.5 h-3.5" /> Add option
							</button>
						</div>
					)}

					{/* Sub-fields shown once this field is answered */}
					<div className="pt-1">
						<span className="text-[10px] text-gray-400 block mb-1">Shown after this field is answered</span>
						<SubFieldList
							fields={field.subFields}
							onChange={(subs) => patch({ subFields: subs })}
							addLabel="Add sub-field"
							depth={depth + 1}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default SubFieldList;
