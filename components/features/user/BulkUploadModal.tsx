'use client';

import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import { Cross2Icon, UploadIcon, FileTextIcon, CheckCircledIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useBulkUploadTeamMembersMutation } from '@/store/services/teamMembersApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';

interface BulkUploadModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface UploadResult {
	total: number;
	success: number;
	failed: number;
	errors?: { row: number; error: string }[];
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
	isOpen,
	onClose,
}) => {
	const { user } = useUserInfo();
	const { lineOfBusinessData } = useLineOfBusiness();
	const lineOfBusinessId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?._id || '';
	const companyId = user?.companyId || user?.company?._id || '';

	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<UploadResult | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [bulkUpload, { isLoading }] = useBulkUploadTeamMembersMutation();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
				toast.error(' Please upload a CSV file');
				return;
			}
			setFile(selectedFile);
			setResult(null);
		}
	};

	const handleUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);
		formData.append('lineOfBusinessId', lineOfBusinessId);
		formData.append('companyId', companyId);

		try {
			const res = await bulkUpload(formData).unwrap();
			setResult(res.summary ? { ...res.summary, errors: res.errors } : res);
			toast.success('Upload completed successfully');
			setFile(null);
		} catch (error: any) {
			console.error('Bulk upload failed:', error);
			toast.error(error?.data?.message || 'Failed to process bulk upload');
		}
	};

	const handleClose = () => {
		setFile(null);
		setResult(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div
				className="dark:bg-gray-800 w-full max-w-lg mx-4 overflow-hidden shadow-xl"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Bulk Upload Users
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						title="Close Modal"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
				</div>

				{/* Modal Content */}
				<div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
					{!result ? (
						<div className="space-y-4">
							<p className="text-[12px] dark:text-gray-400" style={{ color: 'var(--text-secondary)' }}>
								Upload a CSV file containing user details. Make sure to include all required fields:
								<span className="font-semibold"> Name, Email, Role, Password, User ID</span>.
							</p>

							<div
								className="border-2 border-dashed p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
								style={{ borderColor: 'var(--light-gray)' }}
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									type="file"
									ref={fileInputRef}
									className="hidden"
									accept=".csv"
									onChange={handleFileChange}
								/>
								<div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
									<UploadIcon className="w-6 h-6" />
								</div>
								<div className="text-center">
									<p className="text-[14px] font-medium dark:text-gray-200">
										{file ? file.name : 'Click to select or drag and drop'}
									</p>
									<p className="text-[12px] dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }}>
										Supported format: .csv
									</p>
								</div>
							</div>

							<div className="bg-blue-50 dark:bg-blue-900/20 p-4  flex gap-3">
								<FileTextIcon className="w-5 h-5 text-blue-600 shrink-0" />
								<div className="text-[12px] text-blue-800 dark:text-blue-300">
									<p className="font-semibold mb-1">Important Note</p>
									<p>Roles in the CSV must match existing role names exactly (case-insensitive).</p>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600">
								<div className="flex-1 text-center border-r dark:border-gray-600">
									<p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Total</p>
									<p className="text-[20px] font-bold dark:text-white">{result.total}</p>
								</div>
								<div className="flex-1 text-center border-r dark:border-gray-600">
									<p className="text-[10px] uppercase tracking-wider text-green-500 mb-1">Success</p>
									<p className="text-[20px] font-bold text-green-600 dark:text-green-400">{result.success}</p>
								</div>
								<div className="flex-1 text-center">
									<p className="text-[10px] uppercase tracking-wider text-red-500 mb-1">Failed</p>
									<p className="text-[20px] font-bold text-red-600 dark:text-red-400">{result.failed}</p>
								</div>
							</div>

							{result.errors && result.errors.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-[12px] font-semibold flex items-center gap-2 text-red-600">
										<ExclamationTriangleIcon className="w-4 h-4" />
										Errors Found
									</h3>
									<div className="max-h-[200px] overflow-y-auto border  divide-y dark:border-gray-700 dark:divide-gray-700">
										{result.errors.map((err, idx) => (
											<div key={idx} className="p-3 text-[11px] flex gap-3 items-start">
												<span className="font-mono text-gray-500 shrink-0">Row {err.row}</span>
												<span className="dark:text-gray-300">{err.error}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{result.success > 0 && (
								<div className="flex items-center gap-2 text-[12px] text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded">
									<CheckCircledIcon className="w-4 h-4" />
									Users created successfully. Refresh the list to see changes.
								</div>
							)}
						</div>
					)}
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-end items-center p-6 border-t dark:border-gray-700 gap-3"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					{!result ? (
						<>
							<Button variant="outline" size="md" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleUpload}
								disabled={!file || isLoading}
								loading={isLoading}
							>
								Process Upload
							</Button>
						</>
					) : (
						<Button variant="primary" size="md" onClick={handleClose}>
							Close
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default BulkUploadModal;
