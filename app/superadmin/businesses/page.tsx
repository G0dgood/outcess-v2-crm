'use client';

import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import Search from '@/components/ui/Search';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetAllCompaniesQuery } from '@/store/services/companyApi';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Business {
	id: string;
	companyName: string;
	status: 'Active' | 'Inactive';
	users: number;
	contactPerson: string;
}

interface CompanyResponse {
	_id: string;
	companyName: string;
	status?: string;
	[key: string]: unknown;
}

interface CompaniesData {
	companies?: CompanyResponse[];
	data?: CompanyResponse[];
}

const BusinessesManagementPage: React.FC = () => {
	const router = useRouter();
	const { campaignData } = useCampaign();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	const { data: companiesData, isLoading } = useGetAllCompaniesQuery({ 
		page: currentPage, 
		limit: itemsPerPage,
		search: searchTerm,
		status: statusFilter
	});

	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter]);



	const businesses: Business[] = useMemo(() => {
		if (!companiesData) return [];
		// Handle both array response or object with data property or object with companies property
		const data = companiesData as CompaniesData | CompanyResponse[];
		const list = Array.isArray(data) ? data :
			(Array.isArray((data as CompaniesData).companies) ? (data as CompaniesData).companies :
				((data as CompaniesData).data || []));

		return (list || []).map((company: CompanyResponse) => ({
			id: company._id,
			companyName: company.companyName,
			status: (company.status || "inactive") as 'Active' | 'Inactive', // Default status as not provided in API
			users: 0, // Default user count as not provided in API 
			contactPerson: ''
		}));
	}, [companiesData]);



	const totalPages = companiesData?.pagination?.totalPages || 1;
	const totalItems = companiesData?.pagination?.total || 0;
	const paginatedBusinesses = businesses;

	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
	];


	const handleViewDetail = (id: string) => {
		router.push(`/superadmin/businesses/${id}`);
	};

	return (
		<div  >
			{/* Header Section */}
			<div className="mb-6">
				<h1
					className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100 mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Businesses Management
				</h1>
			</div>

			{/* Search and Filter Section */}
			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<Search
					placeholder="Search businesses..."
					value={searchTerm}
					onChange={setSearchTerm}
					className="w-full sm:w-auto"
					maxWidth="w-full"
					showClearButton={true}
				/>
				<div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3">
					<Dropdown
						label=""
						value={statusFilter}
						onChange={(value) => setStatusFilter(Array.isArray(value) ? value[0] : value)}
						options={statusOptions}
						className="w-full sm:w-[180px]"
						inputClassName="h-8 text-[8px] md:text-[10px] sm:h-10 sm:text-[10px] md:text-[12px]"
					/>
				</div>
			</div>

			{/* Businesses Table */}
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
					label="Businesses"
				/>
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
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Company Name
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Status
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Users
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Action
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
							{isLoading ? (
								<SVGLoaderFetch colSpan={8} text={''} />
							) : paginatedBusinesses?.length === 0 ? (
								<NoRecordFound colSpan={8} />
							) : (
								paginatedBusinesses?.map((business) => (
									<tr
										key={business.id}
										className="dark:hover:bg-gray-700 transition-colors"
										style={{ borderColor: 'var(--light-gray)' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = 'var(--accent-white)';
										}}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{business.companyName}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full ${business.status === 'Active'
													? 'dark:bg-green-900/30 dark:text-green-400'
													: 'dark:bg-red-900/30 dark:text-red-400'
													}`}
												style={business.status === 'Active' ? {
													backgroundColor: 'rgba(34, 197, 94, 0.1)',
													color: '#16A34A'
												} : {
													backgroundColor: 'rgba(220, 38, 38, 0.1)',
													color: '#DC2626'
												}}
											>
												{business.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{business.users}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewDetail(business.id)}
												className="dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
												style={{ color: '#2563EB' }}
											>
												View Detail
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination Section */}
			{totalItems > 0 && (
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
		</div>
	);
};

export default BusinessesManagementPage;
