'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import Checkbox from '@/components/ui/Checkbox';
import PageHeading from '@/components/ui/PageHeading';
import { UploadIcon, Pencil1Icon, TrashIcon, PlusIcon, GridIcon } from '@radix-ui/react-icons';
import UploadBaseSetupBook from '@/components/ui/UploadBaseSetupBook';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import SelectedRecordsDrawerContent from './SelectedRecordsDrawerContent';
import { useCampaign } from '@/contexts/CampaignContext';
import SampleCsvDownloader from '@/components/ui/SampleCsvDownloader';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import EditRecordModal from '@/components/ui/EditRecordModal';
import { useGetSetupBookByCampaignIdQuery, useDeleteSetupBookRecordsMutation, useGetSetupBookBySearchIdQuery, useDeleteManySetupBookRecordsMutation } from '@/store/services/setupBookApi';
import { toast } from 'sonner';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { usePrivilege } from '@/contexts/PrivilegeContext';

import { SelectBucketModal } from '@/components/ui/SelectBucketModal';
import Icon from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';

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
	const router = useRouter();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('setupBook');
	const canCreate = canAccess('setupBook', 'create');
	const canEdit = canAccess('setupBook', 'edit');
	const canDelete = canAccess('setupBook', 'delete');

	const { campaignData } = useCampaign();
	const campaignId = campaignData?.campaign?._id || campaignData?.campaign?.id;

	const allConfiguredFieldsChunks = campaignData?.campaign?.customerBookSettings?.configuredFields || [];
	const buckets = (campaignData?.campaign?.dashboardSettings?.buckets || []) as any[];

	const [selectedBucketId, setSelectedBucketId] = useState<string>('');
	const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);

	// Initialize selectedBucketId with the first bucket if not set
	useEffect(() => {
		if (!selectedBucketId && buckets.length > 0) {
			setSelectedBucketId(buckets[0].id);
		}
	}, [buckets, selectedBucketId]);

	// Find searchId and fields for selected bucket
	const currentBucketConfig = allConfiguredFieldsChunks.find((c: any) => c && c.bucketId === selectedBucketId);
	const searchId = currentBucketConfig?.searchId || (campaignData?.campaign?.customerBookSettings as any)?.searchId || '';
	const setupBookHeaderFields = currentBucketConfig?.fields || [];

	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isDrawerAnimating, setIsDrawerAnimating] = useState(false);
	const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
	const [editingRecord, setEditingRecord] = useState<SetupBookRecord | null>(null);
	const [deleteRecord, setDeleteRecord] = useState<{ id: string; name: string } | null>(null);
	// Memoize field definitions to avoid infinite loops and unstable references
	const fieldDefinitions: FieldDefinition[] = useMemo(() => setupBookHeaderFields, [setupBookHeaderFields]);

	// Determine which query to use based on searchId presence
	// If searchId is available, use useGetSetupBookBySearchIdQuery
	// Otherwise, fallback to useGetSetupBookByCampaignIdQuery
	const { data: recordsBySearchId, isLoading: isFetchingBySearchId } = useGetSetupBookBySearchIdQuery(
		{
			campaignId: campaignId || '',
			searchId: searchId || '',
			search: searchTerm,
			page: currentPage,
			limit: itemsPerPage
		},
		{ skip: !searchId || !campaignId }
	);

	const { data: recordsByLobId, isLoading: isFetchingByLobId } = useGetSetupBookByCampaignIdQuery(
		{
			id: campaignId,
			search: searchTerm,
			page: currentPage,
			limit: itemsPerPage
		},
		{ skip: !!searchId || !campaignId }
	);

	const apiRecords = searchId ? recordsBySearchId : recordsByLobId;
	const isLoading = searchId ? isFetchingBySearchId : isFetchingByLobId;

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
		if (deleteRecord?.id === 'BULK_DELETE' && campaignId) {
			try {
				await deleteManySetupBookRecords({
					campaignId: campaignId,
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

		if (deleteRecord && campaignId) {
			try {
				await deleteSetupBookRecords({
					campaignId: campaignId,
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
		} else if (!campaignId) {
			toast.error("Missing Campaign ID");
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

	const handleNavigateToDashboard = () => {
		router.push('/setup/dashboard');
	};

	return (
		<div>
			<PageHeading
				text="Setup Book"
			/>

			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div className="flex items-center gap-3 w-full sm:w-auto">
					<Search
						placeholder="Search"
						value={searchTerm}
						onChange={setSearchTerm}
						className="flex-1 sm:w-auto"
						maxWidth="w-full sm:max-w-xs"
						onSearch={(value) => console.log('Search triggered:', value)}
						showClearButton={true}
					/>
					<Button
						variant="outline"
						size="md"
						onClick={() => setIsBucketModalOpen(true)}
						className="flex items-center gap-2 whitespace-nowrap"
					>
						<GridIcon className="w-4 h-4" />
						{buckets.find(b => b.id === selectedBucketId)?.name || 'Select Bucket'}
					</Button>
				</div>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<SampleCsvDownloader
						fields={setupBookHeaderFields || []}
						fileName="sample_setup_book.csv"
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
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={apiRecords?.pagination?.total || 0}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Records"
				/>
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
								{fieldDefinitions?.map((field: FieldDefinition, index: number) => (
									<th key={field?.id ? `header-id-${field.id}` : `header-idx-${index}`}>
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
									style={{ borderColor: 'var(--light-gray)' }}
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
									{fieldDefinitions?.map((field: FieldDefinition, index: number) => (
										<td
											key={`${record.id}-${field?.id ? `id-${field.id}` : `idx-${index}`}`}
										>
											{record[field.name] || '-'}
										</td>
									))}
									<td>
										<div className="flex items-center gap-2">
											{canEdit && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEditRecord(record)}
													className="p-2 dark:text-gray-400 text-gray-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer h-auto"
													style={{ color: 'var(--text-secondary)' }}
													onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
														e.currentTarget.style.color = '#2563EB';
														e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
													}}
													onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
														e.currentTarget.style.color = 'var(--text-secondary)';
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
													title="Edit Record"
												>
													<Pencil1Icon className="w-5 h-5" />
												</Button>
											)}
											{canDelete && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteClick(record)}
													className="p-2 dark:text-gray-400 text-gray-400 hover:text-red-800 dark:hover:text-red-300 transition-colors cursor-pointer h-auto"
													style={{ color: 'var(--text-secondary)' }}
													onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
														e.currentTarget.style.color = '#DC2626';
														e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
													}}
													onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
														e.currentTarget.style.color = 'var(--text-secondary)';
														e.currentTarget.style.backgroundColor = 'transparent';
													}}
													title="Delete Record"
												>
													<TrashIcon className="w-5 h-5" />
												</Button>
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
					primaryColor={campaignData?.primaryColor || 'var(--primary)'}
					secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
				/>
			)}

			{/* Select Bucket Modal */}
			<SelectBucketModal
				isOpen={isBucketModalOpen}
				onClose={() => setIsBucketModalOpen(false)}
				buckets={buckets}
				selectedBucketId={selectedBucketId}
				onSelect={(bucketId) => {
					setSelectedBucketId(bucketId);
					setCurrentPage(1);
					setIsBucketModalOpen(false);
				}}
				onNavigateToDashboard={handleNavigateToDashboard}
			/>

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