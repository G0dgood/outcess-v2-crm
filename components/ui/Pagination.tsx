import React from 'react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showEllipsis?: boolean;
	maxVisiblePages?: number;
	className?: string;
	primaryColor?: string;
	secondaryColor?: string;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	maxVisiblePages = 5,
	className = '',
	primaryColor = '#050711',
}) => {
	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	const getVisiblePages = () => {
		const pages: (number | string)[] = [];

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is less than max visible
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage <= 3) {
				// Show first few pages
				for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
					pages.push(i);
				}
				if (totalPages > 4) {
					pages.push('...');
				}
			} else if (currentPage >= totalPages - 2) {
				// Show last few pages
				if (totalPages > 4) {
					pages.push('...');
				}
				for (let i = Math.max(totalPages - 3, 2); i <= totalPages - 1; i++) {
					pages.push(i);
				}
			} else {
				// Show current page and surrounding pages
				pages.push('...');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('...');
			}

			// Always show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const visiblePages = getVisiblePages();

	return (
		<div className={`mt-6 flex items-center justify-between ${className}`}>
			{/* Previous Button */}
			<div className="flex items-center gap-2">
				<button
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className="py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					Previous
				</button>
			</div>

			{/* Page Numbers */}
			<div className="flex items-center gap-1">
				{visiblePages.map((page, index) => {
					if (page === '...') {
						return (
							<span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
								...
							</span>
						);
					}

					const pageNumber = page as number;
					const isCurrentPage = currentPage === pageNumber;

					return (
						<button
							key={pageNumber}
							onClick={() => onPageChange(pageNumber)}
							className={`cursor-pointer font-inter font-medium text-[16px] leading-[150%] px-3 py-1 text-sm transition-colors ${isCurrentPage
								? 'text-white'
								: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
								}`}
							style={isCurrentPage ? { backgroundColor: primaryColor } : {}}
						>
							{pageNumber}
						</button>
					);
				})}
			</div>

			{/* Next Button */}
			<div className="flex items-center gap-2">
				<button
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className="py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default Pagination;
