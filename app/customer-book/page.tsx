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
			<div className="bg-white  border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th>
									<div className="flex items-center gap-2">
										First Name
										<Icon name="Question_mark_light" size="sm" className="text-gray-400" />
									</div>
								</th>
								<th>Last Name</th>
								<th>Email</th>
								<th>Phone</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredCustomers.map((customer) => (
								<tr key={customer.id} className="hover:bg-gray-50">
									<td className="font-medium text-gray-900">
										{customer.firstName}
									</td>
									<td>{customer.lastName}</td>
									<td>{customer.email}</td>
									<td>{customer.phone}</td>
									<td>
										<button
											onClick={() => handleViewCustomer(customer.id)}
											className="p-2 text-gray-600 hover:text-(--muted-sage-green) hover:bg-(--interactive-secondary)/10  transition-colors cursor-pointer"
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
