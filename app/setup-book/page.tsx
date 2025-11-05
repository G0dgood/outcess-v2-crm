'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';
import { UploadIcon } from '@radix-ui/react-icons';
import UploadBase from '@/components/ui/UploadBaseEmployee';

interface FieldDefinition {
	id: string;
	name: string;
	type: 'text' | 'phone' | 'email' | 'number' | 'date';
	required: boolean;
}

interface SetupBookRecord {
	id: string;
	[key: string]: string | number | boolean; // Dynamic fields based on field definitions
}

const SetupBookPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([
		{ id: '1', name: 'Name', type: 'text', required: true },
		{ id: '2', name: 'Phone', type: 'phone', required: true },
		{ id: '3', name: 'Email', type: 'email', required: false },
	]);
	const [records, setRecords] = useState<SetupBookRecord[]>([
		{ id: '1', Name: 'John Doe', Phone: '08012345678', Email: 'john.doe@example.com' },
		{ id: '2', Name: 'Jane Smith', Phone: '08087654321', Email: 'jane.smith@example.com' },
		{ id: '3', Name: 'Bob Johnson', Phone: '08011223344', Email: 'bob.johnson@example.com' },
		{ id: '4', Name: 'Alice Williams', Phone: '08055667788', Email: 'alice.williams@example.com' },
		{ id: '5', Name: 'Charlie Brown', Phone: '08099887766', Email: 'charlie.brown@example.com' },
		{ id: '6', Name: 'David Miller', Phone: '08044332211', Email: 'david.miller@example.com' },
	]);

	const handleUpload = () => {
		setIsUploadModalOpen(true);
	};

	const handleUploadComplete = (data: any[]) => {
		console.log('Upload completed with data:', data);
		// Process the uploaded data and update records
		// You can add logic here to add the new records to the state
		setIsUploadModalOpen(false);
	};

	const handleAddField = () => {
		console.log('Add Field clicked');
		// Implement add field logic
		const newField: FieldDefinition = {
			id: Date.now().toString(),
			name: `Field ${fieldDefinitions.length + 1}`,
			type: 'text',
			required: false,
		};
		setFieldDefinitions([...fieldDefinitions, newField]);
	};

	const handleFieldEdit = (fieldId: string) => {
		console.log('Edit field:', fieldId);
		// Implement field editing logic
	};

	const handleFieldDelete = (fieldId: string) => {
		console.log('Delete field:', fieldId);
		setFieldDefinitions(fieldDefinitions.filter(field => field.id !== fieldId));
	};

	const filteredRecords = records.filter(record => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return fieldDefinitions.some(field => {
			const value = record[field.name];
			return value && String(value).toLowerCase().includes(searchLower);
		});
	});

	const totalPages = Math.ceil(filteredRecords.length / 10);
	const startIndex = (currentPage - 1) * 10;
	const paginatedRecords = filteredRecords.slice(startIndex, startIndex + 10);

	return (
		<div>
			{/* Title */}
			<PageHeading
				text="Setup Book"
			/>

			{/* Search Bar */}
			<div className="my-6 flex items-center justify-between">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="max-w-md"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<Button
					size="md"
					onClick={handleUpload}
					variant="primary"
					className="flex items-center gap-2"
				>
					<UploadIcon className="w-4 h-4" />
					Upload
				</Button>
			</div>

			{/* Records Table */}
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								{fieldDefinitions.map((field) => (
									<th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
										{field.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{filteredRecords.length === 0 ? (
								<tr>
									<td colSpan={fieldDefinitions.length} className="px-6 py-12 text-center">
										<div className="flex flex-col items-center justify-center">
											<div className="mb-4">
												<Icon name="upload-cloud" size="4xl" className="text-gray-300 dark:text-gray-600" />
											</div>
											<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
												No Data Found
											</h3>
											<p className="text-gray-500 dark:text-gray-400">
												{searchTerm ? 'No records match your search.' : 'Upload your call list to get started.'}
											</p>
										</div>
									</td>
								</tr>
							) : (
								paginatedRecords.map((record) => (
									<tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
										{fieldDefinitions.map((field) => (
											<td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
												{record[field.name] || '-'}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{filteredRecords.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={setupData.primaryColor}
					secondaryColor={setupData.secondaryColor}
				/>
			)}

			{/* Upload Modal */}
			<UploadBase
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				showButton={false}
				onUploadComplete={handleUploadComplete}
			/>
		</div>
	);
};

export default SetupBookPage;

