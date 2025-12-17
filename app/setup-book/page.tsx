'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import Checkbox from '@/components/ui/Checkbox';
import { useSetup } from '@/contexts/SetupContext';
import PageHeading from '@/components/ui/PageHeading';
import { UploadIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import Input from '@/components/ui/Input';
import UploadBase from '@/components/ui/UploadBaseEmployee';
import SelectedRecordsDrawerContent from './SelectedRecordsDrawerContent';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

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
	const { lineOfBusinessData } = useLineOfBusiness();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [editingRecord, setEditingRecord] = useState<SetupBookRecord | null>(null);
	const [deleteRecord, setDeleteRecord] = useState<{ id: string; name: string } | null>(null);
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

	const handleUploadComplete = (data: Record<string, string>[]) => {
		console.log('Upload completed with data:', data);
		// Process the uploaded data and update records
		// You can add logic here to add the new records to the state
		setIsUploadModalOpen(false);
	};

	const handleEditRecord = (record: SetupBookRecord) => {
		setEditingRecord(record);
	};

	const handleSaveEdit = (updatedData: Record<string, string | number | boolean>) => {
		if (editingRecord) {
			setRecords(prevRecords =>
				prevRecords.map(record =>
					record.id === editingRecord.id
						? { ...record, ...updatedData }
						: record
				)
			);
			setEditingRecord(null);
		}
	};

	const handleDeleteClick = (record: SetupBookRecord) => {
		// Get the first field value as the name for display
		const firstField = fieldDefinitions[0];
		const recordName = firstField ? String(record[firstField.name] || record.id) : record.id;
		setDeleteRecord({
			id: record.id,
			name: recordName
		});
	};

	const handleConfirmDelete = () => {
		if (deleteRecord) {
			setRecords(prevRecords => prevRecords.filter(record => record.id !== deleteRecord.id));
			// Remove from selected if it was selected
			setSelectedRecords(prev => {
				const newSelected = new Set(prev);
				newSelected.delete(deleteRecord.id);
				if (newSelected.size === 0) {
					setIsDrawerOpen(false);
				}
				return newSelected;
			});
			setDeleteRecord(null);
		}
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

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedRecords(new Set(paginatedRecords.map(record => record.id)));
			setIsDrawerOpen(true);
		} else {
			setSelectedRecords(new Set());
			setIsDrawerOpen(false);
		}
	};

	const handleSelectRecord = (recordId: string, checked: boolean) => {
		const newSelected = new Set(selectedRecords);
		if (checked) {
			newSelected.add(recordId);
			setSelectedRecords(newSelected);
			setIsDrawerOpen(true);
		} else {
			newSelected.delete(recordId);
			setSelectedRecords(newSelected);
			// Close drawer if no items are selected
			if (newSelected.size === 0) {
				setIsDrawerOpen(false);
			}
		}
	};

	const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every(record => selectedRecords.has(record.id));

	// Handle drawer animations
	useEffect(() => {
		if (isDrawerOpen) {
			setShouldRenderDrawer(true);
			// Trigger animation after a tiny delay to ensure DOM is ready
			setTimeout(() => setIsDrawerAnimating(true), 10);
		} else {
			// Start exit animation
			setIsDrawerAnimating(false);
			// Remove from DOM after animation completes (300ms)
			const timer = setTimeout(() => {
				setShouldRenderDrawer(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isDrawerOpen]);

	return (
		<div>
			{/* Title */}
			<PageHeading
				text="Setup Book"
			/>

			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={setSearchTerm}
					className="w-full sm:w-auto"
					maxWidth="w-full"
					onSearch={(value) => console.log('Search triggered:', value)}
					onClear={() => console.log('Search cleared')}
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<Button
						size="md"
						onClick={handleUpload}
						variant="primary"
						className="flex items-center gap-2 px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
					>
						<UploadIcon className="w-4 h-4" />
						Upload
					</Button>
				</div>
			</div>

			{/* Records Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="overflow-x-auto">
					<table
						className="min-w-full divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th>
									<Checkbox
										checked={isAllSelected}
										onChange={handleSelectAll}
										size="medium"
									/>
								</th>
								{fieldDefinitions.map((field) => (
									<th
										key={field.id}
										className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										{field.name}
									</th>
								))}
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody
							className="dark:bg-gray-800 divide-y dark:divide-gray-700"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{filteredRecords.length === 0 ? (
								<tr>
									<td colSpan={fieldDefinitions.length + 2} className="px-6 py-12 text-center">
										<div className="flex flex-col items-center justify-center">
											<div className="mb-4">
												<Icon name="upload-cloud" size="4xl" className="text-gray-300 dark:text-gray-600" />
											</div>
											<h3
												className="text-lg font-medium dark:text-gray-100 mb-2"
												style={{ color: 'var(--text-primary)' }}
											>
												No Data Found
											</h3>
											<p
												className="dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{searchTerm ? 'No records match your search.' : 'Upload your call list to get started.'}
											</p>
										</div>
									</td>
								</tr>
							) : (
								paginatedRecords.map((record) => (
									<tr
										key={record.id}
										className="dark:hover:bg-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<Checkbox
												checked={selectedRecords.has(record.id)}
												onChange={(checked) => handleSelectRecord(record.id, checked)}
												size="medium"
											/>
										</td>
										{fieldDefinitions.map((field) => (
											<td
												key={field.id}
												className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{record[field.name] || '-'}
											</td>
										))}
										<td>
											<div className="flex items-center gap-2">
												<button
													onClick={() => handleEditRecord(record)}
													className="p-2 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
													style={{ color: 'var(--text-secondary)' }}
													onMouseEnter={(e) => {
														e.currentTarget.style.color = '#2563EB';
														e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.color = 'var(--text-secondary)';
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
													title="Edit Record"
												>
													<Pencil1Icon className="w-5 h-5" />
												</button>
												<button
													onClick={() => handleDeleteClick(record)}
													className="p-2 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
													style={{ color: 'var(--text-secondary)' }}
													onMouseEnter={(e) => {
														e.currentTarget.style.color = '#DC2626';
														e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.color = 'var(--text-secondary)';
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
													title="Delete Record"
												>
													<TrashIcon className="w-5 h-5" />
												</button>
											</div>
										</td>
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
					primaryColor={lineOfBusinessData?.primaryColor || '#050711'}
					secondaryColor={lineOfBusinessData?.secondaryColor || '#6C8B7D'}
				/>
			)}

			{/* Upload Modal */}
			<UploadBase
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				showButton={false}
				onUploadComplete={handleUploadComplete}
			/>

			{/* Edit Record Modal */}
			{editingRecord && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => setEditingRecord(null)}
				>
					<div
						className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg"
						style={{ backgroundColor: 'var(--accent-white)' }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div
							className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<h2
								className="font-inter text-xl font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Edit Record
							</h2>
							<button
								onClick={() => setEditingRecord(null)}
								className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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

						{/* Modal Form */}
						<div className="p-6 space-y-4">
							{fieldDefinitions.map((field) => (
								<Input
									key={field.id}
									label={field.name}
									placeholder={`Enter ${field.name}`}
									value={String(editingRecord[field.name] || '')}
									onChange={(value) => {
										setEditingRecord(prev => prev ? { ...prev, [field.name]: value } : null);
									}}
									type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
									required={field.required}
								/>
							))}
						</div>

						{/* Modal Footer */}
						<div
							className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<Button
								variant="outline"
								size="md"
								onClick={() => setEditingRecord(null)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={() => {
									handleSaveEdit(editingRecord);
								}}
							>
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Record Modal */}
			{deleteRecord && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => setDeleteRecord(null)}
				>
					<div
						className="dark:bg-gray-800 w-full max-w-md mx-4 shadow-lg"
						style={{ backgroundColor: 'var(--accent-white)' }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div
							className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<h2
								className="font-inter text-xl font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Delete Record
							</h2>
							<button
								onClick={() => setDeleteRecord(null)}
								className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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

						{/* Modal Content */}
						<div className="p-6">
							<p
								className="text-sm dark:text-gray-300 mb-6"
								style={{ color: 'var(--text-secondary)' }}
							>
								Are you sure you want to delete the record <strong>{deleteRecord.name}</strong>? This action cannot be undone.
							</p>
						</div>

						{/* Modal Footer */}
						<div
							className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
							style={{ borderColor: 'var(--light-gray)' }}
						>
							<Button
								variant="outline"
								size="md"
								onClick={() => setDeleteRecord(null)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleConfirmDelete}
								style={{
									backgroundColor: '#DC2626',
									color: 'white'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = '#B91C1C';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = '#DC2626';
								}}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Selected Records Drawer */}
			{shouldRenderDrawer && (
				<div
					className={`fixed top-0 right-0 h-full w-full max-w-md dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerAnimating ? 'translate-x-0' : 'translate-x-full'}`}
					style={{ backgroundColor: 'var(--accent-white)' }}
				>
					<SelectedRecordsDrawerContent
						selectedRecords={selectedRecords}
						fieldDefinitions={fieldDefinitions}
						records={records}
						onEdit={handleEditRecord}
						onDelete={handleDeleteClick}
						onClose={() => setIsDrawerOpen(false)}
					/>
				</div>
			)}
		</div>
	);
};

export default SetupBookPage;
