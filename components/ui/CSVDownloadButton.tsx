'use client';

import React, { useState } from 'react';
import Button from './Button';
import { toastError, toastWarning } from '@/utils/toastWithSound';

interface CSVDownloadButtonProps<T> {
	/**
	 * Async function to fetch the raw items to export.
	 * It should return the raw data array.
	 */
	fetchData: () => Promise<T[]>;
	/**
	 * Function to format a raw item into a flat row object.
	 */
	formatItem: (item: T) => Record<string, unknown>;
	/**
	 * The name of the downloaded file.
	 */
	fileName?: string;
	/**
	 * Custom button text or loading text.
	 */
	buttonText?: string;
	loadingText?: string;
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	disabled?: boolean;
}

export function CSVDownloadButton<T>({
	fetchData,
	formatItem,
	fileName = 'export.csv',
	buttonText = 'Download',
	loadingText = 'Downloading...',
	variant = 'primary',
	size = 'md',
	className = '',
	disabled = false,
}: CSVDownloadButtonProps<T>) {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = async () => {
		if (isDownloading) return;
		setIsDownloading(true);

		try {
			const rawItems = await fetchData();
			if (!rawItems || rawItems.length === 0) {
				toastWarning('No records found to download.');
				setIsDownloading(false);
				return;
			}

			// Format items matching the table layout
			const listToExport = rawItems.map(formatItem);

			// Extract all distinct headers
			const headers = new Set<string>();
			const priorityHeaders = ['Agent ID', 'Agent Name', 'Date', 'Customer Name'];
			listToExport.forEach((item) => {
				Object.keys(item).forEach((key) => {
					headers.add(key);
				});
			});
			const headerArray = Array.from(headers).sort((a, b) => {
				const indexA = priorityHeaders.indexOf(a);
				const indexB = priorityHeaders.indexOf(b);
				if (indexA !== -1 && indexB !== -1) return indexA - indexB;
				if (indexA !== -1) return -1;
				if (indexB !== -1) return 1;
				return a.localeCompare(b);
			});

			// Generate CSV content
			const csvRows = [];
			// Headers row
			csvRows.push(headerArray.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));
			// Data rows
			listToExport.forEach((item) => {
				const rowValues = headerArray.map((header) => {
					const val = item[header] === undefined || item[header] === null ? '' : String(item[header]);
					return `"${val.replace(/"/g, '""')}"`;
				});
				csvRows.push(rowValues.join(','));
			});

			const csvContent = csvRows.join('\n');
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.setAttribute('href', url);
			link.setAttribute('download', fileName);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (err) {
			console.error('Failed to export CSV:', err);
			toastError('Failed to generate report export. Please try again.');
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleDownload}
			disabled={disabled || isDownloading}
			className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
		>
			{isDownloading ? loadingText : buttonText}
		</Button>
	);
};

export default CSVDownloadButton;
