'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Search from '@/components/ui/Search';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import TablePaginationHeader from '@/components/ui/TablePaginationHeader';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { usePrivilege } from '@/contexts/PrivilegeContext';

interface PendingBusiness {
	id: string;
	companyName: string;
	registrationDate: string;
	industry: string;
	status: 'Pending';
}

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

const PendingRequestPage: React.FC = () => {
	const router = useRouter();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { isAdmin } = usePrivilege();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(10);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [isLoading] = useState(false);

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

	if (!isAdmin) {
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
					Pending Request
				</h1>
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
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<TablePaginationHeader
					totalItems={filteredBusinesses.length}
					itemsPerPage={itemsPerPage}
					onItemsPerPageChange={(value) => {
						setItemsPerPage(value);
						setCurrentPage(1);
					}}
					label="Requests"
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
									Registration Date
								</th>
								<th
									className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Industry
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
												className="text-[10px] md:text-[12px] dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{business.registrationDate}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="text-[10px] md:text-[12px] dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												{business.industry}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className="inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full dark:bg-yellow-900/30 dark:text-yellow-400"
												style={{
													backgroundColor: 'rgba(251, 146, 60, 0.1)',
													color: '#EA580C'
												}}
											>
												{business.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewDetail(business.id)}
												className="hover:text-blue-800 text-[10px] md:text-[12px] font-medium transition-colors cursor-pointer p-0 h-auto"
												style={{ color: '#2563EB' }}
												onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
													e.currentTarget.style.color = '#1D4ED8';
												}}
												onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
													e.currentTarget.style.color = '#2563EB';
												}}
												title={`View detail for ${business.companyName}`}
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
			<div className="mt-6">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					showEllipsis={true}
					maxVisiblePages={5}
					primaryColor={lineOfBusinessData?.primaryColor || 'var(--primary)'}
					secondaryColor={lineOfBusinessData?.secondaryColor || 'var(--primary)'}
				/>
			</div>
		</div>
	);
};

export default PendingRequestPage;
