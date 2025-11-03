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
				<h1 className="text-2xl font-semibold text-gray-900 mb-2">Businesses Management</h1>
			</div>

			{/* Search and Filter Section */}
			<div className="flex items-center justify-between mb-6">
				<Search
					placeholder="Search businesses..."
					value={searchTerm}
					onChange={setSearchTerm}
					className="flex-1 max-w-md"
					showClearButton={true}
				/>
				<div  >
					<Dropdown
						label=""
						value={statusFilter}
						onChange={(value) => setStatusFilter(value)}
						options={statusOptions}
						className="w-[180px]"
						inputClassName="h-10"
					/>
				</div>
			</div>

			{/* Businesses Table */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Company Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Users
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Contact Person
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedBusinesses.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center text-gray-500">
										No businesses found.
									</td>
								</tr>
							) : (
								paginatedBusinesses.map((business) => (
									<tr key={business.id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm font-medium text-gray-900">{business.companyName}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${business.status === 'Active'
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
													}`}
											>
												{business.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{business.users}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{business.contactPerson}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<button
												onClick={() => handleViewDetail(business.id)}
												className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors cursor-pointer"
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

