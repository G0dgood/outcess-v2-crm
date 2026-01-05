import React from 'react';
import Button from '@/components/ui/Button';
import { DownloadIcon } from '@radix-ui/react-icons';

interface Field {
	name: string;
	[key: string]: unknown;
}

interface SampleCsvDownloaderProps {
	fields: Field[];
	className?: string;
	extraHeaders?: string[];
}

const SampleCsvDownloader: React.FC<SampleCsvDownloaderProps> = ({ fields, className, extraHeaders = [] }) => {
	const downloadSampleCsv = () => {
		const fieldHeaders = fields ? fields.map((field) => field.name) : [];
		
		// Combine field headers with extra headers, ensuring no duplicates
		const allHeaders = Array.from(new Set([...fieldHeaders, ...extraHeaders]));

		if (allHeaders.length === 0) {
			console.warn('No header fields defined for sample CSV.');
			return;
		}

		// Create CSV content (just headers)
		const csvContent = allHeaders.join(',');

		// Create a Blob
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

		// Create download link
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.setAttribute('href', url);
		link.setAttribute('download', 'sample_setup_book.csv');
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Button
			size="md"
			onClick={downloadSampleCsv}
			variant="outline"
			className={className}
		>
			<DownloadIcon className="w-4 h-4" />
			Sample CSV
		</Button>
	);
};

export default SampleCsvDownloader;
