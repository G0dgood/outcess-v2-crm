'use client';

import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import Search from '@/components/ui/Search';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { useGetAllCompaniesQuery } from '@/store/services/companyApi';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import PageHeading from '@/components/ui/PageHeading';

interface Business {
	id: string;
	companyName: string;
	status: 'Active' | 'Inactive' | 'Deactivated';
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
	pagination?: {
		total: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
}

const BusinessesManagementPage: React.FC = () => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);

	const { data: companiesData, isLoading, isError, error } = useGetAllCompaniesQuery({
		page: currentPage,
		limit: itemsPerPage,
		search: searchTerm,
		status: statusFilter
	});

	React.useEffect(() => {
		if (isError) {
			console.error('Error fetching companies:', error);
		}
	}, [isError, error]);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, statusFilter]);



	const businesses: Business[] = useMemo(() => {
		if (!companiesData) return [];

		const data = companiesData as CompaniesData;
		const list = Array.isArray(data.companies) ? data.companies :
			(Array.isArray(data.data) ? data.data :
				(Array.isArray(data) ? data : []));

		return list.map((company: CompanyResponse) => {
			const rawStatus = company.status || "Active";
			const status = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()) as 'Active' | 'Inactive' | 'Deactivated';
			return {
				id: company._id,
				companyName: company.companyName,
				status,
				users: (company.userCount as number) || 0,
				contactPerson: ''
			};
		});
	}, [companiesData]);

	const totalPages = (companiesData as CompaniesData)?.pagination?.totalPages || 1;
	const totalItems = (companiesData as CompaniesData)?.pagination?.total || 0;
	const paginatedBusinesses = businesses;

	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'deactivated', label: 'Deactivated' },
	];


	const handleViewDetail = (id: string) => {
		router.push(`/superadmin/businesses/${id}`);
	};

	return (
		<div  >
			{/* Header Section */}
			<PageHeading text="Businesses Management" />

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
						<thead>
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
								<SVGLoaderFetch colSpan={4} text={''} />
							) : paginatedBusinesses?.length === 0 ? (
								<NoRecordFound colSpan={4} />
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
													: business.status === 'Inactive'
														? 'dark:bg-yellow-900/30 dark:text-yellow-400'
														: 'dark:bg-red-900/30 dark:text-red-400'
													}`}
												style={business.status === 'Active' ? {
													backgroundColor: 'rgba(34, 197, 94, 0.1)',
													color: '#16A34A'
												} : business.status === 'Inactive' ? {
													backgroundColor: 'rgba(234, 179, 8, 0.1)',
													color: '#CA8A04'
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
					primaryColor={'#050711'}
					secondaryColor={'#050711'}
				/>
			)}
		</div>
	);
};

export default BusinessesManagementPage;
