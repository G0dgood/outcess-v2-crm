'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { SetupHeader } from '@/components/ui/SetupHeader';
import { SetupSidebar } from '@/components/ui/SetupSidebar';
import Image from 'next/image';
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

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!setupData.companyName.trim()) {
			newErrors.companyName = 'Company name is required';
		}

		if (!setupData.timeZone) {
			newErrors.timeZone = 'Time zone is required';
		}

		if (!setupData.industry) {
			newErrors.industry = 'Industry is required';
		}

		if (!setupData.businessSize) {
			newErrors.businessSize = 'Business size is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};





	return (
		<div className="w-full h-[70vh]">
			<div className="mb-8">
				<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050] dark:text-gray-100">Basic Setup</h1>
				<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280] dark:text-gray-400">Configure your organization details and preferences</p>
			</div>

			<div className="bg-(--accent-white) dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full h-full">
				<div className="box-border w-full h-[97px] border-b border-[#E5E7EB] dark:border-gray-700 mb-6 p-6">
					<h2 className="font-inter text-xl font-semibold text-[#050711] dark:text-gray-100 mb-1">Company Information</h2>
					<p className="font-lato text-sm text-gray-600 dark:text-gray-400">Configure your company details</p>
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
								onChange={handleSelectChange('timeZone')}
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
								onChange={handleSelectChange('industry')}
								required
								error={errors.industry}
							/>

							<Dropdown
								label="Business Size"
								placeholder="Select Size"
								options={businessSizeOptions}
								value={setupData.businessSize}
								onChange={handleSelectChange('businessSize')}
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
