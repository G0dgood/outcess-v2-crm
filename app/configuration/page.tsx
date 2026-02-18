'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GearIcon, TrashIcon } from '@radix-ui/react-icons';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetLineOfBusinessByCompanyIdForheaderQuery, useDeleteLineOfBusinessMutation } from '@/store/services/lineOfBusinessApi';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import { toast } from 'sonner';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePrivilege } from '@/contexts/PrivilegeContext';

export default function ConfigurationPage() {
	const router = useRouter();
	const { user } = useUserInfo();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('lobPlan');
	const canCreate = canAccess('lobPlan', 'create');
	const canEdit = canAccess('lobPlan', 'edit');

	const { setSelectedLineOfBusinessId } = useLineOfBusiness();
	const companyId = user?.companyId || user?.company?._id || '';
	const [searchTerm, setSearchTerm] = useState('');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);

	const { data: lineOfBusinessData, isLoading } = useGetLineOfBusinessByCompanyIdForheaderQuery(
		companyId,
		{
			skip: !companyId,
		}
	);

	const [deleteLineOfBusiness] = useDeleteLineOfBusinessMutation();

	const lineOfBusinesses = useMemo(() => {
		const data = lineOfBusinessData as
			| {
				lineOfBusinesses?: {
					_id: string;
					lineOfBusinessName: string;
					createdAt?: string;
					progress?: number;
					status?: string;
				}[];
			}
			| undefined;

		return data?.lineOfBusinesses || [];
	}, [lineOfBusinessData]);

	const handleDeleteClick = (id: string, name: string) => {
		setRecordToDelete({ id, name });
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!recordToDelete) return;

		try {
			await deleteLineOfBusiness(recordToDelete.id).unwrap();
			toast.success('Line of Business deleted successfully');
			setDeleteModalOpen(false);
			setRecordToDelete(null);
		} catch (error) {
			console.error('Failed to delete line of business:', error);
			toast.error('Failed to delete Line of Business');
		}
	};

	if (!canAccessModule) {
		return null;
	}

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<h1
					className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100 mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					LOB Plan
				</h1>
				<p
					className="text-[10px] md:text-[12px] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Manage your line of businesses and other settings.
				</p>
			</div>

			<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
					{canCreate && (
						<Button
							variant="primary"
							size="md"
							onClick={() => {
								setSelectedLineOfBusinessId('new');
								localStorage.removeItem('peoplely-setup-data');
								router.push('/setup');
							}}
							className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
						>
							Line of Businesses
						</Button>
					)}
				</div>
			</div>
			{/* Line of Business Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>


				<div className="overflow-x-auto">
					<table
					>
						<thead >
							<tr>
								<th>Name</th>
								<th>Progress</th>
								<th>Status</th>
								<th>Created At</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody

						>
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : lineOfBusinesses.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : lineOfBusinesses.map((lob: {
								_id: string;
								lineOfBusinessName: string;
								createdAt?: string;
								progress?: number;
								status?: string;
							}) => (
								<tr
									key={lob._id}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'transparent';
									}}
								>
									<td>
										{lob.lineOfBusinessName}
									</td>
									<td>
										<ProgressBar progress={typeof lob.progress === 'number' ? lob.progress : 0} />
									</td>
									<td>
										<StatusBadge status={lob.status || 'In Review'} />
									</td>
									<td>
										{lob.createdAt ? new Date(lob.createdAt).toLocaleDateString() : 'N/A'}
									</td>
									<td
									>
										<div className="flex items-center gap-2">
											{canEdit && (
												<button
													onClick={() => {
														setSelectedLineOfBusinessId(lob._id);
														router.push('/setup');
													}}
													className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700"
													title="Configure"
												>
													<GearIcon width={18} height={18} style={{ color: 'var(--text-primary)' }} />
												</button>
											)}
											{canEdit && (
												<button
													onClick={() => handleDeleteClick(lob._id, lob.lineOfBusinessName)}
													className="p-2 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20 group"
													title="Delete"
												>
													<TrashIcon
														width={18}
														height={18}
														className="text-red-500 group-hover:text-red-600"
													/>
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

			<DeleteRecordModal
				isOpen={deleteModalOpen}
				recordName={recordToDelete?.name || ''}
				onClose={() => {
					setDeleteModalOpen(false);
					setRecordToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}
