'use client';

import React, { useState } from 'react';
import Button from './Button';
import Modal from './Modal';
import { useGetAllCompaniesQuery } from '@/store/services/companyApi';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface Business {
	id?: string;
	_id?: string;
	companyName: string;
	status: string;
	updatedAt?: string;
	deactivationReason?: string;
}

const RegisteredBusinessesTable: React.FC = () => {
	const router = useRouter();
	const { data: companiesData, isLoading } = useGetAllCompaniesQuery({ page: 1, limit: 5 });
	const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
	const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

	const businesses = (companiesData?.companies || []) as Business[];

	const handleView = (id: string) => {
		router.push(`/superadmin/businesses/${id}`);
	};

	const handleShowReason = (business: Business) => {
		setSelectedBusiness(business);
		setIsReasonModalOpen(true);
	};

	return (
		<div className="overflow-x-auto !rounded-3xl">
			<table
				className="min-w-full divide-y dark:divide-gray-700"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				<thead
					className="dark:bg-gray-700 border-b dark:border-gray-700"
					style={{
						backgroundColor: 'var(--bg-primary)',
						borderBottomColor: 'var(--light-gray)'
					}}
				>
					<tr>
						<th className="px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
						<th className="px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
						<th className="px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
						<th className="px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
						<SVGLoaderFetch colSpan={4} text="Loading businesses..." />
					) : businesses.length === 0 ? (
						<NoRecordFound colSpan={4} />
					) : (
						businesses.map((business: Business) => (
							<tr
								key={business._id || business.id}
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
										className={`inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full ${business.status === 'Active'
											? 'dark:bg-green-900/30 dark:text-green-400'
											: business.status === 'Inactive'
												? 'dark:bg-yellow-900/30 dark:text-yellow-400 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800/50'
												: 'dark:bg-red-900/30 dark:text-red-400 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/50'
											}`}
										onClick={() => business.status !== 'Active' && handleShowReason(business)}
										style={business.status === 'Active' ? {
											backgroundColor: 'rgba(34, 197, 94, 0.1)',
											color: '#16A34A'
										} : business.status === 'Inactive' ? {
											backgroundColor: 'rgba(234, 179, 8, 0.1)',
											color: '#CA8A04'
										} : {
											backgroundColor: 'rgba(220, 38, 38, 0.1)',
											color: '#DC2626'
										}}
										title={business.status !== 'Active' ? 'Click to view deactivation reason' : ''}
									>
										{business.status}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										{business.updatedAt ? moment(business.updatedAt).format('DD-MM-YYYY') : 'N/A'}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleView(business._id || business.id || '')}
										className="dark:text-blue-400 dark:hover:text-blue-300 text-[10px] md:text-[12px] font-medium transition-colors"
										style={{ color: '#2563EB' }}
										onMouseEnter={(e) => {
											e.currentTarget.style.color = '#1D4ED8';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.color = '#2563EB';
										}}
									>
										View
									</Button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			{/* Deactivation Reason Modal */}
			<Modal
				isOpen={isReasonModalOpen}
				onClose={() => setIsReasonModalOpen(false)}
				title=""
				size="sm"
				className="!bg-white dark:!bg-gray-900 !border-2 border-red-500 dark:border-red-600 shadow-2xl"
				showCloseButton={false}
			>
				<div className="p-6 text-center">
					<div className="flex flex-col items-center gap-4 mb-6">
						<div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
							<ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
								Deactivation Reason
							</h3>
							<p className="text-[12px] text-gray-500 dark:text-gray-400">
								For {selectedBusiness?.companyName}
							</p>
						</div>
					</div>

					<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-6 text-left border border-gray-100 dark:border-gray-700">
						<p className="text-[14px] text-gray-700 dark:text-gray-300 italic">
							&quot;{selectedBusiness?.deactivationReason || 'No reason provided.'}&quot;
						</p>
					</div>

					<Button
						variant="primary"
						onClick={() => setIsReasonModalOpen(false)}
						className="w-full bg-red-600 hover:bg-red-700 text-white"
					>
						Close
					</Button>
				</div>
			</Modal>
		</div>
	);
};

export default RegisteredBusinessesTable;
