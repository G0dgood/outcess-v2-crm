'use client';

import React from 'react';
import Dropdown from './Dropdown';

interface PaginationSummaryProps {
	totalItems: number;
	itemsPerPage: number;
	onItemsPerPageChange: (value: number) => void;
	itemsPerPageOptions?: Array<{ value: string; label: string }>;
	className?: string;
}

const PaginationSummary: React.FC<PaginationSummaryProps> = ({
	totalItems,
	itemsPerPage,
	onItemsPerPageChange,
	itemsPerPageOptions = [
		{ value: '5', label: '5' },
		{ value: '8', label: '8' },
		{ value: '10', label: '10' },
		{ value: '20', label: '20' },
		{ value: '50', label: '50' },
		{ value: '100', label: '100' },
		{ value: '200', label: '200' },
		{ value: '500', label: '500' },
		{ value: '1000', label: '1000' },
		{ value: '2000', label: '2000' },
		{ value: '5000', label: '5000' },
		{ value: '10000', label: '10000' },
		{ value: '20000', label: '20000' },
		{ value: '50000', label: '50000' },
		{ value: '100000', label: '100000' },
		{ value: '200000', label: '200000' },
		{ value: '500000', label: '500000' },
		{ value: '1000000', label: '1000000' },
		{ value: '2000000', label: '2000000' },
		{ value: '5000000', label: '5000000' },
		{ value: '10000000', label: '10000000' },
		{ value: '20000000', label: '20000000' },		
	],
	className = '',
}) => {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<span className="text-[10px] md:text-[12px] text-gray-600 dark:text-gray-400">Showing</span>
			<Dropdown
				label=""
				value={itemsPerPage.toString()}
				onChange={(value) => {
					onItemsPerPageChange(Number(value));
				}}
				options={itemsPerPageOptions}
				className="min-w-[80px]"
				inputClassName="h-8"
				direction="down"
			/>
			<span className="text-[10px] md:text-[12px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
				of {totalItems}
			</span>
		</div>
	);
};

export default PaginationSummary;

