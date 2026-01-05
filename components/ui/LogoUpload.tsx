'use client';

import React, { useState, useRef } from 'react';
import Icon from './Icon';

interface LogoUploadProps {
	label?: string;
	onFileSelect?: (file: File | null) => void;
	acceptedTypes?: string[];
	maxSize?: number; // in MB
	minDimensions?: { width: number; height: number };
	className?: string;
	disabled?: boolean;
	error?: string;
	value?: File | string | null; // File object, URL string, or null
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
	label = 'Logo',
	onFileSelect,
	acceptedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'],
	maxSize = 5, // 5MB default
	minDimensions = { width: 174, height: 28 },
	className = '',
	disabled = false,
	error,
	value
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Update preview when value changes
	React.useEffect(() => {
		if (typeof value === 'string') {
			setPreviewUrl(value);
		} else if (value instanceof File) {
			setPreviewUrl(URL.createObjectURL(value));
		} else if (value === null) {
			setPreviewUrl(null);
		}
	}, [value]);

	// Handle file validation
	const validateFile = (file: File): string | null => {
		// Check file type
		if (!acceptedTypes.includes(file.type)) {
			return `File type not supported. Please upload ${acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} files.`;
		}

		// Check file size
		if (file.size > maxSize * 1024 * 1024) {
			return `File size must be less than ${maxSize}MB.`;
		}

		return null;
	};

	// Handle file selection
	const handleFileSelect = (file: File) => {
		const validationError = validateFile(file);
		if (validationError) {
			// You could show a toast or set an error state here
			console.error(validationError);
			return;
		}

		// Create preview URL
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);

		// Call the callback
		onFileSelect?.(file);
	};

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	// Handle drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!disabled) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		if (disabled) return;

		const files = Array.from(e.dataTransfer.files);
		const file = files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	// Handle click to open file dialog
	const handleClick = (e: React.MouseEvent) => {
		if (disabled) {
			e.preventDefault();
			return;
		}
		// If clicking on the remove button or its container, don't trigger file input
		if ((e.target as HTMLElement).closest('button')) {
			e.preventDefault();
			return;
		}
	};

	// Handle remove file
	const handleRemove = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent default label behavior
		e.stopPropagation(); // Stop propagation
		setPreviewUrl(null);
		onFileSelect?.(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};



	return (
		<div className={`logo-upload-container ${className}`}>
			{label && (
				<label className="font-inter text-base font-medium text-[#050711] mb-4 block">
					{label}
				</label>
			)}

			<label
				className={`border-2 border-dashed transition-colors cursor-pointer block ${isDragOver
					? 'border-blue-400 bg-blue-50'
					: error
						? 'border-red-300 bg-red-50'
						: 'border-gray-300 hover:border-gray-400'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				{previewUrl ? (
					<div className="p-4 text-center">
						<div className="relative inline-block">
							<img
								src={previewUrl}
								alt="Logo preview"
								className="max-h-16 max-w-48 object-contain"
							/>
							{!disabled && (
								<button
									type="button"
									onClick={handleRemove}
									className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10"
								>
									×
								</button>
							)}
						</div>
						<p className="font-inter text-sm text-gray-600 mt-2">Click to change logo</p>
					</div>
				) : (
					<div className="p-8 text-center">
						<div className="flex flex-col items-center">
							<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Icon name="upload-cloud" />
							</div>
							<p className="font-inter text-sm font-medium text-[#050711] mb-2">
								Drag and Drop or Upload Organization Logo
							</p>
							<p className="font-lato text-xs text-gray-600">
								We recommend you to upload a jpg / jpeg / png file with a minimum dimension of {minDimensions.width}w x {minDimensions.height}h and less than {maxSize}MB
							</p>
						</div>
					</div>
				)}

				<input
					ref={fileInputRef}
					type="file"
					accept={acceptedTypes.join(',')}
					onChange={handleInputChange}
					className="hidden"
					disabled={disabled}
				/>
			</label>

			{error && (
				<p className="font-lato text-sm text-red-600 mt-2">{error}</p>
			)}
		</div>
	);
};

export default LogoUpload;
