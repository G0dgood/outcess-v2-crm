'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import LogoUpload from './LogoUpload';
import AddShiftHourModal from './AddShiftHourModal';
import AddCurrencyModal from './AddCurrencyModal';
import AddBusinessHourModal from './AddBusinessHourModal';
import { ShiftHour } from './AddShiftHourModal';
import { Currency } from './AddCurrencyModal';
import { BusinessHourData } from './AddBusinessHourModal';
import { Pencil1Icon } from '@radix-ui/react-icons';
import PageHeading from './PageHeading';
import SupPageHeading from './SubPageHeading';
import { useGetCompanyByIdQuery, useUpdateCompanyMutation } from '@/store/services/companyApi';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import CompanyDetailsSkeleton from '@/components/skeletons/CompanyDetailsSkeleton';

interface CompanyDetailsProps {
	className?: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ className = '' }) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

	console.log('lineOfBusinessData-----', lineOfBusinessData?.lineOfBusiness?.companyId)

	const [activeTab, setActiveTab] = useState<'company-detail' | 'business-hour' | 'currencies'>('company-detail');
	const [isEditMode, setIsEditMode] = useState(false);
	const [isBusinessHourEditMode, setIsBusinessHourEditMode] = useState(false);
	const [isAddShiftHourModalOpen, setIsAddShiftHourModalOpen] = useState(false);
	const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
	const [isAddBusinessHourModalOpen, setIsAddBusinessHourModalOpen] = useState(false);
	const [selectedShiftHour, setSelectedShiftHour] = useState<ShiftHour | null>(null);
	const [currencies, setCurrencies] = useState<Currency[]>([]);
	const [businessHours, setBusinessHours] = useState<BusinessHourData[]>([]);
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

	// Fetch company details
	const { data: companyData, isLoading, error } = useGetCompanyByIdQuery(lineOfBusinessData?.lineOfBusiness?.companyId);

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
	const [businessHourData, setBusinessHourData] = useState({
		businessDays: 'Monday - Sunday',
		businessHours: '24 Hours',
	});
	const [shiftHours, setShiftHours] = useState([
		{
			id: '1',
			shiftName: 'Morning Shift',
			shiftDays: 'Monday - Friday',
			shiftStartTime: '11:00 AM',
			shiftEndTime: '05:00 PM',
			noOfUsers: 3,
		},
	]);

	const handleInputChange = (field: string) => (value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			const payload = {
				companyName: formData.companyName,
				description: formData.description,
				phone: formData.phoneNumber,
				website: formData.website,
				country: formData.country,
				timeZone: formData.timeZone,
				logo: formData.logo,
				state: formData.state,
			};

			await updateCompany({
				id: lineOfBusinessData?.lineOfBusiness?.companyId,
				data: payload
			}).unwrap();

			toastSuccess('Company details updated successfully');
			setIsEditMode(false);
		} catch (err) {
			console.error('Failed to update company:', err);
			toastError('Failed to update company details');
		}
	};

	const formatTime = (time: string): string => {
		if (!time) return '';
		// Convert 24h format to 12h format for display
		const [hours, minutes] = time.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const currencyFormats: { [key: string]: string } = {
		NGN: '₦ 1,224,067.34',
		USD: '$ 1,224,067.34',
		GBP: '£ 1,224,067.34',
		EUR: '€ 1,224,067.34',
		JPY: '¥ 1,224,067',
		CAD: 'C$ 1,224,067.34',
		AUD: 'A$ 1,224,067.34',
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

				{!isEditMode && (
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
							className={`pb-2 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${activeTab === 'company-detail'
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
							className={`pb-2 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${activeTab === 'business-hour'
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
							className={`pb-2 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${activeTab === 'currencies'
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
								onFileSelect={(file) => {
									console.log('Logo selected:', file);
									// Handle logo upload
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
				)}

				{activeTab === 'business-hour' && (
					<div className="space-y-8">
						{/* Business Hour Section */}
						<div>
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<h2
										className="text-2xl font-semibold dark:text-gray-100"
										style={{ color: 'var(--text-primary)' }}
									>
										Business Hour
									</h2>
									{!isBusinessHourEditMode && businessHourData.businessDays && (
										<button
											onClick={() => setIsBusinessHourEditMode(true)}
											className="p-1 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
											style={{ color: 'var(--text-tertiary)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.color = 'var(--text-secondary)';
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.color = 'var(--text-tertiary)';
												e.currentTarget.style.backgroundColor = 'transparent';
											}}
											aria-label="Edit business hour"
										>
											<Pencil1Icon className="w-4 h-4" />
										</button>
									)}
								</div>
								<Button
									variant="primary"
									size="md"
									onClick={() => setIsAddBusinessHourModalOpen(true)}
								>
									Add Business Hour
								</Button>
							</div>
							<SupPageHeading
								text="Establish your organization's business hours to guide employees in scheduling and completing work activities within those operational times."
								className="dark:text-gray-400 mb-6"
								style={{ color: 'var(--text-tertiary)' }}
							/>

							{businessHourData.businessDays ? (
								<div
									className="dark:bg-gray-800 border dark:border-gray-700 p-6 space-y-4"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<div className="flex items-center justify-between">
										<div>
											<label
												className="block text-sm font-medium dark:text-gray-400 mb-1"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Business days
											</label>
											{isBusinessHourEditMode ? (
												<Input
													value={businessHourData.businessDays}
													onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessDays: value }))}
													placeholder="Enter business days" label={''} />
											) : (
												<p
													className="text-base dark:text-gray-100 font-medium"
													style={{ color: 'var(--text-primary)' }}
												>
													{businessHourData.businessDays}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-center justify-between">
										<div>
											<label
												className="block text-sm font-medium dark:text-gray-400 mb-1"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Business hours
											</label>
											{isBusinessHourEditMode ? (
												<Input
													value={businessHourData.businessHours}
													onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessHours: value }))}
													placeholder="Enter business hours" label={''} />
											) : (
												<p
													className="text-base dark:text-gray-100 font-medium"
													style={{ color: 'var(--text-primary)' }}
												>
													{businessHourData.businessHours}
												</p>
											)}
										</div>
									</div>

									{isBusinessHourEditMode && (
										<div className="flex justify-end gap-3 pt-4">
											<Button
												variant="danger"
												size="md"
												onClick={() => setIsBusinessHourEditMode(false)}
											>
												Cancel
											</Button>
											<Button
												variant="primary"
												size="md"
												onClick={() => {
													console.log('Saving business hour:', businessHourData);
													setIsBusinessHourEditMode(false);
												}}
											>
												Save
											</Button>
										</div>
									)}
								</div>
							) : (
								<div
									className="dark:bg-gray-800 border dark:border-gray-700 p-6 min-h-[200px] flex items-center justify-center"
									style={{
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)'
									}}
								>
									<p
										className="dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No business hours configured yet.
									</p>
								</div>
							)}
						</div>

						{/* Shift Hour Section */}
						<div>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<h2
										className="text-2xl font-semibold dark:text-gray-100 mb-2"
										style={{ color: 'var(--text-primary)' }}
									>
										Shift Hour
									</h2>
									<p
										className="dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										Manage employee schedules with ease using shift hours.
									</p>
								</div>
								<Button
									variant="primary"
									size="md"
									onClick={() => {
										setSelectedShiftHour(null);
										setIsAddShiftHourModalOpen(true);
									}}
								>
									New Shift Hour
								</Button>
							</div>

							{/* Shift Hours Table */}
							<div
								className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden"
								style={{
									backgroundColor: 'var(--accent-white)',
									borderColor: 'var(--light-gray)'
								}}
							>
								<div className="overflow-x-auto">
									<table
										className="min-w-full divide-y dark:divide-gray-700"
										style={{ borderColor: 'var(--light-gray)' }}
									>
										<thead
											className="dark:bg-gray-700 border-b dark:border-gray-700"
											style={{
												backgroundColor: 'var(--bg-primary)',
												borderColor: 'var(--light-gray)'
											}}
										>
											<tr>
												<th
													className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
													style={{ color: 'var(--text-primary)' }}
												>
													Shift Name
												</th>
												<th
													className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
													style={{ color: 'var(--text-primary)' }}
												>
													Shift Days
												</th>
												<th
													className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
													style={{ color: 'var(--text-primary)' }}
												>
													Shift Timing
												</th>
												<th
													className="px-6 py-3 text-left text-xs font-medium dark:text-gray-100 uppercase tracking-wider"
													style={{ color: 'var(--text-primary)' }}
												>
													No of Users
												</th>
											</tr>
										</thead>
										<tbody
											className="dark:bg-gray-800 divide-y dark:divide-gray-700"
											style={{
												backgroundColor: 'var(--accent-white)',
												borderColor: 'var(--light-gray)'
											}}
										>
											{shiftHours.length === 0 ? (
												<tr>
													<td
														colSpan={4}
														className="px-6 py-12 text-center dark:text-gray-400"
														style={{ color: 'var(--text-tertiary)' }}
													>
														No shift hours configured yet.
													</td>
												</tr>
											) : (
												shiftHours?.map((shift) => (
													<tr
														key={shift.id}
														className="dark:hover:bg-gray-700 transition-colors"
														style={{ borderColor: 'var(--light-gray)' }}
														onMouseEnter={(e) => {
															e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.backgroundColor = 'var(--accent-white)';
														}}
													>
														<td
															className="px-6 py-4 whitespace-nowrap font-medium dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{shift.shiftName}
														</td>
														<td
															className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{shift.shiftDays}
														</td>
														<td
															className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{shift.shiftStartTime} - {shift.shiftEndTime}
														</td>
														<td
															className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-100"
															style={{ color: 'var(--text-primary)' }}
														>
															{shift.noOfUsers}
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</div>
						</div>

						{/* Add/Edit Shift Hour Modal */}
						<AddShiftHourModal
							isOpen={isAddShiftHourModalOpen}
							onClose={() => {
								setIsAddShiftHourModalOpen(false);
								setSelectedShiftHour(null);
							}}
							onSave={(data) => {
								if (selectedShiftHour) {
									// Update existing shift hour
									setShiftHours(prev => prev.map(s => s.id === selectedShiftHour.id ? { ...data, id: selectedShiftHour.id } : s));
								} else {
									// Add new shift hour
									const newShift = {
										...data,
										id: Date.now().toString(),
										shiftStartTime: formatTime(data.shiftStartTime),
										shiftEndTime: formatTime(data.shiftEndTime),
									};
									setShiftHours(prev => [...prev, newShift]);
								}
								setIsAddShiftHourModalOpen(false);
								setSelectedShiftHour(null);
							}}
							initialData={selectedShiftHour}
						/>

						{/* Add Business Hour Modal */}
						<AddBusinessHourModal
							isOpen={isAddBusinessHourModalOpen}
							onClose={() => setIsAddBusinessHourModalOpen(false)}
							onSave={(data) => {
								console.log('Saving business hour:', data);
								// Format business hour data for display
								let displayDays = '';
								let displayHours = '';

								if (data.businessHourType === '24hours-7days') {
									displayDays = 'Monday - Sunday';
									displayHours = '24 Hours';
								} else if (data.businessHourType === '24hours-5days') {
									displayDays = 'Monday - Friday';
									displayHours = '24 Hours';
								} else if (data.businessHourType === 'custom') {
									if (data.businessDays && data.businessDays.length > 0) {
										const dayLabels: { [key: string]: string } = {
											monday: 'Monday',
											tuesday: 'Tuesday',
											wednesday: 'Wednesday',
											thursday: 'Thursday',
											friday: 'Friday',
											saturday: 'Saturday',
											sunday: 'Sunday',
										};
										const selectedDays = data.businessDays.map(d => dayLabels[d] || d);
										displayDays = selectedDays.join(', ');
									}

									if (data.businessTiming === 'same' && data.sameStartTime && data.sameEndTime) {
										displayHours = `${formatTime(data.sameStartTime)} - ${formatTime(data.sameEndTime)}`;
									} else if (data.businessTiming === 'different') {
										displayHours = 'Custom Hours';
									}
								}

								setBusinessHourData({
									businessDays: displayDays || businessHourData.businessDays,
									businessHours: displayHours || businessHourData.businessHours,
								});
								setBusinessHours([...businessHours, data]);
								setIsAddBusinessHourModalOpen(false);
							}}
						/>
					</div>
				)}

				{activeTab === 'currencies' && (
					<div className="space-y-6">
						{/* Header Section */}
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h2
									className="text-2xl font-semibold dark:text-gray-100 mb-2"
									style={{ color: 'var(--text-primary)' }}
								>
									Currencies
								</h2>
								<p
									className="dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Configure your organization&apos;s currency settings on this page.
								</p>
							</div>
							<Button
								variant="primary"
								size="md"
								onClick={() => {
									setIsAddCurrencyModalOpen(true);
								}}
							>
								Add Currency
							</Button>
						</div>

						{/* Currencies Content */}
						<div
							className="dark:bg-gray-800 border dark:border-gray-700 p-6 min-h-[400px]"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							{currencies.length === 0 ? (
								<div className="flex items-center justify-center h-full">
									<p
										className="dark:text-gray-400"
										style={{ color: 'var(--text-tertiary)' }}
									>
										No currencies configured yet.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{currencies.map((currency, index) => (
										<div
											key={index}
											className="border dark:border-gray-700 p-4 rounded-lg"
											style={{
												borderColor: 'var(--light-gray)',
												backgroundColor: 'var(--accent-white)'
											}}
										>
											<p
												className="font-medium dark:text-gray-100"
												style={{ color: 'var(--text-primary)' }}
											>
												{currency.name}
											</p>
											<p
												className="text-sm dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Format: {currencyFormats[currency.code] || currency.symbol + ' 1,224,067.34'}
											</p>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Add Currency Modal */}
						<AddCurrencyModal
							isOpen={isAddCurrencyModalOpen}
							onClose={() => setIsAddCurrencyModalOpen(false)}
							onConfirm={(currency) => {
								setCurrencies(prev => [...prev, currency]);
								setIsAddCurrencyModalOpen(false);
							}}
						/>
					</div>
				)}

			</div>
		</div>
	);
};

export default CompanyDetails;
