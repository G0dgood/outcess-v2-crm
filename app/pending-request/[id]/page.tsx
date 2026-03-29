'use client';

import React, { useState, use as usePromise } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import Tabs from '@/components/ui/Tabs';

function PendingRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
	usePromise(params);
	const router = useRouter();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { isDarkMode } = useTheme();
	const [activeTab, setActiveTab] = useState('basic-setup');
	const [reviewNotes, setReviewNotes] = useState('');

	// Sample pending business data
	const businessData = {
		companyName: 'Fairmoney',
		submittedDate: 'Jan 15, 2024',
		status: 'Pending',
		companyInfo: {
			companyName: 'Fairmoney',
			industry: 'Telecommunication',
			timeZone: 'UTC-5 (Eastern Time)',
			size: '50-100',
		},
		contactInfo: {
			contactPerson: 'John Doe',
			email: 'example@yourcompany.com',
		},
		brandingSettings: {
			menuLayout: 'Layout Style',
			layoutStyle: 'Compact',
			primaryColor: '#003399',
			secondaryColor: '#FF6600',
			logo: {
				url: '/logo.png',
				alt: 'OUTCESS™ Logo',
			},
		},
		dashboardSettings: {
			widgets: '3 Configured',
			disposition: '10 configured',
			dispositionTimeRangeView: 'Daily',
			dispositionChartType: 'Pie Chart',
		},
		customerBookSettings: {
			customFields: '6 Added',
			requiredFields: '4 Set',
		},
	};

	const tabs = [
		{ id: 'basic-setup', label: 'Basic Setup' },
		{ id: 'header-navigation', label: 'Header & Navigation' },
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'customer-book', label: 'Customer Book' },
	];

	const handleReject = () => {
		// TODO: Implement reject request logic
		router.push('/admin/pending-request');
	};

	const handleApprove = () => {
		// TODO: Implement approve business logic
		router.push('/admin/pending-request');
	};

	const activeColor = isDarkMode ? '#F3F4F6' : (lineOfBusinessData?.primaryColor || '#050711');

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<h1
						className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{businessData.companyName}
					</h1>
					<span
						className="inline-flex px-2 py-1 text-[8px] md:text-[10px] font-semibold rounded-full dark:bg-yellow-900/30 dark:text-yellow-400"
						style={{
							backgroundColor: 'rgba(251, 146, 60, 0.1)',
							color: '#EA580C'
						}}
					>
						{businessData.status}
					</span>
				</div>
				<p
					className="text-[10px] md:text-[12px] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Submitted: {businessData.submittedDate}
				</p>
			</div>

			{/* Navigation Tabs */}
			<Tabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(id) => setActiveTab(id)}
				activeColor={activeColor}
				className="mb-6"
			/>

			{/* Tab Content */}
			{activeTab === 'basic-setup' && (
				<>
					{/* Main Content - Two Column Information Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Company Information Card */}
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-6"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<h2
								className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Company Information
							</h2>
							<div className="space-y-4">
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Company Name
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.companyInfo.companyName}
									</p>
								</div>
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Industry
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.companyInfo.industry}
									</p>
								</div>
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Time Zone
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.companyInfo.timeZone}
									</p>
								</div>
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Size
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.companyInfo.size}
									</p>
								</div>
							</div>
						</div>

						{/* Contact Information Card */}
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-6"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<h2
								className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Contact Information
							</h2>
							<div className="space-y-4">
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Contact Person
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.contactInfo.contactPerson}
									</p>
								</div>
								<div>
									<span
										className="text-[10px] md:text-[12px] dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Email
									</span>
									<p
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.contactInfo.email}
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === 'header-navigation' && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<h2
						className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-6"
						style={{ color: 'var(--text-primary)' }}
					>
						Branding Setting
					</h2>
					<div className="space-y-6">
						{/* Menu Layout */}
						<div>
							<span
								className="text-[10px] md:text-[2px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Menu Layout
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.brandingSettings.menuLayout}
							</p>
						</div>

						{/* Layout Style */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Layout Style
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.brandingSettings.layoutStyle}
							</p>
						</div>

						{/* Theme Colors */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400 mb-2 block"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Theme color
							</span>
							<div className="flex items-center gap-4 mt-2">
								<div className="flex items-center gap-2">
									<div
										className="w-8 h-8 rounded-full dark:border-gray-600"
										style={{
											backgroundColor: businessData.brandingSettings.primaryColor,
											borderColor: 'var(--light-gray)'
										}}
									/>
									<span
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.brandingSettings.primaryColor}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<div
										className="w-8 h-8 rounded-full dark:border-gray-600"
										style={{
											backgroundColor: businessData.brandingSettings.secondaryColor,
											borderColor: 'var(--light-gray)'
										}}
									/>
									<span
										className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										{businessData.brandingSettings.secondaryColor}
									</span>
								</div>
							</div>
						</div>

						{/* Logo */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400 mb-2 block"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Logo
							</span>
							{businessData.brandingSettings.logo ? (
								<div className="flex items-center gap-3 mt-2">
									{businessData.brandingSettings.logo.url ? (
										<NextImage
											src={businessData.brandingSettings.logo.url}
											alt={businessData.brandingSettings.logo.alt || 'Company Logo'}
											width={0}
											height={0}
											sizes="100vw"
											className="h-10 w-auto object-contain"
										/>
									) : (
										<div className="flex items-center gap-2">
											<div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-orange-500 to-white rounded-full flex items-center justify-center">
												<span className="text-[8px] md:text-[10px] font-bold text-white">O</span>
											</div>
											<span
												className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												OUTCESS™
											</span>
										</div>
									)}
								</div>
							) : (
								<p
									className="text-[10px] md:text-[12px] dark:text-gray-400 mt-1"
									style={{ color: 'var(--text-tertiary)' }}
								>
									No logo uploaded
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{activeTab === 'dashboard' && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<h2
						className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-6"
						style={{ color: 'var(--text-primary)' }}
					>
						Dashboard Setup
					</h2>
					<div className="space-y-6">
						{/* Widgets */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Widgets
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.dashboardSettings.widgets}
							</p>
						</div>

						{/* Disposition */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Disposition
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.dashboardSettings.disposition}
							</p>
						</div>

						{/* Disposition Time Range View */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Disposition Time Range View
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.dashboardSettings.dispositionTimeRangeView}
							</p>
						</div>

						{/* Disposition Chart Type */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Disposition Chart Type
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.dashboardSettings.dispositionChartType}
							</p>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'customer-book' && (
				<div
					className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<h2
						className="text-[12px] md:text-[14px] font-semibold dark:text-gray-100 mb-6"
						style={{ color: 'var(--text-primary)' }}
					>
						Customer Book
					</h2>
					<div className="space-y-6">
						{/* Custom Fields */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Custom Fields
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.customerBookSettings.customFields}
							</p>
						</div>

						{/* Required Fields */}
						<div>
							<span
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Required Fields
							</span>
							<p
								className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mt-1"
								style={{ color: 'var(--text-primary)' }}
							>
								{businessData.customerBookSettings.requiredFields}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Review Notes Section */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<Textarea
					label="Review Notes"
					value={reviewNotes}
					onChange={setReviewNotes}
					placeholder="Add your review notes here..."
					rows={8}
					resize="none"
					className="mb-4"
					inputClassName="h-32"
				/>
				<div className="flex justify-end gap-3 mt-4">
					<Button
						variant="danger"
						size="md"
						onClick={handleReject}
					>
						Reject Request
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={handleApprove}
					>
						Approve Business
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PendingRequestDetailPage;
