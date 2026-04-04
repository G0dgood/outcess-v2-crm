'use client';
import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Dropdown from '@/components/ui/Dropdown';
import LogoUpload from '@/components/ui/LogoUpload';
import { businessSizeOptions, industryOptions, timeZoneOptions } from '@/components/Options';
import { useSetup } from '@/contexts/SetupContext';
import { SetupSkeleton } from '@/components/ui/SetupSkeleton';
import { useUserInfo } from '@/contexts/UserInfoContext';
import Button from '@/components/ui/Button';

export default function SetupPage() {
	const { setupData, updateSetupData, isDirty, onPersist, setCurrentStep } = useSetup();
	const { user } = useUserInfo();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [logoFile, setLogoFile] = useState<File | null>(setupData.logoFile || null);

	useEffect(() => {
		setCurrentStep(1);
	}, [setCurrentStep]);

	useEffect(() => {
		// Pre-populate company name from user profile if available
		if (user?.company?.companyName && !setupData?.companyName) {
			updateSetupData({ companyName: user?.company?.companyName });
		}
	}, [user?.company?.companyName, setupData.companyName, updateSetupData]);

	useEffect(() => {
		// Simulate initial loading for smooth transition or data fetching
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 800);
		return () => clearTimeout(timer);
	}, []);




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

	const handleLogoSelect = (file: File | null): void => {
		if (!file) {
			setLogoFile(null);
			updateSetupData({ logoFile: null, logo: '' });
			return;
		}

		setLogoFile(file);
		const logoUrl: string = URL.createObjectURL(file);
		updateSetupData({ 
			logoFile: file,
			logo: logoUrl
		});
	};

	if (isLoading) {
		return <SetupSkeleton />;
	}

	return (
		<div className="w-full h-[70vh]">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1
						className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
						style={{ color: 'var(--text-secondary)' }}
					>
						Basic Setup
					</h1>
					<p
						className="font-lato not-italic font-normal text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your organization details and preferences
					</p>
				</div>
				{isDirty && onPersist && (
					<Button
						variant="outline"
						size="md"
						onClick={() => onPersist?.(false)}
						className="w-full sm:w-auto"
					>
						Save
					</Button>
				)}
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full rounded-[var(--radius)] overflow-hidden"
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
						className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100 mb-1"
						style={{ color: 'var(--text-primary)' }}
					>
						Company Information
					</h2>
					<p
						className="font-lato text-[10px] md:text-[12px] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your company details
					</p>
				</div>

				<form className="space-y-6 p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-5">
							<Input
								label="Line of business name"
								placeholder="Enter line of business name"
								value={setupData.campaignName}
								onChange={handleInputChange('campaignName')}
								required
								error={errors.campaignName}
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

					<div className="pt-4">
						<LogoUpload
							label="Logo"
							value={logoFile || setupData.logo}
							onFileSelect={handleLogoSelect}
							acceptedTypes={['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg']}
							maxSize={5}
							minDimensions={{ width: 174, height: 28 }}
						/>
					</div>

				</form>
			</div>
		</div>
	);
}
