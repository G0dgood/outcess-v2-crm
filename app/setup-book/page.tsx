'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import Checkbox from '@/components/ui/Checkbox';
import PageHeading from '@/components/ui/PageHeading';
import { UploadIcon, Pencil1Icon, TrashIcon, PlusIcon } from '@radix-ui/react-icons';
import UploadBaseSetupBook from '@/components/ui/UploadBaseSetupBook';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import SelectedRecordsDrawerContent from './SelectedRecordsDrawerContent';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import SampleCsvDownloader from '@/components/ui/SampleCsvDownloader';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import EditRecordModal from '@/components/ui/EditRecordModal';
import { useGetSetupBookByLineOfBusinessIdQuery, useDeleteSetupBookRecordsMutation, useGetSetupBookBySearchIdQuery, useDeleteManySetupBookRecordsMutation } from '@/store/services/setupBookApi';
import { toast } from 'sonner';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface FieldDefinition {
	id: string;
	name: string;
	type: 'text' | 'phone' | 'email' | 'number' | 'date';
	required: boolean;
}

interface SetupBookRecord {
	id: string;
	[key: string]: string | number | boolean | null; // Dynamic fields based on field definitions
}


interface ApiError {
	data?: {
		message?: string;
	};
}

const SetupBookPage: React.FC = () => {
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('setupBook');
	const canCreate = canAccess('setupBook', 'create');
	const canEdit = canAccess('setupBook', 'edit');
	const canDelete = canAccess('setupBook', 'delete');

	const { lineOfBusinessData } = useLineOfBusiness();
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;
	// Assuming searchId is available in lineOfBusinessData.lineOfBusiness.customerBookSettings or similar
	// Based on user request, we need to make sure searchId is included. 
	// I'll check where searchId might come from. If not in context, I'll assume it needs to be passed or is part of settings.
	// For now, let's assume it's part of the lineOfBusinessData or we need to extract it.
	// Let's look at the console log from line 39: 
	// The user mentioned "searchId". Let's check if it's in lineOfBusinessData.
	const searchId = lineOfBusinessData?.lineOfBusiness?.customerBookSettings?.searchId;

	const setupBookHeaderFields = lineOfBusinessData?.lineOfBusiness?.customerBookSettings?.configuredFields

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [editingRecord, setEditingRecord] = useState<SetupBookRecord | null>(null);
	const [deleteRecord, setDeleteRecord] = useState<{ id: string; name: string } | null>(null);
	const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>(setupBookHeaderFields || []);

	// Determine which query to use based on searchId presence
	// If searchId is available, use useGetSetupBookBySearchIdQuery
	// Otherwise, fallback to useGetSetupBookByLineOfBusinessIdQuery (or keep existing logic)
	// Assuming if searchId exists, we should prioritize it as per user instruction "add getSetupBookBySearchId"

	const { data: recordsBySearchId, isLoading: isFetchingBySearchId } = useGetSetupBookBySearchIdQuery(
		{
			lineOfBusinessId: lobId || '',
			searchId: searchId || '',
			search: searchTerm,
			page: currentPage,
			limit: 10
		},
		{ skip: !searchId || !lobId }
	);

	const { data: recordsByLobId, isLoading: isFetchingByLobId } = useGetSetupBookByLineOfBusinessIdQuery(
		{
			id: lobId,
			search: searchTerm,
			page: currentPage,
			limit: 10
		},
		{ skip: !!searchId || !lobId } // Skip if searchId is present (since we use the other query) or lobId is missing
	);

	const apiRecords = searchId ? recordsBySearchId : recordsByLobId;
	const isLoading = searchId ? isFetchingBySearchId : isFetchingByLobId;

	useEffect(() => {
		if (setupBookHeaderFields) {
			setFieldDefinitions(setupBookHeaderFields);
		}
	}, [setupBookHeaderFields]);

	const [records, setRecords] = useState<SetupBookRecord[]>([]);

	useEffect(() => {
		if (apiRecords?.data) {
			setRecords(apiRecords.data as unknown as SetupBookRecord[]);
		}
	}, [apiRecords]);

	const handleUpload = () => {
		setIsUploadModalOpen(true);
	};

	const handleCreateRecord = () => {
		setIsCreateModalOpen(true);
	};

	const handleUploadComplete = async () => {
		// setIsUploadModalOpen(false);
	};

	const handleEditRecord = (record: SetupBookRecord) => {
		setEditingRecord(record);
	};

	const handleSaveEdit = (updatedData: Record<string, string | number | boolean | null>) => {
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

	const [deleteSetupBookRecords] = useDeleteSetupBookRecordsMutation();
	const [deleteManySetupBookRecords] = useDeleteManySetupBookRecordsMutation();

	const handleDeleteSelected = () => {
		setDeleteRecord({
			id: 'BULK_DELETE',
			name: `${selectedRecords.size} records`
		});
	};

	const handleConfirmDelete = async () => {
		if (deleteRecord?.id === 'BULK_DELETE' && lobId) {
			try {
				await deleteManySetupBookRecords({
					lineOfBusinessId: lobId,
					ids: Array.from(selectedRecords)
				}).unwrap();

				toast.success("Records deleted successfully");

				setSelectedRecords(new Set());
				setIsDrawerOpen(false);
				setDeleteRecord(null);
			} catch (error: unknown) {
				const apiError = error as ApiError;
				toast.error("Failed to delete records", {
					description: apiError?.data?.message || "An error occurred while deleting records"
				});
			}
			return;
		}

		if (deleteRecord && lobId) {
			try {
				await deleteSetupBookRecords({
					lineOfBusinessId: lobId,
					id: deleteRecord.id
				}).unwrap();

				toast.success("Record deleted successfully");

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
			} catch (error: unknown) {
				const apiError = error as ApiError;
				toast.error("Failed to delete record", {
					description: apiError?.data?.message || "An error occurred while deleting the record"
				});
			}
		} else if (!lobId) {
			toast.error("Missing Line of Business ID");
		}
	};

	const filteredRecords = records;

	const totalPages = apiRecords?.pagination?.totalPages || 1;
	const paginatedRecords = records;

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

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
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
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<SampleCsvDownloader
						fields={setupBookHeaderFields || []}
						className="flex items-center gap-2 px-2 py-2  sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
						extraHeaders={['searchId']}
					/>
					{canCreate && (
						<>
							<Button
								size="md"
								onClick={handleCreateRecord}
								variant="outline"
								className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
							>
								<PlusIcon className="w-4 h-4" />
								Create Record
							</Button>
							<Button
								size="md"
								onClick={handleUpload}
								variant="primary"
								className="flex items-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
							>
								<UploadIcon className="w-4 h-4" />
								Upload
							</Button>
						</>
					)}
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
					<table>
						<thead>
							<tr>
								<th>
									<Checkbox
										checked={isAllSelected}
										onChange={handleSelectAll}
										size="medium"
									/>
								</th>
								<th>
									Search ID
								</th>
								{fieldDefinitions?.map((field) => (
									<th key={field?.id}>
										{field?.name}
									</th>
								))}
								<th>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>


							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : filteredRecords.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : paginatedRecords.map((record) => (
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
									<td>
										{record['searchId'] || '-'}
									</td>
									{fieldDefinitions?.map((field) => (
										<td
											key={field.id}
										>
											{record[field.name] || '-'}
										</td>
									))}
									<td>
										<div className="flex items-center gap-2">
											{canEdit && (
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
											)}
											{canDelete && (
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
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			{filteredRecords?.length > 0 && (
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
			<UploadBaseSetupBook
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				showButton={false}
				onUploadComplete={handleUploadComplete}
				searchId={searchId}
			/>

			{/* Create Record Modal */}
			<CreateRecordModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				fieldDefinitions={fieldDefinitions}
				searchId={searchId}
			/>

			{/* Edit Record Modal */}
			<EditRecordModal
				isOpen={!!editingRecord}
				record={editingRecord}
				fieldDefinitions={fieldDefinitions}
				onClose={() => setEditingRecord(null)}
				onSave={(updatedRecord) => {
					handleSaveEdit(updatedRecord);
					setEditingRecord(null);
				}}
			/>

			{/* Delete Record Modal */}
			<DeleteRecordModal
				isOpen={!!deleteRecord}
				recordName={deleteRecord?.name || ''}
				onClose={() => setDeleteRecord(null)}
				onConfirm={handleConfirmDelete}
			/>

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
						onClose={() => setIsDrawerOpen(false)}
						onDeleteSelected={handleDeleteSelected}
						canDelete={canDelete}
					/>
				</div>
			)}
		</div>
	);
};

export default SetupBookPage;