'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import PageHeading from '@/components/ui/PageHeading';
import Search from '@/components/ui/Search';
import { useSetup } from '@/contexts/SetupContext';
import AddCustomerModal from '@/components/ui/AddCustomerModal';
import CustomerDetailsModal from '@/components/ui/CustomerDetailsModal';
import { ArrowRightIcon } from '@radix-ui/react-icons';

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
	const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [customers, setCustomers] = useState<Customer[]>([
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

	const handleImport = () => {
		console.log('Import clicked');
		// Implement import functionality
	};

	const handleViewCustomer = (customerId: string) => {
		const customer = customers.find(c => c.id === customerId);
		if (customer) {
			setSelectedCustomer(customer);
		}
	};



	const totalPages = 10;

	return (
		<div>
			{/* Title */}
			<PageHeading
				text="Customer Book"
			/>

			{/* Search Bar */}
			<div className="my-6 flex items-center justify-between">
				<Search
					placeholder="Search"
					value={searchTerm}
					onChange={(value) => setSearchTerm(value)}
				/>
				<div className="flex items-center gap-3">
					<Button
						variant="muted-sage-green-outline"
						size="md"
						onClick={handleAddCustomer}
					>
						Add Customer
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleImport}
						className="bg-(--primary) text-white border-(--primary) hover:bg-(--primary)/90 flex items-center gap-2"
					>
						Import
						<Icon name="share" size="sm" />
					</Button>
				</div>
			</div>

			{/* Customer Table */}
			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
									<div className="flex items-center gap-2">
										First Name
										<Icon name="Question_mark_light" size="sm" className="text-gray-400 dark:text-gray-500" />
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Last Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Email</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Phone</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
							{filteredCustomers.map((customer) => (
								<tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
									<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
										{customer.firstName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.lastName}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.email}</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{customer.phone}</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() => handleViewCustomer(customer.id)}
											className="p-2 text-gray-600 dark:text-gray-400 hover:text-(--muted-sage-green) dark:hover:text-gray-200 hover:bg-(--interactive-secondary)/10 dark:hover:bg-gray-700 transition-colors cursor-pointer"
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

			{/* Pagination */}
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				showEllipsis={true}
				maxVisiblePages={5}
				primaryColor={setupData.primaryColor}
				secondaryColor={setupData.secondaryColor}
			/>

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
