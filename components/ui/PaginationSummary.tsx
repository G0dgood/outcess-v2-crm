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
		{ value: '8', label: '8' },
		{ value: '10', label: '10' },
		{ value: '20', label: '20' },
		{ value: '50', label: '50' },
		{ value: '100', label: '100' },
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

