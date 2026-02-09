'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import PageHeading from './PageHeading';
import { useGetCompanyByIdQuery, useUpdateCompanyMutation } from '@/store/services/companyApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import CompanyDetailsSkeleton from '@/components/skeletons/CompanyDetailsSkeleton';
import CompanyProfile from './CompanyProfile';
import BusinessHours from './BusinessHours';
import Currencies from './Currencies';

interface CompanyDetailsProps {
	className?: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ className = '' }) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

	const [activeTab, setActiveTab] = useState<'company-detail' | 'business-hour' | 'currencies'>('company-detail');
	const [isEditMode, setIsEditMode] = useState(false);

	const [formData, setFormData] = useState({
		companyName: '',
		phoneNumber: '',
		website: '',
		state: '',
		country: '',
		timeZone: '(GMT 1:0) Western African Time (Africa/Lagos)',
		description: '',
		logo: '',
	});
	const [logoFile, setLogoFile] = useState<File | null>(null);

	// Fetch company details
	const { data: companyData, isLoading } = useGetCompanyByIdQuery(lineOfBusinessData?.lineOfBusiness?.companyId);

	useEffect(() => {
		if (companyData?.company) {
			const { company } = companyData;
			setFormData(prev => ({
				...prev,
				companyName: company.companyName || '',
				phoneNumber: company.phoneNumber || company.phone || '',
				website: company.website || '',
				state: company.state || '',
				country: company.country || '',
				timeZone: company.timeZone || prev.timeZone,
				description: company.description || '',
				logo: company.logo || '',
			}));
		}
	}, [companyData]);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			const payload = new FormData();
			payload.append('companyName', formData.companyName);
			payload.append('description', formData.description);
			payload.append('phone', formData.phoneNumber);
			payload.append('website', formData.website);
			payload.append('country', formData.country);
			payload.append('timeZone', formData.timeZone);
			payload.append('state', formData.state);

			if (logoFile) {
				payload.append('logo', logoFile);
			}

			await updateCompany({
				id: lineOfBusinessData?.lineOfBusiness?.companyId,
				data: payload
			}).unwrap();

			toastSuccess('Company details updated successfully');
			setIsEditMode(false);
			setLogoFile(null);
		} catch (err) {
			console.error('Failed to update company:', err);
			toastError('Failed to update company details');
		}
	};

	if (isLoading) {
		return <CompanyDetailsSkeleton className={className} />;
	}

	return (
		<div className={`w-full h-full pb-8 ${className}`}>
			{/* Header with Edit Button */}
			<div className="mb-6 flex items-center justify-between">
				<PageHeading
					text="Company Details"
				/>

				{!isEditMode && activeTab === 'company-detail' && (
					<Button
						variant="primary"
						size="md"
						onClick={() => setIsEditMode(true)}
					>
						Edit
					</Button>
				)}
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				{/* Tabs */}
				<div
					className="mb-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab('company-detail')}
							className={`pb-2 px-1 font-inter text-[10px] md:text-[12px] font-medium transition-colors border-b-2 ${activeTab === 'company-detail'
								? 'dark:text-gray-100 dark:border-gray-100'
								: 'dark:text-gray-400 border-transparent dark:hover:text-gray-200'
								}`}
							style={activeTab === 'company-detail' ? {
								color: 'var(--text-primary)',
								borderBottomColor: 'var(--text-primary)'
							} : {
								color: 'var(--text-tertiary)',
								borderBottomColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								if (activeTab !== 'company-detail') {
									e.currentTarget.style.color = 'var(--text-primary)';
								}
							}}
							onMouseLeave={(e) => {
								if (activeTab !== 'company-detail') {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}
							}}
						>
							Company Details
						</button>
						<button
							onClick={() => setActiveTab('business-hour')}
							className={`pb-2 px-1 font-inter text-[10px] md:text-[12px] font-medium transition-colors border-b-2 ${activeTab === 'business-hour'
								? 'dark:text-gray-100 dark:border-gray-100'
								: 'dark:text-gray-400 border-transparent dark:hover:text-gray-200'
								}`}
							style={activeTab === 'business-hour' ? {
								color: 'var(--text-primary)',
								borderBottomColor: 'var(--text-primary)'
							} : {
								color: 'var(--text-tertiary)',
								borderBottomColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								if (activeTab !== 'business-hour') {
									e.currentTarget.style.color = 'var(--text-primary)';
								}
							}}
							onMouseLeave={(e) => {
								if (activeTab !== 'business-hour') {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}
							}}
						>
							Business Hour
						</button>
						<button
							onClick={() => setActiveTab('currencies')}
							className={`pb-2 px-1 font-inter text-[10px] md:text-[12px] font-medium transition-colors border-b-2 ${activeTab === 'currencies'
								? 'dark:text-gray-100 dark:border-gray-100'
								: 'dark:text-gray-400 border-transparent dark:hover:text-gray-200'
								}`}
							style={activeTab === 'currencies' ? {
								color: 'var(--text-primary)',
								borderBottomColor: 'var(--text-primary)'
							} : {
								color: 'var(--text-tertiary)',
								borderBottomColor: 'transparent'
							}}
							onMouseEnter={(e) => {
								if (activeTab !== 'currencies') {
									e.currentTarget.style.color = 'var(--text-primary)';
								}
							}}
							onMouseLeave={(e) => {
								if (activeTab !== 'currencies') {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}
							}}
						>
							Currencies
						</button>
					</div>
				</div>

				{/* Tab Content */}
				{activeTab === 'company-detail' && (
					<CompanyProfile
						formData={formData}
						handleInputChange={handleInputChange}
						isEditMode={isEditMode}
						setIsEditMode={setIsEditMode}
						handleSave={handleSave}
						isUpdating={isUpdating}
						logoFile={logoFile}
						setLogoFile={setLogoFile}
					/>
				)}

				{activeTab === 'business-hour' && (
					<BusinessHours />
				)}

				{activeTab === 'currencies' && (
					<Currencies />
				)}

			</div>
		</div>
	);
};

export default CompanyDetails;
