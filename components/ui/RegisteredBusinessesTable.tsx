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
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Company Name
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Users
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Last Active
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Action
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{businesses.map((business) => (
						<tr key={business.id} className="hover:bg-gray-50 transition-colors">
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm font-medium text-gray-900">{business.companyName}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span
									className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										business.status === 'Active'
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{business.status}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm text-gray-600">{business.users}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="text-sm text-gray-600">{business.lastActive}</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<button
									onClick={() => handleView(business.id)}
									className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
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

