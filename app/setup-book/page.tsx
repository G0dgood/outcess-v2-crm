'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import { useSetup } from '@/contexts/SetupContext';

interface FieldDefinition {
	id: string;
	name: string;
	type: 'text' | 'phone' | 'email' | 'number' | 'date';
	required: boolean;
}

const SetupBookPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([
		{ id: '1', name: 'Name', type: 'text', required: true },
		{ id: '2', name: 'Phone', type: 'phone', required: true },
		{ id: '3', name: 'Email', type: 'email', required: false },
	]);
	const [totalCustomers, setTotalCustomers] = useState(0);

	const handleUpload = () => {
		console.log('Upload clicked');
		// Implement file upload logic
		// This could open a file picker or drag-and-drop area
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

	return (
		<div>
			{/* Title and Upload Button */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-lato font-medium text-[16px] leading-[150%] text-[#3A4050]">Setup Book</h1>
				<Button
					variant="outline"
					size="md"
					onClick={handleUpload}
					className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 flex items-center gap-2"
				>
					<Icon name="upload-cloud" size="sm" />
					Upload
				</Button>
			</div>

			{/* Description */}
			<div className="mb-6">
				<p className="font-lato font-normal text-[14px] leading-[150%] text-[#6D7280]">
					Upload and manage your call lists here. Prepare your agent's calling base for efficient outreach.
				</p>
			</div>

			{/* Search Bar */}
			<div className="mb-6">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="max-w-md"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
			</div>

			{/* Field Definitions Section */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				{/* Field Headers */}
				<div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-6">
							{fieldDefinitions.map((field) => (
								<div key={field.id} className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-700">{field.name}</span>
									<div className="flex items-center gap-1">
										<button
											onClick={() => handleFieldEdit(field.id)}
											className="text-gray-400 hover:text-gray-600 transition-colors"
											title="Edit field"
										>
											<Icon name="Edit_duotone_line" size="sm" />
										</button>
										<button
											onClick={() => handleFieldDelete(field.id)}
											className="text-gray-400 hover:text-red-600 transition-colors"
											title="Delete field"
										>
											<Icon name="Trash_light" size="sm" />
										</button>
									</div>
								</div>
							))}
						</div>
						<button
							onClick={handleAddField}
							className="text-blue-600 hover:text-blue-800 font-medium text-sm"
						>
							Add Field
						</button>
					</div>
				</div>

				{/* Content Area */}
				<div className="p-6 min-h-[400px]">
					{totalCustomers === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<div className="mb-4">
								<Icon name="upload-cloud" size="4xl" className="text-gray-300" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No Data Uploaded Yet
							</h3>
							<p className="text-gray-500 mb-4">
								Upload your call list to get started with your outreach campaigns.
							</p>
							<Button
								variant="outline"
								size="md"
								onClick={handleUpload}
								className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 flex items-center gap-2"
							>
								<Icon name="upload-cloud" size="sm" />
								Upload Your First File
							</Button>
						</div>
					) : (
						<div className="text-center text-gray-500">
							<p>Your uploaded data will appear here</p>
						</div>
					)}
				</div>
			</div>

			{/* Footer */}
			<div className="mt-6 flex justify-end">
				<div className="text-sm text-gray-500">
					Total Customers: <span className="font-medium">{totalCustomers}</span>
				</div>
			</div>
		</div>
	);
};

export default SetupBookPage;
