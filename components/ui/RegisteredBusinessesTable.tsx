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

	const handleView = (_id: string) => {
		console.log('View business:', _id);
		// TODO: Navigate to business details page
	};

	return (
		<div className="overflow-x-auto">
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
							Status
						</th>
						<th
							className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
							style={{ color: 'var(--text-primary)' }}
						>
							Users
						</th>
						<th
							className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium dark:text-gray-300 uppercase tracking-wider"
							style={{ color: 'var(--text-primary)' }}
						>
							Last Active
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
					{businesses.map((business) => (
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
									className={`inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full ${business.status === 'Active'
										? 'dark:bg-green-900/30 dark:text-green-400'
										: 'dark:bg-red-900/30 dark:text-red-400'
										}`}
									style={business.status === 'Active' ? {
										backgroundColor: 'rgba(34, 197, 94, 0.1)',
										color: '#16A34A'
									} : {
										backgroundColor: 'rgba(220, 38, 38, 0.1)',
										color: '#DC2626'
									}}
								>
									{business.status}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									{business.users}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span
									className="text-[10px] md:text-[12px] dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									{business.lastActive}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<button
									onClick={() => handleView(business.id)}
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

