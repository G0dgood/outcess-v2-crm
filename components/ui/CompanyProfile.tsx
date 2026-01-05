'use client';

import React from 'react';
import Button from './Button';
import Input from './Input';
import LogoUpload from './LogoUpload';

interface FormData {
	companyName: string;
	phoneNumber: string;
	website: string;
	state: string;
	country: string;
	timeZone: string;
	description: string;
	logo: string;
}

interface CompanyProfileProps {
	formData: FormData;
	handleInputChange: (field: string) => (value: string) => void;
	isEditMode: boolean;
	setIsEditMode: (value: boolean) => void;
	handleSave: () => void;
	isUpdating: boolean;
	logoFile: File | null;
	setLogoFile: (file: File | null) => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({
	formData,
	handleInputChange,
	isEditMode,
	setIsEditMode,
	handleSave,
	isUpdating,
	logoFile,
	setLogoFile
}) => {
	return (
		<div className="space-y-6">
			{/* Form Fields */}
			<div className="space-y-6">
				<Input
					label="Company Name"
					placeholder="Enter company name"
					value={formData.companyName}
					onChange={handleInputChange('companyName')}
					disabled={!isEditMode}
				/>
				<Input
					label="Description"
					placeholder="Enter description"
					value={formData.description}
					onChange={handleInputChange('description')}
					disabled={!isEditMode}
				/>
				<Input
					label="Phone Number"
					placeholder="Enter phone number"
					value={formData.phoneNumber}
					onChange={handleInputChange('phoneNumber')}
					type="tel"
					disabled={!isEditMode}
				/>
				<Input
					label="Website"
					placeholder="Enter website"
					value={formData.website}
					onChange={handleInputChange('website')}
					disabled={!isEditMode}
				/>
				<Input
					label="State"
					placeholder="Enter state"
					value={formData.state}
					onChange={handleInputChange('state')}
					disabled={!isEditMode}
				/>
				<Input
					label="Country"
					placeholder="Enter country"
					value={formData.country}
					onChange={handleInputChange('country')}
					disabled={!isEditMode}
				/>
				<div className="relative">
					<Input
						label="Time Zone"
						placeholder="Select time zone"
						value={formData.timeZone}
						onChange={handleInputChange('timeZone')}
						disabled={!isEditMode}
						inputClassName="pr-10"
					/>
					{isEditMode && (
						<button
							type="button"
							className="absolute right-3 bottom-3 dark:text-gray-400 dark:hover:text-gray-200"
							style={{ color: 'var(--text-tertiary)' }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--text-secondary)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--text-tertiary)';
							}}
							aria-label="Edit time zone"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
					)}
				</div>
			</div>

			{/* Logo Upload Section */}
			<div>
				<label
					className="block text-sm font-medium dark:text-gray-300 mb-2"
					style={{ color: 'var(--text-secondary)' }}
				>
					LOGO
				</label>
				<LogoUpload
					label=""
					value={logoFile || formData.logo}
					onFileSelect={(file) => {
						setLogoFile(file);
					}}
					disabled={!isEditMode}
				/>
			</div>

			{/* Action Buttons (when in edit mode) */}
			{isEditMode && (
				<div className="flex justify-end gap-3 pt-4">
					<Button
						variant="danger"
						size="md"
						onClick={() => setIsEditMode(false)}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
						loading={isUpdating}
						disabled={isUpdating}
					>
						Save
					</Button>
				</div>
			)}
		</div>
	);
};

export default CompanyProfile;
