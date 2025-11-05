'use client';

import React from 'react';

interface Business {
	id: string;
	companyName: string;
	status: 'Active' | 'Inactive';
	users: number;
	lastActive: string;
}

const RegisteredBusinessesTable: React.FC = () => {
	const businesses: Business[] = [
		{
			id: '1',
			companyName: 'Airtel',
			status: 'Active',
			users: 24,
			lastActive: '15-11-2024',
		},
		{
			id: '2',
			companyName: 'Renmoney',
			status: 'Inactive',
			users: 54,
			lastActive: '23-03-2025',
		},
		{
			id: '3',
			companyName: 'Fairmoney',
			status: 'Active',
			users: 88,
			lastActive: '23-03-2025',
		},
		{
			id: '4',
			companyName: 'Chipper Cash',
			status: 'Active',
			users: 53,
			lastActive: '23-03-2025',
		},
		{
			id: '5',
			companyName: 'Access',
			status: 'Active',
			users: 76,
			lastActive: '23-03-2025',
		},
	];

	const handleView = (id: string) => {
		console.log('View business:', id);
		// TODO: Navigate to business details page
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead className="bg-gray-50 dark:bg-gray-700">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Company Name
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Users
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Last Active
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
							Action
						</th>
					</tr>
				</thead>
				<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
					{businesses.map((business) => (
						<tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm font-medium text-gray-900 dark:text-gray-100">{business.companyName}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span
									className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										business.status === 'Active'
											? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
											: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
									}`}
								>
									{business.status}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm text-gray-600 dark:text-gray-400">{business.users}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm text-gray-600 dark:text-gray-400">{business.lastActive}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<button
									onClick={() => handleView(business.id)}
									className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
								>
									View
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default RegisteredBusinessesTable;

