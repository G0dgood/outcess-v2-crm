import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { useCreateSetupBookMutation } from '@/store/services/setupBookApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';

interface FieldDefinition {
	id: string;
	name: string;
	type: 'text' | 'phone' | 'email' | 'number' | 'date';
	required: boolean;
}

interface CreateRecordModalProps {
	isOpen: boolean;
	fieldDefinitions: FieldDefinition[];
	onClose: () => void;
	searchId?: string;
}

interface ApiError {
	data?: {
		message?: string;
	};
}

const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
	isOpen,
	fieldDefinitions,
	onClose,
	searchId,
}) => {
	const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
	const { lineOfBusinessData } = useLineOfBusiness();
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;
	const companyIdRaw = lineOfBusinessData?.lineOfBusiness?.companyId;
	const companyId = typeof companyIdRaw === 'object' && companyIdRaw !== null
		? (companyIdRaw as { _id?: string; id?: string })._id || (companyIdRaw as { _id?: string; id?: string }).id
		: companyIdRaw as string | undefined;

	const [manualSearchId, setManualSearchId] = useState(searchId || '');
	const [createSetupBook, { isLoading }] = useCreateSetupBookMutation();

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setFormData({});
			setManualSearchId(searchId || '');
		}
	}, [isOpen, searchId]);

	if (!isOpen) return null;

	const handleInputChange = (fieldName: string, value: string) => {
		setFormData(prev => ({ ...prev, [fieldName]: value }));
	};

	const handleSave = async () => {
		// Validate required fields
		const missingFields = fieldDefinitions
			.filter(field => field.required && !formData[field.name])
			.map(field => field.name);

		if (missingFields.length > 0) {
			toast.error(`Please fill in required fields: ${missingFields.join(', ')}`);
			return;
		}

		if (!manualSearchId) {
			toast.error("Search ID is required");
			return;
		}

		if (lobId && companyId) {
			try {
				// Construct CSV content
				const headers = [...fieldDefinitions.map(f => f.name), 'searchId'].join(',');
				const values = [...fieldDefinitions.map(f => {
					const val = formData[f.name] || '';
					// Escape quotes and wrap in quotes if contains comma
					if (String(val).includes(',') || String(val).includes('"')) {
						return `"${String(val).replace(/"/g, '""')}"`;
					}
					return val;
				}), manualSearchId].join(',');

				const csvContent = `${headers}\n${values}`;
				const blob = new Blob([csvContent], { type: 'text/csv' });
				const file = new File([blob], 'record.csv', { type: 'text/csv' });

				const uploadFormData = new FormData();
				uploadFormData.append('companyId', companyId);
				uploadFormData.append('lineOfBusinessId', lobId);
				uploadFormData.append('searchId', manualSearchId);
				uploadFormData.append('file', file);

				await createSetupBook(uploadFormData).unwrap();

				toast.success("Record created successfully");
				onClose();
			} catch (error: unknown) {
				const apiError = error as ApiError;
				toast.error("Failed to create record", {
					description: apiError?.data?.message || "An error occurred while creating the record"
				});
			}
		} else {
			toast.error("Missing required IDs", {
				description: "Company ID or Line of Business ID is missing"
			});
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Create Setup Book
					</h2>
					<button
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Form */}
				<div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
					<Input
						label="Search ID"
						placeholder="Enter Search ID"
						value={manualSearchId}
						onChange={setManualSearchId}
						required
					/>
					{fieldDefinitions.map((field) => (
						<Input
							key={field.id}
							label={field.name}
							placeholder={`Enter ${field.name}`}
							value={String(formData[field.name] || '')}
							onChange={(value) => handleInputChange(field.name, value)}
							type={field.type === 'phone' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
							required={field.required}
						/>
					))}
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
						disabled={isLoading}
					>
						{isLoading ? 'Creating...' : 'Create Record'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CreateRecordModal;
