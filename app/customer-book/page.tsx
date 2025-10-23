'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { useSetup } from '@/contexts/SetupContext';

interface Customer {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
}

const CustomerBookPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'janedoe@example.com',
			phone: '08023456789'
		},
		{
			id: '2',
			firstName: 'John',
			lastName: 'Tom',
			email: 'janetom@example.com',
			phone: '08023456789'
		}
	]);

	const filteredCustomers = customers.filter(customer =>
		customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
		customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		customer.phone.includes(searchTerm)
	);

	const handleAddCustomer = () => {
		console.log('Add Customer clicked');
		// Implement add customer functionality
	};

	const handleImport = () => {
		console.log('Import clicked');
		// Implement import functionality
	};

	const handleAddField = () => {
		console.log('Add Field clicked');
		// Implement add field functionality
	};

	const totalPages = 10;

	return (
		<div>
			<div className="flex items-center justify-between ">
				<h1 className="font-lato font-medium text-[16px] leading-[150%] text-[#3A4050]">Customer Book</h1>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="md"
						onClick={handleAddCustomer}
						className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
					>
						Add Customer
					</Button>
					<Button
						variant="outline"
						size="md"
						onClick={handleImport}
						className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 flex items-center gap-2"
					>
						<Icon name="External_link_light" size="sm" />
						Import
					</Button>
				</div>
			</div>
			{/* Description */}
			<div className="mb-6">
				<p className="font-lato font-normal text-[14px] leading-[150%] text-[#6D7280]">
					Consolidate all your customer information in the Customer Book, a single, comprehensive database.
				</p>
			</div>

			{/* Search Bar */}
			<div className="mb-6">
				<div className="relative max-w-md">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon name="Search_light" size="sm" className="text-gray-400" />
					</div>
					<Input
						label=""
						type="text"
						placeholder="Search"
						value={searchTerm}
						onChange={(value) => setSearchTerm(value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Customer Table */}
			<div className="bg-white  border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<div className="flex items-center gap-2">
										First Name
										<Icon name="Question_mark_light" size="sm" className="text-gray-400" />
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Last Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Phone
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									<button
										onClick={handleAddField}
										className="text-blue-600 hover:text-blue-800 font-medium"
									>
										Add Field
									</button>
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredCustomers.map((customer) => (
								<tr key={customer.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
										{customer.firstName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.lastName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{customer.phone}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{/* Empty cell for Add Field column */}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<div className="mt-6">
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

export default CustomerBookPage;
