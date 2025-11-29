'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import { businessSizeOptions, industryOptions, timeZoneOptions } from '@/components/Options';
import { useSetup } from '@/contexts/SetupContext';

export default function SetupPage() {
	const { setupData, updateSetupData } = useSetup();
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = (field: string) => (value: string) => {
		updateSetupData({ [field]: value });
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleSelectChange = (field: string) => (value: string) => {
		updateSetupData({ [field]: value });
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};







	return (
		<div className="w-full h-[70vh]">
			<div className="mb-8">
				<h1
					className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
					style={{ color: 'var(--text-secondary)' }}
				>
					Basic Setup
				</h1>
				<p
					className="font-lato not-italic font-normal text-[16px] leading-[150%] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Configure your organization details and preferences
				</p>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="box-border w-full h-[97px] border-b dark:border-gray-700 mb-6 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-xl font-semibold dark:text-gray-100 mb-1"
						style={{ color: 'var(--text-primary)' }}
					>
						Company Information
					</h2>
					<p
						className="font-lato text-sm dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your company details
					</p>
				</div>

				<form className="space-y-6 p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-5">
							<Input
								label="Company Name"
								placeholder="Enter company name"
								value={setupData.companyName}
								onChange={handleInputChange('companyName')}
								required
								error={errors.companyName}
							/>

							<Dropdown
								label="Time Zone"
								placeholder="Select time zone"
								options={timeZoneOptions}
								value={setupData.timeZone}
								onChange={(value) => handleSelectChange('timeZone')(Array.isArray(value) ? value[0] : value)}
								required
								error={errors.timeZone}
							/>
						</div>

						<div className="space-y-5">
							<Dropdown
								label="Industry"
								placeholder="Select industry"
								options={industryOptions}
								value={setupData.industry}
								onChange={(value) => handleSelectChange('industry')(Array.isArray(value) ? value[0] : value)}
								required
								error={errors.industry}
							/>

							<Dropdown
								label="Business Size"
								placeholder="Select Size"
								options={businessSizeOptions}
								value={setupData.businessSize}
								onChange={(value) => handleSelectChange('businessSize')(Array.isArray(value) ? value[0] : value)}
								required
								error={errors.businessSize}
							/>
						</div>
					</div>

				</form>
			</div>
		</div>
	);
}
