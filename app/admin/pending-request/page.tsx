'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import { useSetup } from '@/contexts/SetupContext';

interface PendingBusiness {
	id: string;
	companyName: string;
	registrationDate: string;
	industry: string;
	status: 'Pending';
}

const PendingRequestPage: React.FC = () => {
	const router = useRouter();
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(10);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	const businesses: PendingBusiness[] = [
		{ id: '1', companyName: 'Airtel NIN', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '2', companyName: 'Renmoney', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '3', companyName: 'Fairmoney', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '4', companyName: 'Chipper Cash', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '5', companyName: 'Access', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '6', companyName: 'Aura', registrationDate: 'Dec 15, 2024', industry: 'Education', status: 'Pending' },
		{ id: '7', companyName: 'Airtel RGE', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '8', companyName: 'Multichoice', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '9', companyName: 'Mobi Health', registrationDate: 'Dec 15, 2024', industry: 'Healthcare', status: 'Pending' },
		{ id: '10', companyName: 'Branch', registrationDate: '120', industry: 'Finance', status: 'Pending' },
		{ id: '11', companyName: 'TechCorp', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '12', companyName: 'DataSys', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '13', companyName: 'CloudNet', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '14', companyName: 'SoftWare Inc', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '15', companyName: 'NetSolutions', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '16', companyName: 'WebServices', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '17', companyName: 'DigitalPlus', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '18', companyName: 'InnovateLab', registrationDate: 'Dec 15, 2024', industry: 'Education', status: 'Pending' },
		{ id: '19', companyName: 'FutureTech', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '20', companyName: 'SmartSystems', registrationDate: 'Dec 15, 2024', industry: 'Technology', status: 'Pending' },
		{ id: '21', companyName: 'NextGen', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
		{ id: '22', companyName: 'ProActive', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '23', companyName: 'GlobalNet', registrationDate: 'Dec 15, 2024', industry: 'Communication', status: 'Pending' },
		{ id: '24', companyName: 'EliteGroup', registrationDate: 'Dec 15, 2024', industry: 'Finance', status: 'Pending' },
	];

	const filteredBusinesses = useMemo(() => {
		return businesses.filter(business => {
			const matchesSearch = !searchTerm ||
				business.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				business.industry.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesSearch;
		});
	}, [searchTerm]);

	const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex);

	const handleViewDetail = (id: string) => {
		router.push(`/admin/pending-request/${id}`);
	};

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900 mb-2">Pending Request</h1>
			</div>

			{/* Search Section */}
			<div className="mb-6">
				<Search
					placeholder="Search businesses..."
					value={searchTerm}
					onChange={setSearchTerm}
					className="flex-1 max-w-md"
					showClearButton={true}
				/>
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
									Registration Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Industry
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
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
										No pending businesses found.
									</td>
								</tr>
							) : (
								paginatedBusinesses.map((business) => (
									<tr key={business.id} className="hover:bg-gray-50 transition-colors">
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm font-medium text-gray-900">{business.companyName}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{business.registrationDate}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="text-sm text-gray-600">{business.industry}</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
												{business.status}
											</span>
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

export default PendingRequestPage;

