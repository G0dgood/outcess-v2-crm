'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';
import Textarea from './Textarea';
import DateInput from './DateInput';
import RadioSelect from './RadioSelect';
import Checkbox from './Checkbox';
import CheckboxSelect from './CheckboxSelect';
import { Cross2Icon, CalendarIcon, ClockIcon } from '@radix-ui/react-icons';
import { useSocket } from '@/contexts/SocketContext';
import { saveOfflineDisposition, saveSyncedDisposition, DispositionFieldEntry } from '@/utils/offlineDispositions';
import { toastSuccess, toastError, toastInfo } from '@/utils/toastWithSound';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useCreateDispositionMutation } from '@/store/services/dispositionApi';

interface FillDispositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave?: (data: DispositionFormState) => void;
	initialData?: Partial<DispositionFormState>;
	customerId?: string;
	customerName?: string;
}

interface ApiError {
	data?: {
		error?: string;
		message?: string;
	};
}

export type DispositionFormState = Record<string, string | number | boolean | undefined>;

interface DispositionField {
	id: string;
	name: string;
	color: string;
	fieldType: string;
	dropdownOptions?: string[];
	sortOrder?: string;
	isRequired: boolean;
}

// Helper to convert string to camelCase for state keys
const toCamelCase = (str: string) => {
	return str
		.toLowerCase()
		.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const FillDispositionModal: React.FC<FillDispositionModalProps> = ({
	isOpen,
	onClose,
	onSave,
	initialData,
	customerId,
	customerName,
}) => {
	const { isConnected, isOffline, send } = useSocket();
	const { user: authUser } = useAuth();
	const { lineOfBusinessData, selectedLineOfBusinessId } = useLineOfBusiness();
	const [createDisposition] = useCreateDispositionMutation();
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<DispositionFormState>({});

	// Get dispositions from context
	const dispositions = useMemo(() => {
		return (lineOfBusinessData?.lineOfBusiness?.dashboardSettings?.dispositions || []) as DispositionField[];
	}, [lineOfBusinessData]);

	// Reset or update form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			const initialForm: DispositionFormState = {};

			// Initialize with defaults or empty strings based on dispositions
			dispositions.forEach((d) => {
				const key = toCamelCase(d.name);
				if (d.fieldType === 'date-time') {
					initialForm[`${key}_date`] = '';
					initialForm[`${key}_time`] = '';
				} else {
					initialForm[key] = '';
				}
			});

			// Merge with provided initialData
			if (initialData) {
				Object.keys(initialData).forEach(key => {
					initialForm[key] = initialData[key];
				});
			}

			setFormData(initialForm);
		} else {
			setFormData({});
		}
	}, [isOpen, initialData, dispositions]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleView = () => {
		console.log('View disposition:', formData);
		// Implement view logic
	};

	const handleSaveAndPost = async () => {
		// Basic validation
		const missingFields: string[] = [];
		dispositions.forEach((d) => {
			if (d.isRequired) {
				const key = toCamelCase(d.name);
				if (d.fieldType === 'date-time') {
					if (!formData[`${key}_date`] || !formData[`${key}_time`]) {
						missingFields.push(d.name);
					}
				} else {
					if (!formData[key]) {
						missingFields.push(d.name);
					}
				}
			}
		});

		if (missingFields.length > 0) {
			toastError(`Please fill in required fields: ${missingFields.join(', ')}`);
			return;
		}

		// Transform formData to array structure
		const dispositionData: DispositionFieldEntry[] = dispositions.map(d => {
			const key = toCamelCase(d.name);
			let value: string | number | boolean | undefined;

			if (d.fieldType === 'date-time') {
				const date = formData[`${key}_date`];
				const time = formData[`${key}_time`];
				if (date && time) {
					value = `${date} ${time}`;
				} else {
					value = String(date || time || '');
				}
			} else {
				value = formData[key];
			}

			return {
				fieldId: d.id,
				fieldName: d.name,
				fieldValue: value,
				fieldType: d.fieldType
			};
		});

		setIsSaving(true);
		try {
			// Always try to save via API first unless explicitly offline
			try {
				if (!isOffline) {
					// Save via API
					await createDisposition({
						fillDisposition: dispositionData,
						customerId,
						agentId: authUser?.id,
						lineOfBusinessId: selectedLineOfBusinessId || undefined,
						timestamp: new Date().toISOString(),
					}).unwrap();

					// Try to send via socket or API
					if (send && isConnected) {
						send({
							type: 'disposition',
							payload: {
								fillDisposition: dispositionData,
								customerId,
								agentId: authUser?.id,
								lineOfBusinessId: selectedLineOfBusinessId || undefined,
								timestamp: new Date().toISOString(),
							},
						});
					}

					// Save to synced dispositions for history
					saveSyncedDisposition(
						dispositionData,
						customerId,
						customerName,
						authUser?.name,
						authUser?.id,
						selectedLineOfBusinessId || undefined
					);

					// Call the onSave callback
					onSave?.(formData);

					toastSuccess('Disposition saved successfully');
					onClose();
					return;
				}
			} catch (error: unknown) {
				console.error('Error saving disposition online:', error);

				// If the server returns a specific error message (e.g. validation error), show it
				const serverError = (error as ApiError)?.data?.error || (error as ApiError)?.data?.message;
				if (serverError) {
					toastError(serverError);
					// Do not return here - continue to save offline
				}
				// If API fails (e.g. network error or validation error), fall through to offline save
			}

			// If we're here, either we are offline OR the API call failed due to network issues or validation errors
			// Save to offline storage
			saveOfflineDisposition(dispositionData, customerId, customerName, selectedLineOfBusinessId || undefined);

			if (isOffline) {
				toastInfo('Disposition saved offline. It will sync when you\'re back online.');
			} else {
				// Show offline save message even if we already showed an error toast
				toastInfo('Disposition saved offline due to error. It will sync when connection is restored.');
			}

			onSave?.(formData);
			onClose();
		} catch (error) {
			console.error('Error saving disposition:', error);
			toastError('Failed to save disposition');
			onSave?.(formData);
			onClose();
		} finally {
			setIsSaving(false);
		}
	};

	if (!isOpen) return null;

	const renderField = (field: DispositionField) => {
		const key = toCamelCase(field.name);

		switch (field.fieldType) {
			case 'dropdown':
				return (
					<Dropdown
						key={field.id}
						label={field.name}
						placeholder="Select"
						options={(field.dropdownOptions || []).map((opt: string) => ({ value: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))}
						value={String(formData[key] || '')}
						onChange={(value) => handleInputChange(key)(Array.isArray(value) ? value.join(',') : value)}
					/>
				);

			case 'radio-select':
				return (
					<RadioSelect
						key={field.id}
						label={field.name}
						name={key}
						options={(field.dropdownOptions || []).map((opt: string) => ({ value: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))}
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
					/>
				);

			case 'checkbox':
				if (field.dropdownOptions && field.dropdownOptions.length > 0) {
					return (
						<CheckboxSelect
							key={field.id}
							label={field.name}
							options={(field.dropdownOptions || []).map((opt: string) => ({ value: opt, label: opt.charAt(0).toUpperCase() + opt.slice(1) }))}
							value={formData[key] ? String(formData[key]).split(',') : []}
							onChange={(vals: string[]) => handleInputChange(key)(vals.join(','))}
						/>
					);
				}
				return (
					<Checkbox
						key={field.id}
						label={field.name}
						checked={formData[key] === 'true'}
						onChange={(checked: boolean) => handleInputChange(key)(checked ? 'true' : 'false')}
					/>
				);

			case 'number':
				return (
					<Input
						key={field.id}
						label={field.name}
						placeholder=""
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
						type="number"
					/>
				);

			case 'phone':
				return (
					<Input
						key={field.id}
						label={field.name}
						placeholder=""
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
						type="tel"
					/>
				);

			case 'email':
				return (
					<Input
						key={field.id}
						label={field.name}
						placeholder=""
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
						type="email"
					/>
				);

			case 'multi-line-text':
				return (
					<Textarea
						key={field.id}
						label={field.name}
						placeholder=""
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
						rows={4}
					/>
				);

			case 'date':
				return (
					<div key={field.id} className="relative">
						<DateInput
							label={field.name}
							placeholder="DD/MM/YY"
							value={String(formData[key] || '')}
							onChange={handleInputChange(key)}
							inputClassName="pr-10"
						/>
						<button
							type="button"
							onClick={(e) => {
								// Find the input sibling and focus/click it
								const input = e.currentTarget.previousElementSibling?.querySelector('input');
								if (input) {
									try {
										(input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
									} catch {
										(input as HTMLInputElement).focus();
										(input as HTMLInputElement).click();
									}
								}
							}}
							className="absolute right-3 top-[38px] cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
							style={{ color: 'var(--text-tertiary)' }}
						>
							<CalendarIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
						</button>
					</div>
				);

			case 'date-time':
				return (
					<div key={field.id}>
						<label
							className="block text-sm font-medium dark:text-gray-300 mb-2"
							style={{ color: 'var(--text-secondary)' }}
						>
							{field.name}
						</label>
						<div className="grid grid-cols-2 gap-3">
							<div className="input-container relative">
								<input
									type="date"
									placeholder="DD/MM/YY"
									value={String(formData[`${key}_date`] || '')}
									onChange={(e) => handleInputChange(`${key}_date`)(e.target.value)}
									className="input-field pr-10"
								/>
								<button
									type="button"
									onClick={(e) => {
										const input = e.currentTarget.previousElementSibling as HTMLInputElement;
										if (input) {
											try {
												(input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
											} catch {
												input.focus();
												input.click();
											}
										}
									}}
									className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
									style={{ color: 'var(--text-tertiary)' }}
								>
									<CalendarIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
								</button>
							</div>
							<div className="input-container relative">
								<input
									type="time"
									placeholder="HH:MM"
									value={String(formData[`${key}_time`] || '')}
									onChange={(e) => handleInputChange(`${key}_time`)(e.target.value)}
									className="input-field pr-10"
								/>
								<button
									type="button"
									onClick={(e) => {
										const input = e.currentTarget.previousElementSibling as HTMLInputElement;
										if (input) {
											try {
												(input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
											} catch {
												input.focus();
												input.click();
											}
										}
									}}
									className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer dark:hover:text-gray-300 transition-colors z-10"
									style={{ color: 'var(--text-tertiary)' }}
								>
									<ClockIcon className="w-4 h-4 dark:text-gray-500" style={{ color: 'var(--text-tertiary)' }} />
								</button>
							</div>
						</div>
					</div>
				);

			case 'single-line-text':
			default:
				// Fallback for text or unknown types
				return (
					<Input
						key={field.id}
						label={field.name}
						placeholder=""
						value={String(formData[key] || '')}
						onChange={handleInputChange(key)}
						type="text"
					/>
				);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<h2
							className="text-xl font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Disposition
						</h2>
						{isOffline && (
							<span
								className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
								style={{
									backgroundColor: 'rgba(220, 53, 69, 0.1)',
									color: '#DC3545',
									border: '1px solid rgba(220, 53, 69, 0.2)'
								}}
							>
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
									/>
								</svg>
								Offline
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
							e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
							e.currentTarget.style.backgroundColor = 'transparent';
						}}
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{dispositions?.length > 0 ? (
							dispositions?.map((field) => renderField(field))
						) : (
							<div className="col-span-2 text-center py-8 text-gray-500">
								No disposition fields configured.
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div
					className="flex items-center gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					{isOffline && (
						<span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
								/>
							</svg>
							Will sync when online
						</span>
					)}
					<div className="flex items-center gap-3 ml-auto">
						<Button
							variant="outline"
							size="md"
							onClick={handleView}
						>
							View
						</Button>
						<Button
							variant="primary"
							size="md"
							onClick={handleSaveAndPost}
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : (isOffline ? 'Save Offline' : 'Save & Post')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FillDispositionModal;
