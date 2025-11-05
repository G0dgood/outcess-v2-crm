'use client';

import React from 'react';
import SubPageHeading from './SubPageHeading';
import PageHeading from './PageHeading';

interface FieldType {
	id: string;
	name: string;
	description: string;
}

interface FieldsProps {
	className?: string;
}

const Fields: React.FC<FieldsProps> = ({ className = '' }) => {
	const fieldTypes: FieldType[] = [
		{
			id: 'single-line-text',
			name: 'Single-Line Text',
			description: 'Add a single line of text',
		},
		{
			id: 'email',
			name: 'Email',
			description: 'Stores email addresses',
		},
		{
			id: 'multi-line-text',
			name: 'Multi-Line Text',
			description: 'Add a few lines of text',
		},
		{
			id: 'dropdown',
			name: 'Drop-down',
			description: 'Choose one option in a menu of choices',
		},
		{
			id: 'checkbox',
			name: 'Checkbox',
			description: 'Select Multiple Options from a list of options',
		},
		{
			id: 'number',
			name: 'Number',
			description: 'Enter a string of number',
		},
		{
			id: 'date',
			name: 'Date',
			description: 'Select a date from a calendar',
		},
		{
			id: 'phone',
			name: 'Phone',
			description: 'Stores phone numbers',
		},
		{
			id: 'radio-select',
			name: 'Radio Select',
			description: 'Select one option from a list of menu',
		},
		{
			id: 'date-time',
			name: 'Date/Time',
			description: 'Stores a date and time value',
		},
	];

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header Section */}
			<div className="mb-6">
				<PageHeading
					text="Field Types"
				/>
				<SubPageHeading
					text="Add field types to capture more details about customer interactions. You can arrange these fields in call forms for agents and customers to enhance data collection and improve service quality."
				/>
			</div>

			{/* Field Types Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{fieldTypes.map((fieldType) => (
					<div
						key={fieldType.id}
						className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow cursor-pointer"
					>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{fieldType.name}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">{fieldType.description}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Fields;

