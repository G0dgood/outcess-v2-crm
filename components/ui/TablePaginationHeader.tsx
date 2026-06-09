'use client';

import React from 'react';
import PaginationSummary from './PaginationSummary';

interface TablePaginationHeaderProps {
	totalItems: number;
	itemsPerPage: number;
	onItemsPerPageChange: (value: number) => void;
	label?: string;
	className?: string;
}

const TablePaginationHeader: React.FC<TablePaginationHeaderProps> = ({
	totalItems,
	itemsPerPage,
	onItemsPerPageChange,
	label = 'Items',
	className = '',
}) => {
	if (totalItems === 0) return null;

	return (
		<div className={`p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
			<PaginationSummary
				totalItems={totalItems}
				itemsPerPage={itemsPerPage}
				onItemsPerPageChange={onItemsPerPageChange}
				className="text-gray-600 dark:text-gray-400"
			/>
			<span
				className="text-[10px] md:text-[12px] dark:text-gray-400"
				style={{ color: 'var(--text-tertiary)' }}
			>
				Total of {totalItems} {label}
			</span>
		</div>
	);
};

export default TablePaginationHeader;
