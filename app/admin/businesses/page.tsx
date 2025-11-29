'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Search from '@/components/ui/Search';
import Dropdown from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import { useSetup } from '@/contexts/SetupContext';

interface Business {
	id: string;
	companyName: string;
	status: 'Active' | 'Inactive';
	users: number;
	contactPerson: string;
}

const BusinessesManagementPage: React.FC = () => {
	const router = useRouter();
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const businesses: Business[] = [
		{ id: '1', companyName: 'Airtel NIN', status: 'Active', users: 24, contactPerson: 'Jane Cooper' },
		{ id: '2', companyName: 'Renmoney', status: 'Inactive', users: 54, contactPerson: 'Esther Howard' },
		{ id: '3', companyName: 'Fairmoney', status: 'Active', users: 88, contactPerson: 'Savannah Nguyen' },
		{ id: '4', companyName: 'Chipper Cash', status: 'Active', users: 53, contactPerson: 'Robert Fox' },
		{ id: '5', companyName: 'Access', status: 'Active', users: 76, contactPerson: 'Dianne Russell' },
		{ id: '6', companyName: 'Aura', status: 'Active', users: 5, contactPerson: 'Robert Fox' },
		{ id: '7', companyName: 'Airtel RGE', status: 'Active', users: 67, contactPerson: 'Esther Howard' },
		{ id: '8', companyName: 'Multichoice', status: 'Active', users: 98, contactPerson: 'Jane Cooper' },
		{ id: '9', companyName: 'Mobi Health', status: 'Active', users: 44, contactPerson: 'Savannah Nguyen' },
		{ id: '10', companyName: 'Branch', status: 'Active', users: 120, contactPerson: 'Robert Fox' },
		{ id: '11', companyName: 'TechCorp', status: 'Active', users: 32, contactPerson: 'John Doe' },
		{ id: '12', companyName: 'DataSys', status: 'Inactive', users: 15, contactPerson: 'Jane Smith' },
		{ id: '13', companyName: 'CloudNet', status: 'Active', users: 67, contactPerson: 'Mike Johnson' },
		{ id: '14', companyName: 'SoftWare Inc', status: 'Active', users: 89, contactPerson: 'Sarah Williams' },
		{ id: '15', companyName: 'NetSolutions', status: 'Active', users: 45, contactPerson: 'David Brown' },
		{ id: '16', companyName: 'WebServices', status: 'Inactive', users: 12, contactPerson: 'Emily Davis' },
		{ id: '17', companyName: 'DigitalPlus', status: 'Active', users: 78, contactPerson: 'Chris Wilson' },
		{ id: '18', companyName: 'InnovateLab', status: 'Active', users: 56, contactPerson: 'Lisa Anderson' },
		{ id: '19', companyName: 'FutureTech', status: 'Active', users: 92, contactPerson: 'Tom Martinez' },
		{ id: '20', companyName: 'SmartSystems', status: 'Inactive', users: 23, contactPerson: 'Amy Garcia' },
		{ id: '21', companyName: 'NextGen', status: 'Active', users: 34, contactPerson: 'Paul Rodriguez' },
		{ id: '22', companyName: 'ProActive', status: 'Active', users: 61, contactPerson: 'Karen Lee' },
		{ id: '23', companyName: 'GlobalNet', status: 'Active', users: 87, contactPerson: 'Mark Thompson' },
		{ id: '24', companyName: 'EliteGroup', status: 'Inactive', users: 18, contactPerson: 'Nancy White' },
	];

	const filteredBusinesses = useMemo(() => {
		return businesses.filter(business => {
			const matchesSearch = !searchTerm ||
				business.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				business.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || business.status.toLowerCase() === statusFilter.toLowerCase();

			return matchesSearch && matchesStatus;
		});
	}, [searchTerm, statusFilter, businesses]);

	const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex);

	const statusOptions = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
	];


	const handleViewDetail = (id: string) => {
		router.push(`/admin/businesses/${id}`);
	};

	return (
		<div  >
			{/* Header Section */}
			<div className="mb-6">
				<h1 
					className="text-2xl font-semibold dark:text-gray-100 mb-2"
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
					onChange={(value) => setStatusFilter(value)}
					options={statusOptions}
					className="w-full sm:w-[180px]"
					inputClassName="h-8 text-xs sm:h-10 sm:text-sm"
				/>
			</div>
		</div>

			{/* Businesses Table */}
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
								<th 
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Company Name
								</th>
								<th 
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Status
								</th>
								<th 
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Users
								</th>
								<th 
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Contact Person
								</th>
								<th 
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
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
							{paginatedBusinesses.length === 0 ? (
								<tr>
									<td 
										colSpan={5} 
										className="px-6 py-12 text-center dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No businesses found.
									</td>
								</tr>
							) : (
								paginatedBusinesses.map((business) => (
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
												className="text-sm font-medium dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{business.companyName}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${business.status === 'Active'
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
												className="text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{business.users}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span 
												className="text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{business.contactPerson}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => handleViewDetail(business.id)}
												className="dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
												style={{ color: '#2563EB' }}
												onMouseEnter={(e) => {
													e.currentTarget.style.color = '#1D4ED8';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.color = '#2563EB';
												}}
											>
												View Detail
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination Section */}
			<div className="mt-6 flex items-center justify-between">
				{/* Showing X of Y */}
				<PaginationSummary
					totalItems={filteredBusinesses.length}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
				/>

				{/* Pagination Controls */}
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={setupData.primaryColor}
					secondaryColor={setupData.secondaryColor}
				/>
			</div>
		</div>
	);
};

export default BusinessesManagementPage;
