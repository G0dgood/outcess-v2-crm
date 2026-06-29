'use client';

import React, { useState, useMemo } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { BucketWithMembers, getUserAssignedBuckets } from '@/utils/bucketUtils';
import AccessRestricted from '@/components/ui/AccessRestricted';
import { CustomerField } from '@/types/dashboard';

interface Customer {
	id: string;
	[key: string]: string | number | boolean | null | undefined;
}

interface ConfiguredField {
	bucketId: string;
	fields: CustomerField[];
}

const CustomerBookPage: React.FC = () => {
	const { campaignData } = useCampaign();
	const campaignId = campaignData?._id || campaignData?.id;
	const [searchTerm, setSearchTerm] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	// const [currentPage, setCurrentPage] = useState(1);
	const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const { canAccess, isAdmin, isSuperAdmin } = usePrivilege();
	const { user } = useAuth();
	const canAccessModule = canAccess('customerBook');
	const canView = canAccess('customerBook', 'view');
	const canCreate = canAccess('customerBook', 'create');

	const configuredFields = useMemo(() => {
		return (campaignData?.customerBookSettings?.configuredFields || []) as ConfiguredField[];
	}, [campaignData]);

	const buckets = useMemo(() => {
		return (campaignData?.dashboardSettings?.buckets || []) as unknown as BucketWithMembers[];
	}, [campaignData]);

	const userId = String(user?.id || user?._id || '');
	const hasFullBucketAccess = isAdmin || isSuperAdmin;

	const accessibleBuckets = useMemo(
		() => (hasFullBucketAccess ? buckets : getUserAssignedBuckets(userId, buckets)),
		[buckets, userId, hasFullBucketAccess]
	);

	const bucketQueryParams = useMemo(() => {
		if (hasFullBucketAccess || accessibleBuckets.length === 0) return {};
		if (accessibleBuckets.length === 1) {
			return { bucketId: accessibleBuckets[0].id };
		}
		return { bucketIds: accessibleBuckets.map((b) => b.id).join(',') };
	}, [accessibleBuckets, hasFullBucketAccess]);

	const mapFieldType = (type: string): 'text' | 'phone' | 'email' | 'number' | 'date' => {
		if (type === 'phone') return 'phone';
		if (type === 'email') return 'email';
		if (type === 'number') return 'number';
		if (type === 'date') return 'date';
		return 'text';
	};

	const fieldDefinitions = useMemo(() => {
		const relevantConfigs = hasFullBucketAccess
			? configuredFields
			: configuredFields.filter((config: ConfiguredField) =>
				accessibleBuckets.some((bucket: BucketWithMembers) => bucket.id === config?.bucketId)
			);

		const allFields = relevantConfigs.flatMap((config: ConfiguredField) => config?.fields || []);
		// Deduplicate by ID just in case
		const uniqueFieldsMap = new Map<string, CustomerField>();
		allFields.forEach((field: CustomerField) => {
			if (field && field.id) uniqueFieldsMap.set(field.id, field);
		});

		return Array.from(uniqueFieldsMap.values()).map((field: CustomerField) => ({
			id: field.id,
			name: field.name,
			type: mapFieldType(field.type),
			required: field.required
		}));
	}, [configuredFields, accessibleBuckets, hasFullBucketAccess]);

	// Fetch customer by SearchId within the user's assigned buckets
	const { data: searchResult, isLoading, isError, error } = useGetSetupBookBySearchIdQuery(
		{ campaignId: campaignId || '', searchId: searchQuery, ...bucketQueryParams },
		{ skip: !searchQuery || !campaignId || (!hasFullBucketAccess && accessibleBuckets.length === 0) }
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
				const headers = Object.keys(firstItem).filter(key => !['_id', 'id', '__v', 'companyId', 'campaignId'].includes(key) && key.toLowerCase() !== 'searchid' && key.toLowerCase() !== 'bucketid');
				setTableHeaders(headers);

				const mappedCustomers: Customer[] = data?.map((item) => {
					const record = item as Record<string, unknown>;
					return {
						id: (record?.id as string) || (record?._id as string),
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
			{canAccessModule && !hasFullBucketAccess && accessibleBuckets.length === 0 && (
				<>
					<PageHeading text="Customer Book" />
					<div className="my-12 text-center">
						<p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
							You are not assigned to any bucket. Contact your administrator to get bucket access.
						</p>
					</div>
				</>
			)}
			{canAccessModule && (hasFullBucketAccess || accessibleBuckets.length > 0) && (
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
								<thead>
									<tr>
										{tableHeaders.map((header) => (
											<th
												key={header}
												className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider"
											>
												{header}
											</th>
										))}
										<th
											className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody
									className="divide-y dark:divide-gray-700"
									style={{
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
											style={{ borderColor: 'var(--light-gray)' }}
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
						bucketId={accessibleBuckets.length === 1 ? accessibleBuckets[0].id : accessibleBuckets[0]?.id}
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
