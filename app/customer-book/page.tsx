'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import PageHeading from '@/components/ui/PageHeading';
import SearchWithSend from '@/components/ui/SearchWithSend';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import CustomerDetailsModal from '@/components/features/customer/CustomerDetailsModal';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { useCampaign } from '@/contexts/CampaignContext';
import { useGetSetupBookBySearchIdQuery } from '@/store/services/setupBookApi';
import { toastError } from '@/utils/toastWithSound';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import AccessRestricted from '@/components/ui/AccessRestricted';
import { SetupData } from '@/contexts/SetupContext';

interface Customer {
	id: string;
	[key: string]: string | number | boolean | null | undefined;
}

const CustomerBookPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const campaignId = campaignData?.campaign?._id || campaignData?.campaign?.id;
	const [searchTerm, setSearchTerm] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	// const [currentPage, setCurrentPage] = useState(1);
	const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const { canAccess } = usePrivilege();
	const canAccessModule = canAccess('customerBook');
	const canView = canAccess('customerBook', 'view');
	const canCreate = canAccess('customerBook', 'create');

	const searchId = campaignData?.campaign?.customerBookSettings?.searchId;
	const configuredFields = campaignData?.campaign?.customerBookSettings?.configuredFields || [];

	const mapFieldType = (type: string): 'text' | 'phone' | 'email' | 'number' | 'date' => {
		if (type === 'phone') return 'phone';
		if (type === 'email') return 'email';
		if (type === 'number') return 'number';
		if (type === 'date') return 'date';
		return 'text';
	};

	const fieldDefinitions = configuredFields.map((field: SetupData['customerBookSettings']['configuredFields'][number]) => ({
		id: field.id,
		name: field.name,
		type: mapFieldType(field.type),
		required: field.required
	}));

	// Fetch customer by SearchId
	const { data: searchResult, isLoading, isError, error } = useGetSetupBookBySearchIdQuery(
		{ campaignId: campaignId || '', searchId: searchQuery },
		{ skip: !searchQuery || !campaignId }
	);


	const [customers, setCustomers] = useState<Customer[]>([]);
	const [tableHeaders, setTableHeaders] = useState<string[]>([]);

	// Update customers list when search result is found
	React.useEffect(() => {
		if (searchResult?.data) {
			const data = searchResult.data as unknown[];
			if (Array.isArray(data) && data.length > 0) {
				// Dynamically extract headers from the first item, excluding internal fields like _id, id, __v
				const firstItem = data[0] as Record<string, unknown>;
				const headers = Object.keys(firstItem).filter(key => !['_id', 'id', '__v', 'companyId', 'campaignId'].includes(key) && key.toLowerCase() !== 'searchid');
				setTableHeaders(headers);

				const mappedCustomers: Customer[] = data.map((item) => {
					const record = item as Record<string, unknown>;
					return {
						id: (record.id as string) || (record._id as string),
						...(record as Record<string, string | number | boolean | null | undefined>)
					};
				});
				setCustomers(mappedCustomers);
			} else {
				setCustomers([]);
			}
		} else if (isError) {
			setCustomers([]);
			if (error && 'data' in error) {
				const errorData = (error as { data: { message?: string } }).data;
				if (errorData?.message === "Record not found") {
					toastError(errorData?.message);
				}
			}
		}
	}, [searchResult, isError, error]);

	const handleSearch = (value: string) => {
		setSearchQuery(value);
	};

	const filteredCustomers = customers;

	const handleAddCustomer = () => {
		setIsAddCustomerModalOpen(true);
	};



	const handleViewCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
	};


	return (
		<div>
			{!canAccessModule && (
				<AccessRestricted
					title="Access Restricted"
					message="You do not have access permission to view Customer Book."
				/>
			)}
			{canAccessModule && (
				<>
					<PageHeading text="Customer Book" />
					<div className="my-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
						{canView && (
							<SearchWithSend
								placeholder="Search"
								value={searchTerm}
								onChange={(value) => setSearchTerm(value)}
								onSearch={handleSearch}
								className="w-full sm:w-auto min-w-[300px]"
								buttonColor={campaignData?.primaryColor}
							/>
						)}
						<div className="flex   items-center justify-end sm:justify-start gap-2 sm:gap-3 whitespace-nowrap">
							<Button
								variant="muted-sage-green-outline"
								size="md"
								onClick={handleAddCustomer}
								className="px-2 py-2 sm:px-4 sm:py-2 text-[10px] md:text-[12px]"
								disabled={!canCreate}
							>
								Add Customer
							</Button>
						</div>
					</div>
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
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
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
												style={{ color: 'var(--text-primary)' }}
											>
												{header}
											</th>
										))}
										<th
											className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-100 uppercase tracking-wider"
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
													className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{customer[header]}
												</td>
											))}
											<td className="px-6 py-4 whitespace-nowrap">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => canView ? handleViewCustomer(customer) : undefined}
													className="dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
													style={{ color: 'var(--text-secondary)' }}
													disabled={!canView}
												>
													<ArrowRightIcon className="w-5 h-5" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
					<CreateRecordModal
						isOpen={isAddCustomerModalOpen}
						onClose={() => setIsAddCustomerModalOpen(false)}
						fieldDefinitions={fieldDefinitions}
						searchId={searchId}
					/>
					<CustomerDetailsModal
						isOpen={!!selectedCustomer}
						onClose={() => setSelectedCustomer(null)}
						customer={selectedCustomer}
					/>
				</>
			)}
		</div>
	);
}

export default CustomerBookPage;
