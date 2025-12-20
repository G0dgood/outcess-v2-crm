'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import PageHeading from '@/components/ui/PageHeading';
import SearchWithSend from '@/components/ui/SearchWithSend';
import AddCustomerModal from '@/components/ui/AddCustomerModal';
import CustomerDetailsModal from '@/components/ui/CustomerDetailsModal';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useGetSetupBookBySearchIdQuery } from '@/store/services/setupBookApi';

interface Customer {
	id: string;
	[key: string]: any;
}

const CustomerBookPage: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const [searchTerm, setSearchTerm] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


	console.log('lineOfBusinessData----->', lineOfBusinessData)

	// Fetch customer by SearchId
	const { data: searchResult, isLoading, isError } = useGetSetupBookBySearchIdQuery(
		{ searchId: searchQuery },
		{ skip: !searchQuery }
	);

	const [customers, setCustomers] = useState<Customer[]>([]);
	const [tableHeaders, setTableHeaders] = useState<string[]>([]);

	// Update customers list when search result is found
	React.useEffect(() => {
		if (searchResult?.data) {
			const data = searchResult.data as any[]; // Cast to any[] to handle the structure flexibly
			if (Array.isArray(data) && data.length > 0) {
				// Dynamically extract headers from the first item, excluding internal fields like _id, id, __v
				const firstItem = data[0];
				const headers = Object.keys(firstItem).filter(key => !['_id', 'id', '__v', 'companyId', 'lineOfBusinessId'].includes(key));
				setTableHeaders(headers);

				const mappedCustomers: Customer[] = data.map((item: any) => ({
					id: item.id || item._id,
					...item
				}));
				setCustomers(mappedCustomers);
			}
		}
	}, [searchResult]);

	const handleSearch = (value: string) => {
		setSearchQuery(value);
	};

	const filteredCustomers = customers;

	const handleAddCustomer = () => {
		setIsAddCustomerModalOpen(true);
	};

	const handleSaveCustomer = (customerData: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	}) => {
		const newCustomer: Customer = {
			id: Date.now().toString(),
			...customerData,
		};
		setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
		setIsAddCustomerModalOpen(false);
	};

	const handleAddFields = () => {
		console.log('Add Fields clicked');
		// Implement add fields logic here
	};

	const handleViewCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
	};


	return (
		<div>
			{/* Title */}
			<PageHeading
				text="Customer Book"
			/>

			{/* Search & Actions */}
			<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<SearchWithSend
					placeholder="Search"
					value={searchTerm}
					onChange={(value) => setSearchTerm(value)}
					onSearch={handleSearch}
					className="w-full sm:w-auto min-w-[300px]"
					buttonColor={lineOfBusinessData?.primaryColor}
				/>
				<div className="flex   items-center justify-end sm:justify-start gap-2 sm:gap-3 whitespace-nowrap">
					<Button
						variant="muted-sage-green-outline"
						size="md"
						onClick={handleAddCustomer}
						className="px-2 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
					>
						Add Customer
					</Button>

				</div>
			</div>

			{/* Customer Table */}
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
								{tableHeaders.map((header) => (
									<th
										key={header}
										className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
										style={{ color: 'var(--text-primary)' }}
									>
										{header}
									</th>
								))}
								<th
									className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
									style={{ color: 'var(--text-primary)' }}
								>
									Actions
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
								<SVGLoaderFetch colSpan={tableHeaders.length + 1} text="Searching customer..." />
							) : filteredCustomers?.length === 0 ? (
								<NoRecordFound colSpan={tableHeaders.length + 1} />
							) : filteredCustomers?.map((customer) => (
								<tr
									key={customer.id}
									className="dark:hover:bg-gray-700"
									style={{ borderColor: 'var(--light-gray)' }}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--accent-white)';
									}}
								>
									{tableHeaders?.map((header) => (
										<td
											key={`${customer.id}-${header}`}
											className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{customer[header]}
										</td>
									))}
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() => handleViewCustomer(customer)}
											className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
											style={{ color: 'var(--text-secondary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--muted-sage-green)';
												e.currentTarget.style.backgroundColor = 'rgba(108, 139, 125, 0.1)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
												e.currentTarget.style.backgroundColor = 'transparent';
											}}
											title="View Customer"
										>
											<ArrowRightIcon className="w-5 h-5" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>




			{/* Add Customer Modal */}
			<AddCustomerModal
				isOpen={isAddCustomerModalOpen}
				onClose={() => setIsAddCustomerModalOpen(false)}
				onSave={handleSaveCustomer}
				onAddFields={handleAddFields}
			/>

			{/* Customer Details Modal */}
			<CustomerDetailsModal
				isOpen={!!selectedCustomer}
				onClose={() => setSelectedCustomer(null)}
				customer={selectedCustomer}
			/>
		</div>
	);
};

export default CustomerBookPage;
