import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Input from '@/components/ui/Input';
import { useUpdateSetupBookRecordsMutation } from '@/store/services/setupBookApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';

interface FieldDefinition {
	id: string;
	name: string;
	type: 'text' | 'phone' | 'email' | 'number' | 'date';
	required: boolean;
}

interface EditRecordModalProps {
	isOpen: boolean;
	record: Record<string, string | number | boolean | null> | null;
	fieldDefinitions: FieldDefinition[];
	onClose: () => void;
	onSave: (updatedRecord: Record<string, string | number | boolean | null>) => void;
}

interface ApiError {
	data?: {
		message?: string;
	};
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
	isOpen,
	record,
	fieldDefinitions,
	onClose,
	onSave,
}) => {
	const [formData, setFormData] = useState<Record<string, string | number | boolean | null> | null>(null);
	const { lineOfBusinessData } = useLineOfBusiness();
	const lobId = lineOfBusinessData?.lineOfBusiness?._id || lineOfBusinessData?.lineOfBusiness?.id;
	const [updateSetupBookRecords, { isLoading }] = useUpdateSetupBookRecordsMutation();

	useEffect(() => {
		if (isOpen && record) {
			setFormData({ ...record });
		}
	}, [isOpen, record]);

	if (!isOpen || !formData) return null;

	const handleInputChange = (fieldName: string, value: string) => {
		setFormData(prev => prev ? { ...prev, [fieldName]: value } : null);
	};

	const handleSave = async () => {
		if (formData && lobId) {
			try {
				const { id, ...updateData } = formData;
				await updateSetupBookRecords({
					lineOfBusinessId: lobId,
					data: {
						id: id,
						update: updateData
					}
				}).unwrap();

				toast.success("Record updated successfully");
				onSave(formData);
				onClose();
			} catch (error: unknown) {
				const apiError = error as ApiError;
				toast.error("Failed to update record", {
					description: apiError?.data?.message || "An error occurred while updating the record"
				});
			}
		} else if (!lobId) {
			toast.error("Missing Line of Business ID");
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg rounded-[var(--radius)] overflow-hidden"
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
						Edit Record
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors !p-1"
						style={{ color: 'var(--text-tertiary)' }}
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>

				{/* Modal Form */}
				<div className="p-6 space-y-4">
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
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EditRecordModal;
