'use client';

import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import LogoUpload from './LogoUpload';
import AddShiftHourModal from './AddShiftHourModal';
import AddCurrencyModal from './AddCurrencyModal';
import AddBusinessHourModal from './AddBusinessHourModal';
import { Pencil1Icon } from '@radix-ui/react-icons';

interface CompanyDetailsProps {
	className?: string;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ className = '' }) => {
	const [activeTab, setActiveTab] = useState<'company-detail' | 'business-hour' | 'currencies'>('company-detail');
	const [isEditMode, setIsEditMode] = useState(false);
	const [isBusinessHourEditMode, setIsBusinessHourEditMode] = useState(false);
	const [isAddShiftHourModalOpen, setIsAddShiftHourModalOpen] = useState(false);
	const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
	const [isAddBusinessHourModalOpen, setIsAddBusinessHourModalOpen] = useState(false);
	const [selectedShiftHour, setSelectedShiftHour] = useState<any>(null);
	const [currencies, setCurrencies] = useState<any[]>([]);
	const [businessHours, setBusinessHours] = useState<any[]>([]);
	const [formData, setFormData] = useState({
		companyName: 'Uconnect',
		phoneNumber: '',
		website: '',
		state: '',
		country: '',
		timeZone: '(GMT 1:0) Western African Time (Africa/Lagos)',
	});
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

	const handleSave = () => {
		console.log('Saving company details:', formData);
		setIsEditMode(false);
		// Implement save logic here
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

	return (
		<div className={`w-full h-full ${className}`}>
			{/* Header with Edit Button */}
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-gray-900">Company Details</h1>
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

			{/* Tabs */}
			<div className="mb-6 border-b border-gray-200">
				<div className="flex gap-8">
					<button
						onClick={() => setActiveTab('company-detail')}
						className={`pb-4 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${
							activeTab === 'company-detail'
								? 'text-[#050711] border-[#050711]'
								: 'text-gray-600 border-transparent hover:text-gray-900'
						}`}
					>
						Company Detail
					</button>
					<button
						onClick={() => setActiveTab('business-hour')}
						className={`pb-4 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${
							activeTab === 'business-hour'
								? 'text-[#050711] border-[#050711]'
								: 'text-gray-600 border-transparent hover:text-gray-900'
						}`}
					>
						Business Hour
					</button>
					<button
						onClick={() => setActiveTab('currencies')}
						className={`pb-4 px-1 font-inter text-sm font-medium transition-colors border-b-2 ${
							activeTab === 'currencies'
								? 'text-[#050711] border-[#050711]'
								: 'text-gray-600 border-transparent hover:text-gray-900'
						}`}
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
									className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
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
						<label className="block text-sm font-medium text-gray-700 mb-2">LOGO</label>
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
								variant="outline"
								size="md"
								onClick={() => setIsEditMode(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSave}
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
								<h2 className="text-2xl font-semibold text-gray-900">
									Business Hour
								</h2>
								{!isBusinessHourEditMode && businessHourData.businessDays && (
									<button
										onClick={() => setIsBusinessHourEditMode(true)}
										className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
						<p className="text-gray-600 mb-6">
							Establish your organization's business hours to guide employees in scheduling and completing work activities within those operational times.
						</p>
						
						{businessHourData.businessDays ? (
							<div className="bg-white border border-gray-200 p-6 space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">Business days</label>
										{isBusinessHourEditMode ? (
											<Input
												value={businessHourData.businessDays}
												onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessDays: value }))}
												placeholder="Enter business days"
											/>
										) : (
											<p className="text-base text-gray-900 font-medium">{businessHourData.businessDays}</p>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<label className="block text-sm font-medium text-gray-500 mb-1">Business hours</label>
										{isBusinessHourEditMode ? (
											<Input
												value={businessHourData.businessHours}
												onChange={(value) => setBusinessHourData(prev => ({ ...prev, businessHours: value }))}
												placeholder="Enter business hours"
											/>
										) : (
											<p className="text-base text-gray-900 font-medium">{businessHourData.businessHours}</p>
										)}
									</div>
								</div>
								
								{isBusinessHourEditMode && (
									<div className="flex justify-end gap-3 pt-4">
										<Button
											variant="outline"
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
							<div className="bg-white border border-gray-200 p-6 min-h-[200px] flex items-center justify-center">
								<p className="text-gray-500">No business hours configured yet.</p>
							</div>
						)}
					</div>

					{/* Shift Hour Section */}
					<div>
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1">
								<h2 className="text-2xl font-semibold text-gray-900 mb-2">Shift Hour</h2>
								<p className="text-gray-600">
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
						<div className="bg-white border border-gray-200 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th>Shift Name</th>
											<th>Shift Days</th>
											<th>Shift Timing</th>
											<th>No of Users</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{shiftHours.length === 0 ? (
											<tr>
												<td colSpan={4} className="px-6 py-12 text-center text-gray-500">
													No shift hours configured yet.
												</td>
											</tr>
										) : (
											shiftHours.map((shift) => (
												<tr key={shift.id} className="hover:bg-gray-50 transition-colors">
													<td className="font-medium text-gray-900">{shift.shiftName}</td>
													<td>{shift.shiftDays}</td>
													<td>{shift.shiftStartTime} - {shift.shiftEndTime}</td>
													<td>{shift.noOfUsers}</td>
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
							<h2 className="text-2xl font-semibold text-gray-900 mb-2">Currencies</h2>
							<p className="text-gray-600">
								Configure your organization's currency settings on this page.
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
					<div className="bg-white border border-gray-200 p-6 min-h-[400px]">
						{currencies.length === 0 ? (
							<div className="flex items-center justify-center h-full">
								<p className="text-gray-500">No currencies configured yet.</p>
							</div>
						) : (
							<div className="space-y-4">
								{currencies.map((currency, index) => (
									<div key={index} className="border border-gray-200 p-4 rounded-lg">
										<p className="font-medium text-gray-900">{currency.name}</p>
										<p className="text-sm text-gray-600">Format: {currencyFormats[currency.code] || currency.symbol + ' 1,224,067.34'}</p>
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
	);
};

export default CompanyDetails;

