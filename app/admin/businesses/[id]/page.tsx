'use client';

import React, { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import DeactivateBusinessModal from '@/components/ui/DeactivateBusinessModal';
import Pagination from '@/components/ui/Pagination';
import PaginationSummary from '@/components/ui/PaginationSummary';
import { CalendarIcon, MixerHorizontalIcon, UploadIcon } from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface BusinessDetailProps {
	params: {
		id: string;
	};
}

const BusinessDetailPage: React.FC<BusinessDetailProps> = ({ params }) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const [activeTab, setActiveTab] = useState('overview');
	const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(10);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [billingCurrentPage, setBillingCurrentPage] = useState(10);
	const [billingItemsPerPage, setBillingItemsPerPage] = useState(10);

	// Sample business data - in a real app, this would be fetched based on params.id
	const businessData = {
		businessId: '0123456',
		businessName: 'Fairmoney',
		status: 'Active',
		industry: 'Telecommunication',
		registrationDate: '11-05-2024',
		primaryContact: 'John Doe',
		email: 'Johndoe@company.com',
		phone: '08023456789',
		address: '65 Opebi Road, Ikeja, Lagos State',
		userCount: 45,
		lastBilling: '11-05-2024',
		activeModules: ['Dashboard', 'Setup Book', 'Customer Book', 'Report', 'Users'],
	};

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'users', label: 'Users' },
		{ id: 'billing', label: 'Billing' },
		{ id: 'activity-log', label: 'Activity Log' },
	];

	// Sample user data - in a real app, this would be fetched based on params.id
	const users = [
		{ id: '1', name: 'Jane Cooper', email: 'janeooper@renmoney.com', role: 'Admin' },
		{ id: '2', name: 'Esther Howard', email: 'estherhoward@renmoney.com', role: 'Supervisor' },
		{ id: '3', name: 'Savannah Nguyen', email: 'savannahnguyen@renmoney.com', role: 'Agent' },
		{ id: '4', name: 'Robert Fox', email: 'robertfox@renmoney.com', role: 'Agent' },
		{ id: '5', name: 'Dianne Russell', email: 'diannerussell@renmoney.com', role: 'Agent' },
		{ id: '6', name: 'Robert Fox', email: 'robertfox@renmoney.com', role: 'Agent' },
		{ id: '7', name: 'Esther Howard', email: 'estherhoward@renmoney.com', role: 'Supervisor' },
		{ id: '8', name: 'Jane Cooper', email: 'janecooper@renmoney.com', role: 'Supervisor' },
		{ id: '9', name: 'Savannah Nguyen', email: 'savannahnguyen@renmoney.com', role: 'Supervisor' },
		{ id: '10', name: 'Robert Fox', email: 'robertfox@renmoney.com', role: 'Agent' },
		{ id: '11', name: 'John Smith', email: 'johnsmith@renmoney.com', role: 'Agent' },
		{ id: '12', name: 'Mary Johnson', email: 'maryjohnson@renmoney.com', role: 'Agent' },
		{ id: '13', name: 'David Brown', email: 'davidbrown@renmoney.com', role: 'Supervisor' },
		{ id: '14', name: 'Emily Davis', email: 'emilydavis@renmoney.com', role: 'Agent' },
		{ id: '15', name: 'Michael Wilson', email: 'michaelwilson@renmoney.com', role: 'Agent' },
		{ id: '16', name: 'Sarah Martinez', email: 'sarahmartinez@renmoney.com', role: 'Admin' },
		{ id: '17', name: 'James Taylor', email: 'jamestaylor@renmoney.com', role: 'Agent' },
		{ id: '18', name: 'Lisa Anderson', email: 'lisaanderson@renmoney.com', role: 'Supervisor' },
		{ id: '19', name: 'Chris Thompson', email: 'christhompson@renmoney.com', role: 'Agent' },
		{ id: '20', name: 'Amanda White', email: 'amandawhite@renmoney.com', role: 'Agent' },
		{ id: '21', name: 'Kevin Harris', email: 'kevinharris@renmoney.com', role: 'Agent' },
		{ id: '22', name: 'Michelle Lee', email: 'michellelee@renmoney.com', role: 'Supervisor' },
		{ id: '23', name: 'Brian Clark', email: 'brianclark@renmoney.com', role: 'Agent' },
		{ id: '24', name: 'Jessica Lewis', email: 'jessicalewis@renmoney.com', role: 'Agent' },
		{ id: '25', name: 'Thomas Moore', email: 'thomasmoore@renmoney.com', role: 'Agent' },
		{ id: '26', name: 'Jennifer Walker', email: 'jenniferwalker@renmoney.com', role: 'Agent' },
		{ id: '27', name: 'Mark Jackson', email: 'markjackson@renmoney.com', role: 'Supervisor' },
		{ id: '28', name: 'Rachel Green', email: 'rachelgreen@renmoney.com', role: 'Agent' },
		{ id: '29', name: 'Daniel King', email: 'danielking@renmoney.com', role: 'Agent' },
		{ id: '30', name: 'Nicole Scott', email: 'nicolescott@renmoney.com', role: 'Agent' },
		{ id: '31', name: 'Anthony Wright', email: 'anthonywright@renmoney.com', role: 'Supervisor' },
		{ id: '32', name: 'Stephanie Adams', email: 'stephanieadams@renmoney.com', role: 'Agent' },
		{ id: '33', name: 'Ryan Baker', email: 'ryanbaker@renmoney.com', role: 'Agent' },
		{ id: '34', name: 'Lauren Gonzalez', email: 'laurengonzalez@renmoney.com', role: 'Agent' },
		{ id: '35', name: 'Brandon Nelson', email: 'brandonnelson@renmoney.com', role: 'Supervisor' },
		{ id: '36', name: 'Megan Carter', email: 'megancarter@renmoney.com', role: 'Agent' },
		{ id: '37', name: 'Justin Mitchell', email: 'justinmitchell@renmoney.com', role: 'Agent' },
		{ id: '38', name: 'Ashley Perez', email: 'ashleyperez@renmoney.com', role: 'Agent' },
		{ id: '39', name: 'Tyler Roberts', email: 'tylerroberts@renmoney.com', role: 'Supervisor' },
		{ id: '40', name: 'Brittany Turner', email: 'brittanyturner@renmoney.com', role: 'Agent' },
		{ id: '41', name: 'Jordan Phillips', email: 'jordanphillips@renmoney.com', role: 'Agent' },
		{ id: '42', name: 'Samantha Campbell', email: 'samanthacampbell@renmoney.com', role: 'Agent' },
		{ id: '43', name: 'Andrew Parker', email: 'andrewparker@renmoney.com', role: 'Admin' },
		{ id: '44', name: 'Mallory Evans', email: 'malloryevans@renmoney.com', role: 'Supervisor' },
		{ id: '45', name: 'Cameron Edwards', email: 'cameronedwards@renmoney.com', role: 'Agent' },
	];

	const totalPages = Math.ceil(users.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedUsers = useMemo(() => {
		return users.slice(startIndex, endIndex);
	}, [startIndex, endIndex]);

	// Sample billing data - in a real app, this would be fetched based on params.id
	const billingHistory = [
		{ id: '1', date: '13-11-2023', amount: 'N500,000', status: 'Paid' },
		{ id: '2', date: '13-12-2023', amount: 'N500,000', status: 'Paid' },
		{ id: '3', date: '11-02-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '4', date: '11-03-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '5', date: '11-04-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '6', date: '11-05-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '7', date: '11-06-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '8', date: '11-07-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '9', date: '11-08-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '10', date: '11-09-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '11', date: '11-10-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '12', date: '11-11-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '13', date: '11-12-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '14', date: '11-01-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '15', date: '11-02-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '16', date: '11-03-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '17', date: '11-04-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '18', date: '11-05-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '19', date: '11-06-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '20', date: '11-07-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '21', date: '11-08-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '22', date: '11-09-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '23', date: '11-10-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '24', date: '01-03-2025', amount: 'N500,000', status: 'Paid' },
	];

	const billingTotalPages = Math.ceil(billingHistory.length / billingItemsPerPage);
	const billingStartIndex = (billingCurrentPage - 1) * billingItemsPerPage;
	const billingEndIndex = billingStartIndex + billingItemsPerPage;
	const paginatedBilling = useMemo(() => {
		return billingHistory.slice(billingStartIndex, billingEndIndex);
	}, [billingStartIndex, billingEndIndex]);

	// Sample activity log data - in a real app, this would be fetched based on params.id
	const activityLog = [
		{
			id: '1',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Admin',
			action: 'User added',
			details: 'Jane Smith added to the CRM',
		},
		{
			id: '2',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'User',
			action: 'Subscription renewed',
			details: 'Plan renewed',
		},
		{
			id: '3',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Admin',
			action: 'Deactivated User',
			details: 'Deactivated a user named Mary',
		},
		{
			id: '4',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Admin',
			action: 'Reactivated User',
			details: 'Reactivated a user named John',
		},
		{
			id: '5',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Module Created',
			details: 'Created a custom module named **Customer SMS**',
		},
		{
			id: '6',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'User',
			action: 'Login',
			details: 'Login Successful',
		},
		{
			id: '7',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **Date** in the Customer SMS module',
		},
		{
			id: '8',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **Agent ID** in the Customer SMS module',
		},
		{
			id: '9',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **Country** in the Customer SMS module',
		},
		{
			id: '10',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **First Name** in the Customer SMS module',
		},
		{
			id: '11',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **First Name** in the Customer SMS module',
		},
		{
			id: '12',
			timestamp: '13-12-2023 14:23:45',
			user: 'Jane Doe',
			role: 'Supervisor',
			action: 'Added Field',
			details: 'Added a Field **First Name** in the Customer SMS module',
		},
	];

	// Helper function to render details with bold formatting
	const renderDetails = (details: string) => {
		// Replace **text** with <strong>text</strong>
		const parts = details.split(/(\*\*[^*]+\*\*)/g);
		return (
			<span
				className="text-sm dark:text-gray-100"
				style={{ color: 'var(--text-primary)' }}
			>
				{parts.map((part, index) => {
					if (part.startsWith('**') && part.endsWith('**')) {
						const text = part.slice(2, -2);
						return <strong key={index}>{text}</strong>;
					}
					return part;
				})}
			</span>
		);
	};

	const handleDeactivate = () => {
		setIsDeactivateModalOpen(true);
	};

	const handleConfirmDeactivate = (reason: string) => {
		console.log('Deactivate business:', params.id, 'Reason:', reason);
		// TODO: Implement deactivate business logic with reason
	};

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<h1
					className="text-2xl font-semibold dark:text-gray-100 mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Business Details
				</h1>
			</div>

			{/* Tabs and Deactivate Button */}
			<div
				className="flex items-center justify-between mb-6 border-b dark:border-gray-700"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				<div className="flex items-center gap-6">
					{tabs.map((tab) => {
						const isActive = activeTab === tab.id;
						const activeColor = lineOfBusinessData.primaryColor || '#2563EB';
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`pb-4 px-1 font-medium text-sm transition-colors ${isActive
									? 'dark:text-blue-400 border-b-2 dark:border-blue-400'
									: 'dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
									}`}
								style={isActive ? {
									color: activeColor,
									borderBottomColor: activeColor
								} : {
									color: 'var(--text-tertiary)'
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.color = 'var(--text-primary)';
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.color = 'var(--text-tertiary)';
									}
								}}
							>
								{tab.label}
							</button>
						);
					})}
				</div>
				<Button
					variant="danger"
					size="md"
					onClick={handleDeactivate}
				>
					Deactivate Business
				</Button>
			</div>

			{/* Overview Content */}
			{activeTab === 'overview' && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Basic Information Card */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<h2
							className="text-lg font-semibold dark:text-gray-100 mb-4"
							style={{ color: 'var(--text-primary)' }}
						>
							Basic Information
						</h2>
						<div className="space-y-4">
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Business ID:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.businessId}
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Status:
								</span>
								<span className="ml-2">
									<span
										className="inline-flex px-2 py-1 text-xs font-semibold rounded-full dark:bg-green-900/30 dark:text-green-400"
										style={{
											backgroundColor: 'rgba(34, 197, 94, 0.1)',
											color: '#16A34A'
										}}
									>
										{businessData.status}
									</span>
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Industry:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.industry}
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Registration Date:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.registrationDate}
								</span>
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
							className="text-lg font-semibold dark:text-gray-100 mb-4"
							style={{ color: 'var(--text-primary)' }}
						>
							Contact Information
						</h2>
						<div className="space-y-4">
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Primary Contact:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.primaryContact}
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Email:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.email}
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Phone:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.phone}
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Address:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.address}
								</span>
							</div>
						</div>
					</div>

					{/* Subscription Details Card */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<h2
							className="text-lg font-semibold dark:text-gray-100 mb-4"
							style={{ color: 'var(--text-primary)' }}
						>
							Subscription Details
						</h2>
						<div className="space-y-4">
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									User Count:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.userCount} active users
								</span>
							</div>
							<div>
								<span
									className="text-sm font-medium dark:text-gray-400"
									style={{ color: 'var(--text-tertiary)' }}
								>
									Last Billing:
								</span>
								<span
									className="ml-2 text-sm dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									{businessData.lastBilling}
								</span>
							</div>
						</div>
					</div>

					{/* Active Module Card */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 p-6"
						style={{
							backgroundColor: 'var(--accent-white)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<h2
							className="text-lg font-semibold dark:text-gray-100 mb-4"
							style={{ color: 'var(--text-primary)' }}
						>
							Active Module
						</h2>
						<div className="flex flex-wrap gap-2">
							{businessData.activeModules.map((module, index) => (
								<button
									key={index}
									className="px-4 py-2 text-sm font-medium dark:text-gray-300 dark:bg-gray-700 border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
									style={{
										color: 'var(--text-secondary)',
										backgroundColor: 'var(--bg-primary)',
										borderColor: 'var(--light-gray)'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.backgroundColor = '#E2E8F0';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
									}}
								>
									{module}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Users Tab Content */}
			{activeTab === 'users' && (
				<div>
					{/* Header */}
					<div className="mb-6">
						<h2
							className="text-lg font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							User Management
						</h2>
					</div>

					{/* Users Table */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden mb-6"
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
										borderBottomColor: 'var(--light-gray)'
									}}
								>
									<tr>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Name
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Email
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Role
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
									{paginatedUsers.map((user) => (
										<tr
											key={user.id}
											className="dark:hover:bg-gray-700 transition-colors"
											style={{ borderColor: 'var(--light-gray)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--accent-white)';
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm font-medium dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{user.name}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													{user.email}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm dark:text-gray-400"
													style={{ color: 'var(--text-tertiary)' }}
												>
													{user.role}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination Section */}
					<div className="flex items-center justify-between">
						{/* Showing X of Y */}
						<PaginationSummary
							totalItems={users.length}
							itemsPerPage={itemsPerPage}
							onItemsPerPageChange={(value) => {
								setItemsPerPage(value);
								setCurrentPage(1);
							}}
						/>

						{/* Pagination Controls */}
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
							showEllipsis={true}
							maxVisiblePages={5}
							primaryColor={lineOfBusinessData.primaryColor}
							secondaryColor={lineOfBusinessData.secondaryColor}
							className="mt-0"
						/>
					</div>
				</div>
			)}

			{/* Billing Tab Content */}
			{activeTab === 'billing' && (
				<div>
					{/* Header */}
					<div className="mb-6">
						<h2
							className="text-lg font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Billing History
						</h2>
					</div>

					{/* Billing Table */}
					<div
						className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden mb-6"
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
										borderBottomColor: 'var(--light-gray)'
									}}
								>
									<tr>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Date
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Amount
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Status
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
									{paginatedBilling.map((billing) => (
										<tr
											key={billing.id}
											className="dark:hover:bg-gray-700 transition-colors"
											style={{ borderColor: 'var(--light-gray)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--accent-white)';
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{billing.date}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm font-medium dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{billing.amount}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="inline-flex px-2 py-1 text-xs font-semibold rounded-full dark:bg-green-900/30 dark:text-green-400"
													style={{
														backgroundColor: 'rgba(34, 197, 94, 0.1)',
														color: '#16A34A'
													}}
												>
													{billing.status}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Pagination Section */}
					<div className="flex items-center justify-between">
						{/* Showing X of Y */}
						<PaginationSummary
							totalItems={billingHistory.length}
							itemsPerPage={billingItemsPerPage}
							onItemsPerPageChange={(value) => {
								setBillingItemsPerPage(value);
								setBillingCurrentPage(1);
							}}
						/>

						{/* Pagination Controls */}
						<Pagination
							currentPage={billingCurrentPage}
							totalPages={billingTotalPages}
							onPageChange={setBillingCurrentPage}
							showEllipsis={true}
							maxVisiblePages={5}
							primaryColor={lineOfBusinessData.primaryColor}
							secondaryColor={lineOfBusinessData.secondaryColor}
							className="mt-0"
						/>
					</div>
				</div>
			)}

			{/* Activity Log Tab Content */}
			{activeTab === 'activity-log' && (
				<div>
					{/* Header with Filters and Export */}
					<div className="flex items-center justify-between mb-6">
						<h2
							className="text-lg font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Recent Activity
						</h2>
						<div className="flex items-center gap-3">
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
								style={{
									borderColor: 'var(--light-gray)',
									color: 'var(--text-secondary)',
									backgroundColor: 'var(--accent-white)'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--accent-white)';
								}}
							>
								<CalendarIcon className="w-4 h-4" />
								<span>Last 7 Days</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-2 px-4 py-2 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
								style={{
									borderColor: 'var(--light-gray)',
									color: 'var(--text-secondary)',
									backgroundColor: 'var(--accent-white)'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--accent-white)';
								}}
							>
								<MixerHorizontalIcon className="w-4 h-4" />
								<span>User Role</span>
							</button>
							<Button
								variant="primary"
								size="md"
								onClick={() => {
									console.log('Export Logs clicked');
									// Implement export functionality
								}}
							>
								<UploadIcon className="w-4 h-4" />
								<span>Export Logs</span>
							</Button>
						</div>
					</div>

					{/* Activity Log Table */}
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
										borderBottomColor: 'var(--light-gray)'
									}}
								>
									<tr>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Timestamp
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											User
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Action
										</th>
										<th
											className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider"
											style={{ color: 'var(--text-primary)' }}
										>
											Details
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
									{activityLog.map((activity) => (
										<tr
											key={activity.id}
											className="dark:hover:bg-gray-700 transition-colors"
											style={{ borderColor: 'var(--light-gray)' }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = 'var(--accent-white)';
											}}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{activity.timestamp}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="flex flex-col">
													<span
														className="text-sm font-medium dark:text-gray-100"
														style={{ color: 'var(--text-primary)' }}
													>
														{activity.user}
													</span>
													<span
														className="text-sm dark:text-gray-400"
														style={{ color: 'var(--text-tertiary)' }}
													>
														{activity.role}
													</span>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className="text-sm dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{activity.action}
												</span>
											</td>
											<td className="px-6 py-4">
												<span
													className="text-sm dark:text-gray-100"
													style={{ color: 'var(--text-primary)' }}
												>
													{renderDetails(activity.details)}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}

			{/* Deactivate Business Modal */}
			<DeactivateBusinessModal
				isOpen={isDeactivateModalOpen}
				onClose={() => setIsDeactivateModalOpen(false)}
				onConfirm={handleConfirmDeactivate}
				businessName={businessData.businessName}
			/>
		</div>
	);
};

export default BusinessDetailPage;

