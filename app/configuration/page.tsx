'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GearIcon, TrashIcon } from '@radix-ui/react-icons';
import Pagination from '@/components/ui/Pagination';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetCampaignByCompanyIdForheaderQuery, useDeleteCampaignMutation } from '@/store/services/campaignApi';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import { toast } from 'sonner';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface Campaign {
	_id: string;
	campaignName: string;
	progress?: number;
	status?: string;
	createdAt?: string;
}

export default function ConfigurationPage() {
	const router = useRouter();
	const { user } = useUserInfo();
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('campaignPlan');
	const canCreate = canAccess('campaignPlan', 'create');
	const canEdit = canAccess('campaignPlan', 'edit');

	const { setSelectedCampaignId } = useCampaign();
	const companyId = user?.companyId || user?.company?._id || '';
	const [searchTerm, setSearchTerm] = useState('');
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const { data: campaignData, isLoading } = useGetCampaignByCompanyIdForheaderQuery(
		{ companyId, page: currentPage, limit: itemsPerPage },
		{
			skip: !companyId,
		}
	);

	const [deleteCampaign] = useDeleteCampaignMutation();

	const campaignes = useMemo(() => {
		const data = campaignData as { campaignes?: Campaign[] } | undefined;
		return data?.campaignes || [];
	}, [campaignData]);

	const totalPages = (campaignData as { pagination?: { totalPages?: number } })?.pagination?.totalPages || 1;
	const totalItems = (campaignData as { pagination?: { total?: number } })?.pagination?.total || 0;

	const handleDeleteClick = (id: string, name: string) => {
		setRecordToDelete({ id, name });
		setDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!recordToDelete) return;

		try {
			await deleteCampaign(recordToDelete.id).unwrap();
			toast.success('Campaign deleted successfully');
			setDeleteModalOpen(false);
			setRecordToDelete(null);
		} catch (error) {
			console.error('Failed to delete line of business:', error);
			toast.error('Failed to delete Campaign');
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
					Campaign Plan
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
								setSelectedCampaignId('new');
								localStorage.removeItem('peoplely-setup-data');
								router.push('/setup');
							}}
							className="flex items-center gap-2 px-2 py-2 text-[8px] md:text-[10px] sm:px-4 sm:py-2"
						>
							Campaignes
						</Button>
					)}
				</div>
			</div>

			{/* Campaign Table */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Campaignes"
				/>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead
							className="dark:bg-gray-700 border-b dark:border-gray-700"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<tr>
								<th className="px-4 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Name</th>
								<th className="px-4 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Progress</th>
								<th className="px-4 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Status</th>
								<th className="px-4 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Created At</th>
								<th className="px-4 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Action</th>
							</tr>
						</thead>
						<tbody className="divide-y dark:divide-gray-700">
							{isLoading ? (
								<SVGLoaderFetch colSpan={5} text={''} />
							) : campaignes?.length === 0 ? (
								<NoRecordFound colSpan={5} />
							) : (
								campaignes?.map((lob: Campaign) => (
										<tr
											key={lob._id}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'transparent';
											}}
											className="dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 last:border-0"
											style={{ borderColor: 'var(--light-gray)' }}
										>
										<td className="px-4 py-3">{lob.campaignName}</td>
										<td className="px-4 py-3">
											<ProgressBar progress={typeof lob.progress === 'number' ? lob.progress : 0} />
										</td>
										<td className="px-4 py-3">
											<StatusBadge status={lob.status || 'In Review'} />
										</td>
										<td className="px-4 py-3">
											{lob.createdAt ? new Date(lob.createdAt).toLocaleDateString() : 'N/A'}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												{canEdit && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setSelectedCampaignId(lob._id);
															router.push('/setup');
														}}
														className="p-2 transition-colors h-auto rounded-full"
														title="Configure"
													>
														<GearIcon width={18} height={18} style={{ color: 'var(--text-primary)' }} />
													</Button>
												)}
												{canEdit && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteClick(lob._id, lob.campaignName)}
														className="p-2 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20 group h-auto"
														title="Delete"
													>
														<TrashIcon
															width={18}
															height={18}
															className="text-red-500 group-hover:text-red-600"
														/>
													</Button>
												)}
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			{campaignes.length > 0 && (
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					primaryColor="var(--primary)"
					secondaryColor="var(--primary)"
				/>
			)}

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
