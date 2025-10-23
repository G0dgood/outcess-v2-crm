'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Search from '@/components/ui/Search';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import { useSetup } from '@/contexts/SetupContext';

interface ReportData {
	id: string;
	agentName: string;
	agentId: string;
	date: string;
	[key: string]: any; // For dynamic fields
}

const ReportPage: React.FC = () => {
	const { setupData } = useSetup();
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [reportData] = useState<ReportData[]>([]); // Empty for now
	const [totalPages] = useState(10);

	const handleDownload = () => {
		console.log('Download clicked');
		// Implement download functionality
		// This could export data as CSV, PDF, or Excel
	};

	const handleFilter = () => {
		console.log('Filter clicked');
		// Implement filter functionality
		// This could open a filter modal or dropdown
	};

	const handleAddField = () => {
		console.log('Add Field clicked');
		// Implement add field functionality
		// This could open a modal to add new columns
	};

	return (
		<div>
			{/* Title and Action Buttons */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-lato font-medium text-[16px] leading-[150%] text-[#3A4050]">Report</h1>
				<Button
					variant="outline"
					size="md"
					onClick={handleDownload}
					className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
				>
					Download
				</Button>
			</div>

			{/* Description */}
			<div className="mb-6">
				<p className="font-lato font-normal text-[14px] leading-[150%] text-[#6D7280]">
					Visualize and analyze your data
				</p>
			</div>

			{/* Search and Filter Bar */}
			<div className="mb-6 flex items-center gap-4">
				<div className="flex-1 max-w-md">
					<Search
						placeholder="Search"
						value={searchTerm}
						onChange={setSearchTerm}
						onSearch={(value) => console.log('Search triggered:', value)}
						onClear={() => console.log('Search cleared')}
						showClearButton={true}
					/>
				</div>
				<Button
					variant="outline"
					size="md"
					onClick={handleFilter}
					className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
				>
					<Icon name="Filter_light" size="sm" />
					Filter
					<Icon name="Expand_down_light" size="sm" />
				</Button>
			</div>

			{/* Report Table */}
			<div className="bg-white border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Agent Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Agent ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date
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
							{reportData.length > 0 ? (
								reportData.map((report) => (
									<tr key={report.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{report.agentName}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{report.agentId}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{report.date}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{/* Empty cell for Add Field column */}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-gray-500">
										<div className="flex flex-col items-center justify-center">
											<div className="mb-4">
												<Icon name="Bar_chart_light" size="4xl" className="text-gray-300" />
											</div>
											<h3 className="text-lg font-medium text-gray-900 mb-2">
												No Report Data Available
											</h3>
											<p className="text-gray-500 mb-4">
												Generate reports to visualize and analyze your data.
											</p>
											<Button
												variant="outline"
												size="md"
												onClick={handleDownload}
												className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
											>
												Generate Report
											</Button>
										</div>
									</td>
								</tr>
							)}
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

export default ReportPage;
